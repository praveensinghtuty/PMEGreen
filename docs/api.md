# API And Server Actions

The application does not expose broad custom HTTP APIs. Mutations use Next.js Server Actions and Supabase RPCs.

## Customer Actions

- Cart: add active variant, update quantity, remove item, clear cart.
- Wishlist: add/remove active products.
- Addresses: create, edit, delete when allowed, set default.
- Checkout: place COD/manual UPI orders through `place_customer_order`.

## Admin Actions

- Catalog: products, variants, images, categories, banners.
- Orders: update status, payment verification, tracking fields through `admin_update_order`.
- Settings: existing public site settings and assets.
- Import: dry-run and confirmed transactional import through `admin_import_catalog`.

## Trust Boundary

Server actions validate all untrusted input. Prices, totals, stock, order owner, roles, and status transitions are never trusted from the browser.
