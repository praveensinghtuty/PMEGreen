-- Development-only seed for Phase 3B catalog route verification.
-- Do not use this as production catalog data and do not treat it as import output.

insert into public.categories (
  id,
  name,
  slug,
  description,
  sort_order,
  is_active
)
values (
  '30000000-0000-4000-8000-000000000001',
  'Catalog Verification',
  'catalog-verification',
  'Development-only catalog verification category.',
  0,
  true
)
on conflict (id) do update
set name = excluded.name,
    slug = excluded.slug,
    description = excluded.description,
    sort_order = excluded.sort_order,
    is_active = excluded.is_active;

insert into public.products (
  id,
  category_id,
  name,
  slug,
  short_description,
  status,
  sort_order
)
values
  (
    '30000000-0000-4000-8000-000000000101',
    '30000000-0000-4000-8000-000000000001',
    'Catalog Verification Product',
    'catalog-verification-product',
    'Development-only product for storefront route verification.',
    'active',
    0
  ),
  (
    '30000000-0000-4000-8000-000000000102',
    '30000000-0000-4000-8000-000000000001',
    'Hidden Catalog Verification Product',
    'hidden-catalog-verification-product',
    'Development-only hidden product for visibility verification.',
    'inactive',
    1
  )
on conflict (id) do update
set category_id = excluded.category_id,
    name = excluded.name,
    slug = excluded.slug,
    short_description = excluded.short_description,
    status = excluded.status,
    sort_order = excluded.sort_order;

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
  '30000000-0000-4000-8000-000000000201',
  '30000000-0000-4000-8000-000000000101',
  'Verification option',
  1,
  'piece',
  100,
  5,
  true,
  true,
  true,
  0
)
on conflict (id) do update
set product_id = excluded.product_id,
    name = excluded.name,
    value = excluded.value,
    unit = excluded.unit,
    price = excluded.price,
    stock_quantity = excluded.stock_quantity,
    track_inventory = excluded.track_inventory,
    is_default = excluded.is_default,
    is_active = excluded.is_active,
    sort_order = excluded.sort_order;
