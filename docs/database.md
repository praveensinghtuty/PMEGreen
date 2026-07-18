# Database

The database is managed by Supabase migrations in `supabase/migrations`.

## Main Tables

- Auth/profile: `profiles`, `user_roles`
- Catalog: `categories`, `products`, `product_variants`, `product_images`
- Shopping: `carts`, `cart_items`, `wishlists`, `wishlist_items`
- Checkout: `addresses`, `orders`, `order_items`, `order_status_history`
- CMS/settings: `banners`, `homepage_sections`, `site_settings`

## Constraints

Important constraints include unique category/product slugs, unique variant SKUs, non-negative prices and stock, valid Tamil Nadu addresses, cart/wishlist uniqueness, and immutable order snapshots.

## RLS

RLS is enabled for customer-owned records and admin-managed records. Public storefront reads expose only active catalog data. Admin policies use the `admin` role from `user_roles`.

## RPCs

Security-definer RPCs must keep `search_path = public` and explicitly verify caller authorization. Current RPCs follow that rule.

## Backup And Restore

Before launch, configure Supabase backups appropriate to the plan. Practice restore into a non-production project before relying on backups operationally.

Recommended restore process:

1. Create a fresh Supabase project.
2. Restore database backup.
3. Recreate Storage buckets and policies if not included by the backup workflow.
4. Regenerate TypeScript types.
5. Run RLS verification scripts.
6. Smoke-test auth, storefront, checkout, orders, admin, and import dry-run.
