# Troubleshooting

## Supabase Type File Looks Binary

On Windows, shell redirection can write generated types as UTF-16. Convert it:

```powershell
$content = Get-Content -Raw -Encoding Unicode src\types\supabase.ts
Set-Content -Encoding utf8 src\types\supabase.ts $content
```

## Auth Redirect Fails

Verify `NEXT_PUBLIC_SITE_URL` and Supabase Auth redirect URLs include `/auth/callback`.

## Admin Access Denied

Confirm the user has a profile row and a `user_roles` row with `admin`.

## Import Fails

Run dry-run first. Fix row-level errors. Confirm categories, duplicate SKUs, slugs, prices, stock, and image filenames.

## Build Fails On Environment

Check `.env.local` values against `.env.example`.
