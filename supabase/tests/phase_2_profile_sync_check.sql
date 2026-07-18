-- Manual Phase 2 profile synchronization check.
-- Run after migrations. The transaction rolls back all test data.

begin;

insert into auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
)
values (
  '00000000-0000-0000-0000-00000000f2f2',
  'phase2-sync@example.test',
  'test',
  now(),
  '{}'::jsonb,
  '{"full_name":"Phase Two Sync"}'::jsonb,
  'authenticated',
  'authenticated'
)
on conflict (id) do nothing;

select
  'profile_sync' as check_name,
  exists (
    select 1
    from public.profiles
    where id = '00000000-0000-0000-0000-00000000f2f2'
      and email = 'phase2-sync@example.test'
      and full_name = 'Phase Two Sync'
  ) as passed
union all
select
  'customer_role',
  exists (
    select 1
    from public.user_roles
    where user_id = '00000000-0000-0000-0000-00000000f2f2'
      and role = 'customer'
  )
union all
select
  'cart_created',
  exists (
    select 1
    from public.carts
    where user_id = '00000000-0000-0000-0000-00000000f2f2'
  )
union all
select
  'wishlist_created',
  exists (
    select 1
    from public.wishlists
    where user_id = '00000000-0000-0000-0000-00000000f2f2'
  );

rollback;
