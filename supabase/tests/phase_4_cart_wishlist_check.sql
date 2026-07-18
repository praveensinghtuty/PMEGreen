begin;

create temp table phase_4_check_results (
  check_name text not null,
  passed boolean not null
) on commit drop;

grant insert, select on phase_4_check_results to authenticated;

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
    '40000000-0000-4000-8000-000000000001',
    'authenticated',
    'authenticated',
    'phase4-customer-a@example.test',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '40000000-0000-4000-8000-000000000002',
    'authenticated',
    'authenticated',
    'phase4-customer-b@example.test',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  )
on conflict (id) do nothing;

insert into public.profiles (id, email)
values
  (
    '40000000-0000-4000-8000-000000000001',
    'phase4-customer-a@example.test'
  ),
  (
    '40000000-0000-4000-8000-000000000002',
    'phase4-customer-b@example.test'
  )
on conflict (id) do update
set email = excluded.email;

insert into public.user_roles (user_id, role)
values
  ('40000000-0000-4000-8000-000000000001', 'customer'),
  ('40000000-0000-4000-8000-000000000002', 'customer')
on conflict (user_id, role) do nothing;

insert into public.product_variants (
  id,
  product_id,
  name,
  value,
  unit,
  price,
  stock_quantity,
  track_inventory,
  is_default,
  is_active,
  sort_order
)
values (
  '40000000-0000-4000-8000-000000000201',
  '30000000-0000-4000-8000-000000000101',
  'Phase 4 quantity limit option',
  1,
  'piece',
  100,
  0,
  false,
  false,
  true,
  99
);

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '40000000-0000-4000-8000-000000000001',
  true
);

select public.add_active_variant_to_cart(
  '30000000-0000-4000-8000-000000000201',
  1
);
select public.add_active_variant_to_cart(
  '30000000-0000-4000-8000-000000000201',
  1
);
select public.add_active_product_to_wishlist(
  '30000000-0000-4000-8000-000000000101'
);
select public.add_active_product_to_wishlist(
  '30000000-0000-4000-8000-000000000101'
);

select public.add_active_variant_to_cart(
  '40000000-0000-4000-8000-000000000201',
  99
);

do $$
begin
  perform public.add_active_variant_to_cart(
    '40000000-0000-4000-8000-000000000201',
    1
  );

  insert into phase_4_check_results (check_name, passed)
  values ('cart_rejects_increment_over_quantity_limit', false);
exception
  when check_violation then
    insert into phase_4_check_results (check_name, passed)
    values ('cart_rejects_increment_over_quantity_limit', true);
end $$;

insert into phase_4_check_results (check_name, passed)
select
  'cart_duplicate_add_increments_quantity',
  exists (
    select 1
    from public.carts
    join public.cart_items on cart_items.cart_id = carts.id
    where carts.user_id = auth.uid()
      and cart_items.variant_id = '30000000-0000-4000-8000-000000000201'
      and cart_items.quantity = 2
  );

insert into phase_4_check_results (check_name, passed)
select
  'wishlist_duplicate_add_is_deduped',
  (
    select count(*) = 1
    from public.wishlists
    join public.wishlist_items on wishlist_items.wishlist_id = wishlists.id
    where wishlists.user_id = auth.uid()
      and wishlist_items.product_id = '30000000-0000-4000-8000-000000000101'
  );

select set_config(
  'request.jwt.claim.sub',
  '40000000-0000-4000-8000-000000000002',
  true
);

insert into phase_4_check_results (check_name, passed)
select
  'customer_cannot_read_other_customer_cart',
  not exists (
    select 1
    from public.carts
    where user_id = '40000000-0000-4000-8000-000000000001'
  );

insert into phase_4_check_results (check_name, passed)
select
  'customer_cannot_read_other_customer_cart_items',
  (select count(*) = 0 from public.cart_items);

insert into phase_4_check_results (check_name, passed)
select
  'customer_cannot_read_other_customer_wishlist',
  not exists (
    select 1
    from public.wishlists
    where user_id = '40000000-0000-4000-8000-000000000001'
  );

insert into phase_4_check_results (check_name, passed)
select
  'customer_cannot_read_other_customer_wishlist_items',
  (select count(*) = 0 from public.wishlist_items);

select check_name, passed
from phase_4_check_results
order by check_name;

rollback;
