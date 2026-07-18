# Architecture

PMEGreen is a modular monolith built with Next.js App Router, React Server Components, Supabase Auth, PostgreSQL, Storage, and RLS.

## Route Areas

- Storefront: home, shop, categories, products, search, about, contact.
- Customer: account, addresses, cart, wishlist, checkout, orders.
- Admin: dashboard, products, categories, orders, customers, banners, settings, import.

## Component Boundaries

Server Components are the default for page data reads. Client Components are limited to interaction islands such as login, variant selection, add-to-cart controls, wishlist controls, checkout submit state, and import file reading.

## Data Access

Feature query modules perform server-side reads with typed Supabase clients. Server actions validate mutations and call RLS-protected tables or explicit RPCs for atomic workflows.

## Atomic Workflows

- `place_customer_order` handles checkout/order creation.
- `admin_update_order` handles admin status/payment updates.
- `admin_import_catalog` handles transactional catalog import.

## Phase Boundaries

The app intentionally excludes gateways, coupons, notifications, returns, analytics, marketplace features, and bulk operations beyond the approved CSV import infrastructure.
