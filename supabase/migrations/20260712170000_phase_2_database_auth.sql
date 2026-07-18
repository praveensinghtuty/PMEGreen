-- Phase 2: Database and authentication foundation.
-- This migration intentionally does not import product-catalog.csv.

create extension if not exists pgcrypto with schema extensions;

create type public.app_role as enum ('customer', 'admin');
create type public.product_status as enum ('draft', 'active', 'inactive');
create type public.variant_unit as enum ('ml', 'l', 'g', 'kg', 'piece', 'pack', 'other');
create type public.order_status as enum ('placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled');
create type public.payment_method as enum ('cod', 'upi');
create type public.payment_status as enum ('pending', 'paid', 'failed', 'refunded');
create type public.banner_link_type as enum ('product', 'category', 'external', 'none');
create type public.homepage_section_type as enum (
  'hero',
  'categories',
  'featured_products',
  'best_sellers',
  'product_category',
  'why_choose_us',
  'brand_story',
  'faq',
  'contact'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  email text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  constraint user_roles_user_id_role_key unique (user_id, role)
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text not null,
  full_name text not null,
  phone text not null,
  address_line_1 text not null,
  address_line_2 text,
  landmark text,
  city text not null,
  district text not null,
  state text not null default 'Tamil Nadu',
  postal_code text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint addresses_tamil_nadu_only check (lower(btrim(state)) = 'tamil nadu'),
  constraint addresses_postal_code_shape check (postal_code ~ '^[0-9]{6}$')
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_path text,
  parent_id uuid references public.categories(id) on delete restrict,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_slug_shape check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint categories_no_self_parent check (parent_id is null or parent_id <> id)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  name text not null,
  slug text not null unique,
  short_description text,
  description text,
  benefits text,
  ingredients text,
  usage_instructions text,
  storage_instructions text,
  shelf_life text,
  is_featured boolean not null default false,
  is_bestseller boolean not null default false,
  status public.product_status not null default 'draft',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_slug_shape check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  sku text unique,
  value numeric,
  unit public.variant_unit,
  price numeric(10, 2) not null,
  compare_at_price numeric(10, 2),
  stock_quantity integer not null default 0,
  track_inventory boolean not null default true,
  is_default boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_variants_price_nonnegative check (price >= 0),
  constraint product_variants_compare_price_nonnegative check (compare_at_price is null or compare_at_price >= 0),
  constraint product_variants_compare_price_above_price check (compare_at_price is null or compare_at_price >= price),
  constraint product_variants_stock_nonnegative check (stock_quantity >= 0),
  constraint product_variants_value_unit_together check (
    (value is null and unit is null) or (value is not null and unit is not null)
  ),
  constraint product_variants_value_positive check (value is null or value > 0)
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  is_primary boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint product_images_storage_path_not_blank check (length(btrim(storage_path)) > 0)
);

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  quantity integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cart_items_cart_id_variant_id_key unique (cart_id, variant_id),
  constraint cart_items_quantity_positive check (quantity > 0)
);

