# PME Commerce

Mobile-first commerce application for a small single-seller traditional products business in Tamil Nadu, India.

This repository is currently complete through **Phase 2: Database and Authentication**. Later phases will add catalog/storefront, shopping, orders, admin workflows, import/export, and production hardening.

## What Is Implemented

- Next.js App Router project with React and strict TypeScript.
- Tailwind CSS design tokens and responsive base layouts.
- Storefront, account, and admin shell routes.
- Basic UI primitive foundation.
- Supabase browser/server client factories.
- Environment validation for public app/Supabase variables.
- Error and not-found foundations.
- Centralized placeholder copy and asset references.
- Local placeholder SVG assets for logo, product, category, banner, and UPI QR replacement.
- Supabase database migration for the approved Phase 2 schema.
- Database constraints, indexes, profile synchronization, RLS policies, and storage policies.
- Google OAuth application flow and callback route.
- Phone OTP application flow gated behind explicit SMS-provider configuration.
- Protected account route and admin route with server-side role checks.
- Secure first-admin bootstrap documentation.

No product data has been imported. The supplied `product-catalog.csv` remains unchanged and is reserved for a later import phase.

## Requirements

- Node.js compatible with the installed dependencies. The current environment used Node `v20.11.0`.
- npm.

## Environment

Create `.env.local` from `.env.example`:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_ENABLE_PHONE_OTP=false
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_PROJECT_ID=
```

Supabase public values are required for authentication flows and protected routes. `SUPABASE_SERVICE_ROLE_KEY` is server-only and is not required for normal sign-in.

Do not commit real secrets.

## Supabase

Apply migrations:

```bash
supabase start
supabase db push
```

Generate database types after migrations are applied:

```bash
npm run types:supabase:local
```

For full migration, RLS verification, provider setup, and first-admin bootstrap instructions, read [Phase 2: Database and Authentication](docs/phase-2-database-auth.md).

## Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Verification

```bash
npm run format:check
npm run lint
npm run typecheck
npm run build
```

Use `npm run format` to apply formatting.

The manual RLS check requires a running Supabase database:

```bash
psql "$SUPABASE_DB_URL" -f supabase/tests/phase_2_rls_checks.sql
```

For a linked Supabase project, the same check can run through the Supabase CLI:

```bash
npx supabase db query --linked --file supabase/tests/phase_2_rls_checks.sql
npx supabase db query --linked --file supabase/tests/phase_2_profile_sync_check.sql
```

## Placeholder Replacement

Placeholder references are centralized in:

- `src/lib/placeholders/content.ts`
- `public/placeholders/`

Replace these when final business name, logo, product photography, banners, category imagery, UPI QR, contact details, and verified business copy are supplied.

## Catalog Note

`product-catalog.csv` has been inspected only. It includes slash-separated variants and prices, some incomplete rows, and a misspelled `Prodoucts` header. Normalization, import preview, warnings, and seed/import data belong to a later phase.
