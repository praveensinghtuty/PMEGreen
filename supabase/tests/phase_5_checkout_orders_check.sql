begin;

create temp table phase_5_check_results (
  check_name text not null,
  passed boolean not null
) on commit drop;

create temp table phase_5_created_orders (
  payment_kind text not null,
  order_id uuid not null
) on commit drop;

grant insert, select on phase_5_check_results to authenticated;
grant insert, select on phase_5_created_orders to authenticated;

insert into auth.users (
  id,
  aud,
  role,
  email,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '50000000-0000-4000-8000-000000000001',
    'authenticated',
    'authenticated',
    'phase5-customer-a@example.test',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '50000000-0000-4000-8000-000000000002',
    'authenticated',
    'authenticated',
    'phase5-customer-b@example.test',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  )
on conflict (id) do nothing;

insert into public.profiles (id, email)
values
  ('50000000-0000-4000-8000-000000000001', 'phase5-customer-a@example.test'),
  ('50000000-0000-4000-8000-000000000002', 'phase5-customer-b@example.test')
on conflict (id) do update
set email = excluded.email;

insert into public.user_roles (user_id, role)
values
  ('50000000-0000-4000-8000-000000000001', 'customer'),
  ('50000000-0000-4000-8000-000000000002', 'customer')
on conflict (user_id, role) do nothing;

insert into public.categories (id, name, slug, is_active)
values (
  '50000000-0000-4000-8000-000000000101',
  'Phase 5 Verification',
  'phase-5-verification',
  true
);

insert into public.products (id, category_id, name, slug, status)
values (
  '50000000-0000-4000-8000-000000000201',
  '50000000-0000-4000-8000-000000000101',
  'Phase 5 Product',
  'phase-5-product',
  'active'
);

insert into public.product_variants (
  id,
  product_id,
  name,
  sku,
  price,
  stock_quantity,
  track_inventory,
  is_default,
  is_active
)
values (
  '50000000-0000-4000-8000-000000000301',
  '50000000-0000-4000-8000-000000000201',
  'Phase 5 Variant',
  'PHASE5',
  250,
  5,
  true,
  true,
  true
);

insert into public.site_settings (key, value, is_public)
values
  ('shipping.default_charge', '40'::jsonb, true),
  ('payment.upi_id', '"phase5@upi"'::jsonb, true)
on conflict (key) do update
set value = excluded.value,
    is_public = excluded.is_public;

insert into public.addresses (
  id,
  user_id,
  label,
  full_name,
  phone,
  address_line_1,
  city,
  district,
  state,
  postal_code,
  is_default
)
values
  (
    '50000000-0000-4000-8000-000000000401',
    '50000000-0000-4000-8000-000000000001',
    'Home',
    'Phase Five Customer A',
    '9876543210',
    '12 Test Street',
    'Chennai',
    'Chennai',
    'Tamil Nadu',
    '600001',
    true
  ),
  (
    '50000000-0000-4000-8000-000000000402',
    '50000000-0000-4000-8000-000000000002',
    'Other',
    'Phase Five Customer B',
    '9876543211',
    '99 Other Street',
    'Chennai',
    'Chennai',
    'Tamil Nadu',
    '600002',
    true
  );

insert into public.carts (id, user_id)
values (
  '50000000-0000-4000-8000-000000000501',
  '50000000-0000-4000-8000-000000000001'
)
on conflict (user_id) do update
set updated_at = now();

insert into public.cart_items (
  cart_id,
  variant_id,
  quantity
)
select carts.id, '50000000-0000-4000-8000-000000000301', 2
from public.carts
where carts.user_id = '50000000-0000-4000-8000-000000000001'
on conflict (cart_id, variant_id) do update
set quantity = excluded.quantity;

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '50000000-0000-4000-8000-000000000001',
  true
);

do $$
begin
  perform public.place_customer_order(
    '50000000-0000-4000-8000-000000000402',
    'cod',
    null,
    null,
    'phase5-wrong-address-key'
  );

  insert into phase_5_check_results (check_name, passed)
  values ('checkout_rejects_another_customer_address', false);
exception
  when check_violation then
    insert into phase_5_check_results (check_name, passed)
    values ('checkout_rejects_another_customer_address', true);
end $$;

insert into phase_5_created_orders (payment_kind, order_id)
select 'cod', order_id
from public.place_customer_order(
  '50000000-0000-4000-8000-000000000401',
  'cod',
  null,
  'Leave near the door',
  'phase5-cod-idempotency-key'
);

insert into phase_5_check_results (check_name, passed)
select
  'cod_order_snapshot_totals_status_and_payment',
  exists (
    select 1
    from public.orders
    join phase_5_created_orders on phase_5_created_orders.order_id = orders.id
    where phase_5_created_orders.payment_kind = 'cod'
      and orders.status = 'placed'
      and orders.payment_method = 'cod'
      and orders.payment_status = 'pending'
      and orders.subtotal = 500
      and orders.shipping_charge = 40
      and orders.total_amount = 540
      and orders.upi_transaction_reference is null
      and orders.shipping_address ->> 'source_address_id' = '50000000-0000-4000-8000-000000000401'
  );

