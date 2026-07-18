# PMEGreen

Mobile-first commerce application for a single-seller traditional products business in Tamil Nadu, India.

The application is complete through Phase 8 production hardening. It includes storefront browsing, authenticated cart and wishlist, Tamil Nadu-only address management, checkout with COD/manual UPI, customer orders, admin catalog/order/settings management, and CSV catalog import infrastructure.

## Requirements

- Node.js 20+
- npm
- Supabase CLI
- A Supabase project for hosted auth, database, and storage

## Environment

Create `.env.local` from `.env.example`.

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_ENABLE_PHONE_OTP=false
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_PROJECT_ID=
```

Do not commit real secrets. `SUPABASE_SERVICE_ROLE_KEY` is server-only and is not used by normal customer/admin UI flows.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Supabase auth redirects are configured for port `3000`.

## Database

Apply migrations to the linked project:

```bash
npx supabase db push --linked
```

Generate types:

```bash
npx supabase gen types typescript --project-id <project-id> > src/types/supabase.ts
```

On Windows, convert generated types to UTF-8 if the redirect writes UTF-16.

## Verification

```bash
npm run format
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npx supabase db lint --linked
npx supabase migration list --linked
```

RLS and workflow checks:

```bash
npx supabase db query --linked --file supabase/tests/phase_2_rls_checks.sql
npx supabase db query --linked --file supabase/tests/phase_2_profile_sync_check.sql
npx supabase db query --linked --file supabase/tests/phase_4_cart_wishlist_check.sql
npx supabase db query --linked --file supabase/tests/phase_5_checkout_orders_check.sql
npx supabase db query --linked --file supabase/tests/phase_6_admin_checks.sql
npx supabase db query --linked --file supabase/tests/phase_7a_catalog_import_check.sql
```

## Documentation

Production documentation is in `docs/`:

- [Architecture](docs/architecture.md)
- [Database](docs/database.md)
- [API and Server Actions](docs/api.md)
- [Authentication](docs/authentication.md)
- [Deployment](docs/deployment.md)
- [Environment](docs/environment.md)
- [Admin Guide](docs/admin-guide.md)
- [Developer Guide](docs/developer-guide.md)
- [Security](docs/security.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Roadmap](docs/roadmap.md)
- [Changelog](docs/changelog.md)

## Catalog Import

- Source file: `product-catalog.csv`
- Prepared Phase 7B file: `normalized-product-catalog-phase-7b.csv`
- Real import must be run from `/admin/import` by an authenticated admin after dry-run approval.
- No images are imported unless explicit filename mappings are added.

## Production Checklist

Read [Deployment](docs/deployment.md) before launch. Required manual setup includes Supabase OAuth redirect URLs, optional phone OTP SMS provider, storage buckets, first admin bootstrap, backup plan, and final business assets/settings.
