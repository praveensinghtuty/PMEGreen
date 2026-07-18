-- Manual Phase 2 RLS checks for a local Supabase database.
-- Run after applying migrations. The transaction rolls back all test data.

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
values
  (
    '00000000-0000-0000-0000-0000000000a1',
    'customer-a@example.test',
    'test',
    now(),
    '{}'::jsonb,
    '{"full_name":"Customer A"}'::jsonb,
    'authenticated',
    'authenticated'
  ),
  (
    '00000000-0000-0000-0000-0000000000b2',
    'customer-b@example.test',
    'test',
    now(),
    '{}'::jsonb,
    '{"full_name":"Customer B"}'::jsonb,
    'authenticated',
    'authenticated'
  ),
  (
    '00000000-0000-0000-0000-0000000000ad',
    'admin@example.test',
    'test',
    now(),
    '{}'::jsonb,
    '{"full_name":"Admin User"}'::jsonb,
    'authenticated',
    'authenticated'
  )
on conflict (id) do nothing;

insert into public.user_roles (user_id, role)
values ('00000000-0000-0000-0000-0000000000ad', 'admin')
on conflict (user_id, role) do nothing;

insert into public.addresses (
  id,
  user_id,
  label,
  full_name,
  phone,
  address_line_1,
  city,
  district,
  postal_code,
  is_default
)
values (
  '10000000-0000-0000-0000-0000000000a1',
  '00000000-0000-0000-0000-0000000000a1',
  'Home',
  'Customer A',
  '9999999999',
  'Line 1',
  'Chennai',
  'Chennai',
  '600001',
  true
)
on conflict (id) do nothing;

set local role authenticated;

select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000b2","role":"authenticated"}',
  true
);

do $$
begin
  if exists (
    select 1
    from public.addresses
    where id = '10000000-0000-0000-0000-0000000000a1'
  ) then
    raise exception 'Customer B can read Customer A address';
  end if;
end;
$$;

do $$
begin
  begin
    insert into public.user_roles (user_id, role)
    values ('00000000-0000-0000-0000-0000000000b2', 'admin');
    raise exception 'Non-admin inserted an admin role';
  exception
    when insufficient_privilege then null;
    when check_violation then null;
  end;
end;
$$;

select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000ad","role":"authenticated"}',
  true
);

do $$
begin
  if not exists (
    select 1
    from public.addresses
    where id = '10000000-0000-0000-0000-0000000000a1'
  ) then
    raise exception 'Admin cannot read customer address';
  end if;
end;
$$;

rollback;
