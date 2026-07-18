-- Cleanup for the Phase 3B development-only catalog verification seed.

delete from public.product_images
where product_id in (
  '30000000-0000-0000-0000-000000000101',
  '30000000-0000-0000-0000-000000000102'
);

delete from public.product_variants
where product_id in (
  '30000000-0000-0000-0000-000000000101',
  '30000000-0000-0000-0000-000000000102'
);

delete from public.products
where id in (
  '30000000-0000-0000-0000-000000000101',
  '30000000-0000-0000-0000-000000000102'
);

delete from public.categories
where id = '30000000-0000-0000-0000-000000000001';
