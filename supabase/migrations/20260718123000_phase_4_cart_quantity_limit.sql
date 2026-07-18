create or replace function public.add_active_variant_to_cart(
  p_variant_id uuid,
  p_quantity integer default 1
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_cart_id uuid;
  v_item_id uuid;
  v_stock_quantity integer;
  v_track_inventory boolean;
begin
  if v_user_id is null then
    raise exception 'Authentication required'
      using errcode = '28000';
  end if;

  if p_variant_id is null or p_quantity is null or p_quantity < 1 or p_quantity > 99 then
    raise exception 'Invalid cart item'
      using errcode = '23514';
  end if;

  select product_variants.stock_quantity, product_variants.track_inventory
    into v_stock_quantity, v_track_inventory
  from public.product_variants
  join public.products on products.id = product_variants.product_id
  join public.categories on categories.id = products.category_id
  where product_variants.id = p_variant_id
    and product_variants.is_active = true
    and products.status = 'active'
    and categories.is_active = true;

  if not found then
    raise exception 'Variant is not available'
      using errcode = '23514';
  end if;

  insert into public.carts (user_id)
  values (v_user_id)
  on conflict (user_id) do update
    set updated_at = now()
  returning id into v_cart_id;

  insert into public.cart_items (cart_id, variant_id, quantity)
  values (v_cart_id, p_variant_id, p_quantity)
  on conflict (cart_id, variant_id) do update
    set quantity = cart_items.quantity + excluded.quantity,
        updated_at = now()
    where cart_items.quantity + excluded.quantity <= 99
      and (
        not v_track_inventory
        or v_stock_quantity >= cart_items.quantity + excluded.quantity
      )
  returning id into v_item_id;

  if v_item_id is null then
    raise exception 'Requested quantity is unavailable'
      using errcode = '23514';
  end if;

  update public.carts
    set updated_at = now()
  where id = v_cart_id;

  return v_item_id;
end;
$$;
