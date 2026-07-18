begin;

create temp table phase_6_check_results (
  check_name text not null,
  passed boolean not null
) on commit drop;

grant insert, select on phase_6_check_results to authenticated;

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
    '60000000-0000-4000-8000-000000000001',
    'authenticated',
    'authenticated',
    'phase6-admin@example.test',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '60000000-0000-4000-8000-000000000002',
    'authenticated',
    'authenticated',
    'phase6-customer@example.test',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  )
on conflict (id) do nothing;

insert into public.profiles (id, email)
values
  ('60000000-0000-4000-8000-000000000001', 'phase6-admin@example.test'),
  ('60000000-0000-4000-8000-000000000002', 'phase6-customer@example.test')
on conflict (id) do update
set email = excluded.email;

insert into public.user_roles (user_id, role)
values
  ('60000000-0000-4000-8000-000000000001', 'admin'),
  ('60000000-0000-4000-8000-000000000002', 'customer')
on conflict (user_id, role) do nothing;

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '60000000-0000-4000-8000-000000000002',
  true
);

do $$
begin
  insert into public.categories (id, name, slug, is_active)
  values (
    '60000000-0000-4000-8000-000000000101',
    'Denied Category',
    'denied-category',
    true
  );
  insert into phase_6_check_results (check_name, passed)
  values ('customer_cannot_insert_admin_category', false);
exception
  when insufficient_privilege or check_violation then
    insert into phase_6_check_results (check_name, passed)
    values ('customer_cannot_insert_admin_category', true);
end $$;

select set_config(
  'request.jwt.claim.sub',
  '60000000-0000-4000-8000-000000000001',
  true
);

insert into public.categories (id, name, slug, is_active)
values (
  '60000000-0000-4000-8000-000000000101',
  'Phase 6 Admin Category',
  'phase-6-admin-category',
  true
);

insert into public.products (
  id,
  category_id,
  name,
  slug,
  status
)
values (
  '60000000-0000-4000-8000-000000000201',
  '60000000-0000-4000-8000-000000000101',
  'Phase 6 Admin Product',
  'phase-6-admin-product',
  'draft'
);

insert into public.product_variants (
  id,
  product_id,
  name,
  sku,
  price,
  stock_quantity,
  track_inventory,
  is_active
)
values (
  '60000000-0000-4000-8000-000000000301',
  '60000000-0000-4000-8000-000000000201',
  'Phase 6 Variant',
  'PHASE6',
  100,
  7,
  true,
  true
);

insert into public.product_images (
  id,
  product_id,
  storage_path,
  alt_text,
  is_primary
)
values (
  '60000000-0000-4000-8000-000000000401',
  '60000000-0000-4000-8000-000000000201',
  'phase6/test.png',
  'Phase 6 image',
  true
);

insert into public.site_settings (key, value, is_public)
values ('business.name', '"Phase 6 Store"'::jsonb, true)
on conflict (key) do update
set value = excluded.value,
    is_public = excluded.is_public;

insert into phase_6_check_results (check_name, passed)
select
  'admin_can_manage_catalog_and_settings',
  exists (
    select 1
    from public.products
    join public.product_variants on product_variants.product_id = products.id
    join public.product_images on product_images.product_id = products.id
    where products.id = '60000000-0000-4000-8000-000000000201'
      and product_variants.sku = 'PHASE6'
      and product_images.storage_path = 'phase6/test.png'
  )
  and exists (
    select 1
    from public.site_settings
    where key = 'business.name'
      and value = '"Phase 6 Store"'::jsonb
  );

insert into public.orders (
  id,
  order_number,
  user_id,
  payment_method,
  payment_status,
  subtotal,
  shipping_charge,
  discount_amount,
  total_amount,
  customer_name,
  customer_phone,
  shipping_address
)
values (
  '60000000-0000-4000-8000-000000000501',
  'PME-PHASE6',
  '60000000-0000-4000-8000-000000000002',
  'upi',
  'pending',
  100,
  40,
  0,
  140,
  'Phase 6 Customer',
  '9876543210',
  '{"full_name":"Phase 6 Customer","phone":"9876543210","address_line_1":"Line","city":"Chennai","district":"Chennai","state":"Tamil Nadu","postal_code":"600001"}'::jsonb
);

select public.admin_update_order(
  '60000000-0000-4000-8000-000000000501',
  'confirmed',
  'paid',
  'Courier',
  'TRACK123',
  'https://example.test/track',
  'Admin note',
  'Confirmed and payment verified'
);

insert into phase_6_check_results (check_name, passed)
select
  'admin_order_update_appends_history_and_verifies_payment',
  exists (
    select 1
    from public.orders
    where id = '60000000-0000-4000-8000-000000000501'
      and status = 'confirmed'
      and payment_status = 'paid'
      and payment_verified_by = auth.uid()
      and tracking_number = 'TRACK123'
  )
  and exists (
    select 1
    from public.order_status_history
    where order_id = '60000000-0000-4000-8000-000000000501'
      and from_status = 'placed'
      and to_status = 'confirmed'
      and changed_by = auth.uid()
  );

select set_config(
  'request.jwt.claim.sub',
  '60000000-0000-4000-8000-000000000002',
  true
);

do $$
begin
  perform public.admin_update_order(
    '60000000-0000-4000-8000-000000000501',
    'packed',
    null,
    null,
    null,
    null,
    null,
    null
  );
  insert into phase_6_check_results (check_name, passed)
  values ('customer_cannot_call_admin_order_rpc', false);
exception
  when invalid_authorization_specification then
    insert into phase_6_check_results (check_name, passed)
    values ('customer_cannot_call_admin_order_rpc', true);
end $$;

select check_name, passed
from phase_6_check_results
order by check_name;

rollback;
