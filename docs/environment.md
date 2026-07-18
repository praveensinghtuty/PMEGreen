# Environment

Required variables are listed in `.env.example`.

## Public Variables

- `NEXT_PUBLIC_SITE_URL`: canonical app URL.
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key.
- `NEXT_PUBLIC_ENABLE_PHONE_OTP`: `true` only after SMS provider setup.

## Server Variables

- `SUPABASE_SERVICE_ROLE_KEY`: server-only key. Do not expose to browser code.
- `SUPABASE_PROJECT_ID`: used for generated type workflow.

## Secret Rules

Never commit `.env.local`, service-role keys, OAuth client secrets, SMS provider secrets, or payment credentials.