create table public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid not null references public.wishlists(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint wishlist_items_wishlist_id_product_id_key unique (wishlist_id, product_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid not null references public.profiles(id) on delete restrict,
  status public.order_status not null default 'placed',
  payment_method public.payment_method not null,
  payment_status public.payment_status not null default 'pending',
  subtotal numeric(10, 2) not null,
  shipping_charge numeric(10, 2) not null,
  discount_amount numeric(10, 2) not null default 0,
  total_amount numeric(10, 2) not null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  shipping_address jsonb not null,
  customer_notes text,
  admin_notes text,
  courier_name text,
  tracking_number text,
  tracking_url text,
  upi_transaction_reference text,
  payment_verified_at timestamptz,
  payment_verified_by uuid references public.profiles(id) on delete set null,
  placed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_subtotal_nonnegative check (subtotal >= 0),
  constraint orders_shipping_charge_nonnegative check (shipping_charge >= 0),
  constraint orders_discount_amount_nonnegative check (discount_amount >= 0),
  constraint orders_total_amount_nonnegative check (total_amount >= 0),
  constraint orders_total_amount_matches_parts check (total_amount = subtotal + shipping_charge - discount_amount),
  constraint orders_shipping_address_object check (jsonb_typeof(shipping_address) = 'object'),
  constraint orders_payment_verification_consistent check (
    (payment_verified_at is null and payment_verified_by is null)
    or (payment_verified_at is not null and payment_verified_by is not null)
  )
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  variant_name text not null,
  sku text,
  quantity integer not null,
  unit_price numeric(10, 2) not null,
  line_total numeric(10, 2) not null,
  created_at timestamptz not null default now(),
  constraint order_items_quantity_positive check (quantity > 0),
  constraint order_items_unit_price_nonnegative check (unit_price >= 0),
  constraint order_items_line_total_matches check (line_total = quantity * unit_price)
);

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  from_status public.order_status,
  to_status public.order_status not null,
  changed_by uuid references public.profiles(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null,
  description text,
  is_public boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint site_settings_key_shape check (key ~ '^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$')
);

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_path text not null,
  link_type public.banner_link_type not null default 'none',
  link_value text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint banners_link_value_consistent check (
    (link_type = 'none' and link_value is null)
    or (link_type <> 'none' and link_value is not null)
  ),
  constraint banners_time_window_valid check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table public.homepage_sections (
  id uuid primary key default gen_random_uuid(),
  section_type public.homepage_section_type not null,
  title text,
  configuration jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint homepage_sections_configuration_object check (jsonb_typeof(configuration) = 'object')
);

create unique index addresses_one_default_per_user_idx
  on public.addresses(user_id)
  where is_default;

create unique index product_variants_one_default_active_per_product_idx
  on public.product_variants(product_id)
  where is_default and is_active;

create unique index product_images_one_primary_per_product_idx
  on public.product_images(product_id)
  where is_primary;

create index user_roles_user_id_idx on public.user_roles(user_id);
create index addresses_user_id_idx on public.addresses(user_id);
create index categories_parent_id_idx on public.categories(parent_id);
create index categories_active_sort_idx on public.categories(is_active, sort_order, name);
create index products_category_status_sort_idx on public.products(category_id, status, sort_order, name);
create index products_featured_idx on public.products(is_featured, sort_order) where status = 'active';
create index products_bestseller_idx on public.products(is_bestseller, sort_order) where status = 'active';
create index product_variants_product_active_sort_idx on public.product_variants(product_id, is_active, sort_order);
create index product_images_product_sort_idx on public.product_images(product_id, is_primary desc, sort_order);
create index cart_items_cart_id_idx on public.cart_items(cart_id);
create index cart_items_variant_id_idx on public.cart_items(variant_id);
create index wishlist_items_wishlist_id_idx on public.wishlist_items(wishlist_id);
create index orders_user_created_idx on public.orders(user_id, created_at desc);
create index orders_status_created_idx on public.orders(status, created_at desc);
create index orders_payment_status_created_idx on public.orders(payment_status, created_at desc);
create index order_items_order_id_idx on public.order_items(order_id);
create index order_status_history_order_created_idx on public.order_status_history(order_id, created_at);
create index site_settings_public_key_idx on public.site_settings(is_public, key);
create index banners_active_sort_idx on public.banners(is_active, sort_order);
create index homepage_sections_enabled_sort_idx on public.homepage_sections(is_enabled, sort_order);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger addresses_set_updated_at before update on public.addresses
  for each row execute function public.set_updated_at();
create trigger categories_set_updated_at before update on public.categories
  for each row execute function public.set_updated_at();
create trigger products_set_updated_at before update on public.products
  for each row execute function public.set_updated_at();
create trigger product_variants_set_updated_at before update on public.product_variants
  for each row execute function public.set_updated_at();
create trigger carts_set_updated_at before update on public.carts
  for each row execute function public.set_updated_at();
create trigger cart_items_set_updated_at before update on public.cart_items
  for each row execute function public.set_updated_at();
create trigger orders_set_updated_at before update on public.orders
  for each row execute function public.set_updated_at();
create trigger site_settings_set_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();
create trigger banners_set_updated_at before update on public.banners
  for each row execute function public.set_updated_at();
create trigger homepage_sections_set_updated_at before update on public.homepage_sections
  for each row execute function public.set_updated_at();

create or replace function public.has_role(required_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    join public.profiles on profiles.id = user_roles.user_id
    where user_roles.user_id = auth.uid()
      and user_roles.role = required_role
      and profiles.is_active = true
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role('admin'::public.app_role);
$$;

create or replace function public.sync_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  profile_full_name text;
  profile_avatar_url text;
begin
  profile_full_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name'
  );
  profile_avatar_url := new.raw_user_meta_data ->> 'avatar_url';

  insert into public.profiles (id, full_name, phone, email, avatar_url)
  values (new.id, profile_full_name, new.phone, new.email, profile_avatar_url)
  on conflict (id) do update
    set full_name = coalesce(excluded.full_name, public.profiles.full_name),
        phone = coalesce(excluded.phone, public.profiles.phone),
        email = coalesce(excluded.email, public.profiles.email),
        avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url);

  insert into public.user_roles (user_id, role)
  values (new.id, 'customer')
  on conflict (user_id, role) do nothing;

  insert into public.carts (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.wishlists (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create or replace function public.protect_profile_auth_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() = old.id and not public.is_admin() then
    new.email = old.email;
    new.phone = old.phone;
    new.is_active = old.is_active;
  end if;

  return new;
end;
$$;

create trigger profiles_protect_auth_fields
before update on public.profiles
for each row execute function public.protect_profile_auth_fields();

create trigger auth_users_sync_profile
after insert or update of email, phone, raw_user_meta_data on auth.users
for each row execute function public.sync_auth_user_profile();

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.addresses enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlists enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.site_settings enable row level security;
alter table public.banners enable row level security;
alter table public.homepage_sections enable row level security;

create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own_or_admin"
  on public.profiles for update
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

create policy "user_roles_select_own_or_admin"
  on public.user_roles for select
  using (user_id = auth.uid() or public.is_admin());

create policy "user_roles_admin_manage"
  on public.user_roles for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "addresses_select_own_or_admin"
  on public.addresses for select
  using (user_id = auth.uid() or public.is_admin());

create policy "addresses_insert_own"
  on public.addresses for insert
  with check (user_id = auth.uid());

create policy "addresses_update_own_or_admin"
  on public.addresses for update
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

create policy "addresses_delete_own"
  on public.addresses for delete
  using (user_id = auth.uid());

create policy "categories_public_read_active"
  on public.categories for select
  using (is_active or public.is_admin());

create policy "categories_admin_manage"
  on public.categories for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "products_public_read_active"
  on public.products for select
  using (
    (
      status = 'active'
      and exists (
        select 1 from public.categories
        where categories.id = products.category_id
          and categories.is_active = true
      )
    )
    or public.is_admin()
  );

create policy "products_admin_manage"
  on public.products for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "product_variants_public_read_active"
  on public.product_variants for select
  using (
    (
      is_active
      and exists (
        select 1
        from public.products
        join public.categories on categories.id = products.category_id
        where products.id = product_variants.product_id
          and products.status = 'active'
          and categories.is_active = true
      )
    )
    or public.is_admin()
  );

create policy "product_variants_admin_manage"
  on public.product_variants for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "product_images_public_read_for_active_products"
  on public.product_images for select
  using (
    exists (
      select 1
      from public.products
      join public.categories on categories.id = products.category_id
      where products.id = product_images.product_id
        and products.status = 'active'
        and categories.is_active = true
    )
    or public.is_admin()
  );

create policy "product_images_admin_manage"
  on public.product_images for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "carts_select_own_or_admin"
  on public.carts for select
  using (user_id = auth.uid() or public.is_admin());

create policy "carts_insert_own"
  on public.carts for insert
  with check (user_id = auth.uid());

create policy "carts_update_own"
  on public.carts for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "cart_items_select_own_or_admin"
  on public.cart_items for select
  using (
    exists (
      select 1 from public.carts
      where carts.id = cart_items.cart_id
        and carts.user_id = auth.uid()
    )
    or public.is_admin()
  );

create policy "cart_items_insert_own"
  on public.cart_items for insert
  with check (
    exists (
      select 1 from public.carts
      where carts.id = cart_items.cart_id
        and carts.user_id = auth.uid()
    )
  );

create policy "cart_items_update_own"
  on public.cart_items for update
  using (
    exists (
      select 1 from public.carts
      where carts.id = cart_items.cart_id
        and carts.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.carts
      where carts.id = cart_items.cart_id
        and carts.user_id = auth.uid()
    )
  );

create policy "cart_items_delete_own"
  on public.cart_items for delete
  using (
    exists (
      select 1 from public.carts
      where carts.id = cart_items.cart_id
        and carts.user_id = auth.uid()
    )
  );

create policy "wishlists_select_own_or_admin"
  on public.wishlists for select
  using (user_id = auth.uid() or public.is_admin());

create policy "wishlists_insert_own"
  on public.wishlists for insert
  with check (user_id = auth.uid());

create policy "wishlist_items_select_own_or_admin"
  on public.wishlist_items for select
  using (
    exists (
      select 1 from public.wishlists
      where wishlists.id = wishlist_items.wishlist_id
        and wishlists.user_id = auth.uid()
    )
    or public.is_admin()
  );

create policy "wishlist_items_insert_own"
  on public.wishlist_items for insert
  with check (
    exists (
      select 1 from public.wishlists
      where wishlists.id = wishlist_items.wishlist_id
        and wishlists.user_id = auth.uid()
    )
  );

create policy "wishlist_items_delete_own"
  on public.wishlist_items for delete
  using (
    exists (
      select 1 from public.wishlists
      where wishlists.id = wishlist_items.wishlist_id
        and wishlists.user_id = auth.uid()
    )
  );

create policy "orders_select_own_or_admin"
  on public.orders for select
  using (user_id = auth.uid() or public.is_admin());

create policy "orders_admin_manage"
  on public.orders for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "order_items_select_own_or_admin"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
    or public.is_admin()
  );

create policy "order_items_admin_manage"
  on public.order_items for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "order_status_history_select_own_or_admin"
  on public.order_status_history for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_status_history.order_id
        and orders.user_id = auth.uid()
    )
    or public.is_admin()
  );

create policy "order_status_history_admin_manage"
  on public.order_status_history for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "site_settings_public_read_public_keys"
  on public.site_settings for select
  using (is_public or public.is_admin());

create policy "site_settings_admin_manage"
  on public.site_settings for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "banners_public_read_active"
  on public.banners for select
  using (
    (
      is_active
      and (starts_at is null or starts_at <= now())
      and (ends_at is null or ends_at > now())
    )
    or public.is_admin()
  );

create policy "banners_admin_manage"
  on public.banners for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "homepage_sections_public_read_enabled"
  on public.homepage_sections for select
  using (is_enabled or public.is_admin());

create policy "homepage_sections_admin_manage"
  on public.homepage_sections for all
  using (public.is_admin())
  with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('site-assets', 'site-assets', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "storage_public_read_product_images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "storage_public_read_site_assets"
  on storage.objects for select
  using (bucket_id = 'site-assets');

create policy "storage_admin_manage_product_images"
  on storage.objects for all
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "storage_admin_manage_site_assets"
  on storage.objects for all
  using (bucket_id = 'site-assets' and public.is_admin())
  with check (bucket_id = 'site-assets' and public.is_admin());
