create table if not exists public.checkout_idempotency_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  idempotency_key text not null,
  order_id uuid references public.orders(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint checkout_idempotency_keys_key_not_blank check (length(btrim(idempotency_key)) >= 16),
  constraint checkout_idempotency_keys_user_key_unique unique (user_id, idempotency_key)
);

alter table public.checkout_idempotency_keys enable row level security;

create policy "checkout_idempotency_keys_select_own_or_admin"
  on public.checkout_idempotency_keys for select
  using (user_id = auth.uid() or public.is_admin());

create or replace function public.place_customer_order(
  p_address_id uuid,
  p_payment_method public.payment_method,
  p_upi_transaction_reference text default null,
  p_customer_notes text default null,
  p_idempotency_key text default null
)
returns table(order_id uuid, order_number text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile public.profiles%rowtype;
  v_address public.addresses%rowtype;
  v_cart_id uuid;
  v_subtotal numeric(10, 2) := 0;
  v_shipping_charge numeric(10, 2) := 0;
  v_total numeric(10, 2) := 0;
  v_order_id uuid;
  v_order_number text;
  v_existing_order_id uuid;
  v_existing_order_number text;
  v_key text := nullif(btrim(coalesce(p_idempotency_key, '')), '');
  v_upi_reference text := nullif(btrim(coalesce(p_upi_transaction_reference, '')), '');
  v_customer_notes text := nullif(btrim(coalesce(p_customer_notes, '')), '');
  v_cart_item_count integer;
  v_stock_item record;
begin
  if v_user_id is null then
    raise exception 'Authentication required'
      using errcode = '28000';
  end if;

  if v_key is null or length(v_key) < 16 or length(v_key) > 120 then
    raise exception 'Invalid checkout submission'
      using errcode = '23514';
  end if;

  select * into v_profile
  from public.profiles
  where id = v_user_id
    and is_active = true;

  if not found then
    raise exception 'Customer profile is not active'
      using errcode = '28000';
  end if;

  select * into v_address
  from public.addresses
  where id = p_address_id
    and user_id = v_user_id;

  if not found then
    raise exception 'Shipping address was not found'
      using errcode = '23514';
  end if;

  if lower(btrim(v_address.state)) <> 'tamil nadu'
    or v_address.postal_code !~ '^[0-9]{6}$'
    or v_address.phone !~ '^[6-9][0-9]{9}$'
    or length(btrim(v_address.city)) = 0
    or length(btrim(v_address.district)) = 0
    or length(btrim(v_address.address_line_1)) = 0
  then
    raise exception 'Unsupported shipping address'
      using errcode = '23514';
  end if;

  if p_payment_method not in ('cod', 'upi') then
    raise exception 'Unsupported payment method'
      using errcode = '23514';
  end if;

  if p_payment_method = 'upi' and (v_upi_reference is null or length(v_upi_reference) < 6 or length(v_upi_reference) > 80) then
    raise exception 'Enter a valid UPI transaction reference'
      using errcode = '23514';
  end if;

  if p_payment_method = 'cod' then
    v_upi_reference := null;
  end if;

  insert into public.checkout_idempotency_keys (user_id, idempotency_key)
  values (v_user_id, v_key)
  on conflict (user_id, idempotency_key) do nothing;

  select checkout_idempotency_keys.order_id, orders.order_number
    into v_existing_order_id, v_existing_order_number
  from public.checkout_idempotency_keys
  left join public.orders on orders.id = checkout_idempotency_keys.order_id
  where checkout_idempotency_keys.user_id = v_user_id
    and checkout_idempotency_keys.idempotency_key = v_key
  for update of checkout_idempotency_keys;

  if v_existing_order_id is not null then
    order_id := v_existing_order_id;
    order_number := v_existing_order_number;
    return next;
    return;
  end if;

  select id into v_cart_id
  from public.carts
  where user_id = v_user_id
  for update;

  if not found then
    raise exception 'Cart is empty'
      using errcode = '23514';
  end if;

  select count(*) into v_cart_item_count
  from public.cart_items
  where cart_id = v_cart_id;

  if v_cart_item_count = 0 then
    raise exception 'Cart is empty'
      using errcode = '23514';
  end if;

  for v_cart_item_count in
    select 1
    from public.cart_items
    join public.product_variants on product_variants.id = cart_items.variant_id
    join public.products on products.id = product_variants.product_id
    join public.categories on categories.id = products.category_id
    where cart_items.cart_id = v_cart_id
      and (
        cart_items.quantity < 1
        or cart_items.quantity > 99
        or product_variants.is_active is not true
        or products.status <> 'active'
        or categories.is_active is not true
        or (
          product_variants.track_inventory
          and product_variants.stock_quantity < cart_items.quantity
        )
      )
  loop
    raise exception 'Cart contains unavailable items'
      using errcode = '23514';
  end loop;

  select coalesce(sum(cart_items.quantity * product_variants.price), 0)
    into v_subtotal
  from public.cart_items
  join public.product_variants on product_variants.id = cart_items.variant_id
  join public.products on products.id = product_variants.product_id
  join public.categories on categories.id = products.category_id
  where cart_items.cart_id = v_cart_id
    and cart_items.quantity between 1 and 99
    and product_variants.is_active = true
    and products.status = 'active'
    and categories.is_active = true;

  if v_subtotal <= 0 then
    raise exception 'Cart is empty'
      using errcode = '23514';
  end if;

  select coalesce((value #>> '{}')::numeric, 0)
    into v_shipping_charge
  from public.site_settings
  where key = 'shipping.default_charge';

  v_shipping_charge := greatest(coalesce(v_shipping_charge, 0), 0);
  v_total := v_subtotal + v_shipping_charge;
  v_order_number := 'PME-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  insert into public.orders (
    order_number,
    user_id,
    status,
    payment_method,
    payment_status,
    subtotal,
    shipping_charge,
    discount_amount,
    total_amount,
    customer_name,
    customer_phone,
    customer_email,
    shipping_address,
    customer_notes,
    upi_transaction_reference
  )
  values (
    v_order_number,
    v_user_id,
    'placed',
    p_payment_method,
    'pending',
    v_subtotal,
    v_shipping_charge,
    0,
    v_total,
    v_address.full_name,
    v_address.phone,
    v_profile.email,
    jsonb_build_object(
      'label', v_address.label,
      'full_name', v_address.full_name,
      'phone', v_address.phone,
      'address_line_1', v_address.address_line_1,
      'address_line_2', v_address.address_line_2,
      'landmark', v_address.landmark,
      'city', v_address.city,
      'district', v_address.district,
      'state', v_address.state,
      'postal_code', v_address.postal_code
    ),
    v_customer_notes,
    v_upi_reference
  )
  returning id into v_order_id;

  insert into public.order_items (
    order_id,
    product_id,
    variant_id,
    product_name,
    variant_name,
    sku,
    quantity,
    unit_price,
    line_total
  )
  select
    v_order_id,
    products.id,
    product_variants.id,
    products.name,
    product_variants.name,
    product_variants.sku,
    cart_items.quantity,
    product_variants.price,
    cart_items.quantity * product_variants.price
  from public.cart_items
  join public.product_variants on product_variants.id = cart_items.variant_id
  join public.products on products.id = product_variants.product_id
  where cart_items.cart_id = v_cart_id;

  insert into public.order_status_history (
    order_id,
    from_status,
    to_status,
    changed_by,
    note
  )
  values (
    v_order_id,
    null,
    'placed',
    v_user_id,
    'Order placed by customer'
  );

  for v_stock_item in
    select cart_items.variant_id, cart_items.quantity
    from public.cart_items
    join public.product_variants on product_variants.id = cart_items.variant_id
    where cart_items.cart_id = v_cart_id
      and product_variants.track_inventory = true
    order by cart_items.variant_id
  loop
    update public.product_variants
    set stock_quantity = stock_quantity - v_stock_item.quantity,
        updated_at = now()
    where id = v_stock_item.variant_id
      and stock_quantity >= v_stock_item.quantity;

    if not found then
      raise exception 'Insufficient stock'
        using errcode = '23514';
    end if;
  end loop;

  delete from public.cart_items
  where cart_id = v_cart_id;

  update public.checkout_idempotency_keys
  set order_id = v_order_id
  where user_id = v_user_id
    and idempotency_key = v_key;

  order_id := v_order_id;
  order_number := v_order_number;
  return next;
end;
$$;
