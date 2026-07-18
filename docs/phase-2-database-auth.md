# Phase 2: Database and Authentication

Phase 2 adds the Supabase database/authentication foundation and protects private application routes. It does not import `product-catalog.csv` and does not begin catalog/storefront work.

## Migration

Migration file:

- `supabase/migrations/20260712170000_phase_2_database_auth.sql`

It creates:

- Tables for `profiles`, `user_roles`, `addresses`, catalog entities, carts, wishlists, orders, settings, banners, and homepage sections.
- Enum types for roles, product status, units, order/payment states, banner link types, and homepage section types.
- Constraints for money, quantities, slugs, Tamil Nadu addresses, default addresses, default active variants, primary images, and order snapshots.
- Indexes for account, admin, storefront, and order lookup patterns.
- `updated_at` triggers.
- Profile synchronization from `auth.users` that idempotently creates/updates `profiles`, grants `customer`, and creates one cart and wishlist.
- RLS helper functions `public.has_role()` and `public.is_admin()`.
- RLS policies for customer isolation, public active catalog reads, admin management, private order reads, and public-only settings.
- Storage buckets and policies for `product-images` and `site-assets`.

Customer order creation is intentionally not open through direct table inserts. The approved checkout/order workflow is a later phase.

## Applying Migrations

Local Supabase:

```bash
supabase start
supabase db push
```

Linked Supabase project:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

Review SQL diffs before applying to production.

For the linked project currently used in this workspace, `supabase db push --yes`
reported `Remote database is up to date` after migration `20260712170000` was
already present remotely.

## RLS Verification

Manual check script:

```bash
psql "$SUPABASE_DB_URL" -f supabase/tests/phase_2_rls_checks.sql
```

When using the Supabase CLI Management API instead of local `psql`:

```bash
npx supabase db query --linked --file supabase/tests/phase_2_rls_checks.sql
```

Profile synchronization check:

```bash
npx supabase db query --linked --file supabase/tests/phase_2_profile_sync_check.sql
```

The script rolls back its test data and checks:

- Customer B cannot read Customer A's address.
- A non-admin cannot grant themselves admin.
- An admin can read customer address data needed for operations.

These scripts are rollback-only verification assets. They require a real local or remote Supabase database to run.

## Type Generation

Generate local types after migrations are applied:

```bash
npm run types:supabase:local
```

Generate remote types on Windows/PowerShell after setting `SUPABASE_PROJECT_ID`:

```bash
npm run types:supabase:remote
```

Both commands write to `src/types/supabase.ts`. The committed file is a placeholder until generation is run against a Supabase database.

The linked project types can also be generated directly:

```bash
npx supabase gen types typescript --project-id <project-ref> > src/types/supabase.ts
```

In PowerShell, direct `>` redirection can write UTF-16 output. If that happens,
convert the generated file back to UTF-8 before running Prettier/TypeScript:

```powershell
$content = Get-Content -Raw -Encoding Unicode src\types\supabase.ts
Set-Content -Path src\types\supabase.ts -Value $content -Encoding utf8
```

## App Authentication

Implemented routes:

- `/auth/login`: Google OAuth button and phone OTP form.
- `/auth/callback`: exchanges OAuth code for a Supabase session.
- `/account`: requires an authenticated Supabase user.
- `/admin`: requires an authenticated Supabase user with an `admin` role.

Middleware refreshes Supabase cookies for session continuity.

Phone OTP is implemented on the application side but disabled unless `NEXT_PUBLIC_ENABLE_PHONE_OTP=true`. Do not enable it until a Supabase-supported SMS provider is configured and tested.

## Environment

`.env.example` lists variable names only:

```bash
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_ENABLE_PHONE_OTP=false
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_PROJECT_ID=
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only. It is not used by browser code and should not be set with a `NEXT_PUBLIC_` prefix.

## Google OAuth Setup

Manual steps:

1. In Supabase Dashboard, enable the Google Auth provider.
2. In Google Cloud Console, create OAuth 2.0 credentials.
3. Add the Supabase callback URL shown in the Supabase provider screen to Google authorized redirect URIs.
4. Add the Google client ID and secret in Supabase.
5. Add application redirect URLs in Supabase Auth URL configuration:
   - Local: `http://localhost:3000/auth/callback`
   - Production: `https://<production-domain>/auth/callback`
6. Set `NEXT_PUBLIC_SITE_URL` to the app origin.

Google OAuth is only verified after these external settings are configured and a real sign-in is tested.

## Phone OTP Setup

Manual steps:

1. Configure a Supabase-supported SMS provider.
2. Confirm India delivery support, sender requirements, templates, and rate limits.
3. Test a real phone sign-in in Supabase.
4. Set `NEXT_PUBLIC_ENABLE_PHONE_OTP=true`.

The app will not present phone OTP as operational while this flag is false.

## First Admin Bootstrap

There is no automatic first-user admin behavior.

After the owner signs in once and a profile row exists, grant the first admin role from Supabase SQL editor or another controlled DBA session:

```sql
insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role
from public.profiles
where email = '<owner-email@example.com>'
on conflict (user_id, role) do nothing;
```

For phone-only owner accounts:

```sql
insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role
from public.profiles
where phone = '<e164-phone-number>'
on conflict (user_id, role) do nothing;
```

Verify:

```sql
select profiles.id, profiles.email, profiles.phone, user_roles.role
from public.profiles
join public.user_roles on user_roles.user_id = profiles.id
where user_roles.role = 'admin';
```

Never expose a "become admin" route or client action.

## Storage

The migration creates:

- `product-images`: public reads, admin writes.
- `site-assets`: public reads, admin writes.

These policies rely on the `admin` role and RLS helper functions.