insert into phase_5_check_results (check_name, passed)
select
  'order_items_are_purchase_snapshots',
  exists (
    select 1
    from public.order_items
    join phase_5_created_orders on phase_5_created_orders.order_id = order_items.order_id
    where phase_5_created_orders.payment_kind = 'cod'
      and order_items.product_name = 'Phase 5 Product'
      and order_items.variant_name = 'Phase 5 Variant'
      and order_items.sku = 'PHASE5'
      and order_items.quantity = 2
      and order_items.unit_price = 250
      and order_items.line_total = 500
  );

insert into phase_5_check_results (check_name, passed)
select
  'status_history_created',
  exists (
    select 1
    from public.order_status_history
    join phase_5_created_orders on phase_5_created_orders.order_id = order_status_history.order_id
    where phase_5_created_orders.payment_kind = 'cod'
      and order_status_history.from_status is null
      and order_status_history.to_status = 'placed'
  );

insert into phase_5_check_results (check_name, passed)
select
  'stock_decremented_and_cart_cleared',
  exists (
    select 1
    from public.product_variants
    where id = '50000000-0000-4000-8000-000000000301'
      and stock_quantity = 3
  )
  and not exists (
    select 1
    from public.cart_items
    join public.carts on carts.id = cart_items.cart_id
    where carts.user_id = auth.uid()
  );

insert into phase_5_check_results (check_name, passed)
select
  'duplicate_submission_returns_existing_order',
  (
    select count(*) = 1
    from public.orders
    where user_id = auth.uid()
  )
  and exists (
    select 1
    from public.place_customer_order(
      '50000000-0000-4000-8000-000000000401',
      'cod',
      null,
      null,
      'phase5-cod-idempotency-key'
    ) as retry
    join phase_5_created_orders on phase_5_created_orders.order_id = retry.order_id
    where phase_5_created_orders.payment_kind = 'cod'
  );

update public.products
set name = 'Edited Product Name'
where id = '50000000-0000-4000-8000-000000000201';

update public.product_variants
set name = 'Edited Variant Name',
    price = 999
where id = '50000000-0000-4000-8000-000000000301';

update public.addresses
set full_name = 'Edited Address Name',
    address_line_1 = 'Edited Address Line'
where id = '50000000-0000-4000-8000-000000000401';

insert into phase_5_check_results (check_name, passed)
select
  'order_snapshot_survives_source_edits',
  exists (
    select 1
    from public.orders
    join public.order_items on order_items.order_id = orders.id
    join phase_5_created_orders on phase_5_created_orders.order_id = orders.id
    where phase_5_created_orders.payment_kind = 'cod'
      and orders.customer_name = 'Phase Five Customer A'
      and orders.shipping_address ->> 'address_line_1' = '12 Test Street'
      and order_items.product_name = 'Phase 5 Product'
      and order_items.variant_name = 'Phase 5 Variant'
      and order_items.unit_price = 250
  );

insert into public.cart_items (
  cart_id,
  variant_id,
  quantity
)
select carts.id, '50000000-0000-4000-8000-000000000301', 1
from public.carts
where carts.user_id = auth.uid();

insert into phase_5_created_orders (payment_kind, order_id)
select 'upi', order_id
from public.place_customer_order(
  '50000000-0000-4000-8000-000000000401',
  'upi',
  'UPI-REF-123456',
  null,
  'phase5-upi-idempotency-key'
);

insert into phase_5_check_results (check_name, passed)
select
  'upi_order_is_pending_with_reference',
  exists (
    select 1
    from public.orders
    join phase_5_created_orders on phase_5_created_orders.order_id = orders.id
    where phase_5_created_orders.payment_kind = 'upi'
      and orders.payment_method = 'upi'
      and orders.payment_status = 'pending'
      and orders.upi_transaction_reference = 'UPI-REF-123456'
  );

select set_config(
  'request.jwt.claim.sub',
  '50000000-0000-4000-8000-000000000002',
  true
);

insert into phase_5_check_results (check_name, passed)
select
  'customer_cannot_read_another_customer_addresses',
  not exists (
    select 1
    from public.addresses
    where user_id = '50000000-0000-4000-8000-000000000001'
  );

insert into phase_5_check_results (check_name, passed)
select
  'customer_cannot_read_another_customer_orders',
  not exists (
    select 1
    from public.orders
    where user_id = '50000000-0000-4000-8000-000000000001'
  );

insert into phase_5_check_results (check_name, passed)
select
  'customer_cannot_read_another_customer_order_items',
  not exists (
    select 1
    from public.order_items
  );

insert into phase_5_check_results (check_name, passed)
select
  'customer_cannot_read_another_customer_order_history',
  not exists (
    select 1
    from public.order_status_history
  );

select check_name, passed
from phase_5_check_results
order by check_name;

rollback;
