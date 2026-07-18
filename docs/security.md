# Security

## Implemented

- Supabase Auth and server-side role checks.
- RLS on customer/admin/public data.
- Admin-only RPC authorization.
- Relative-only auth return paths.
- Server-side checkout totals and stock validation.
- Product metadata only for active public catalog records.
- Security headers in `next.config.ts`.
- MIME-derived storage filenames for admin uploads.
- No service-role use in customer or admin UI flows.

## Operational Rules

- Keep service-role key server-only.
- Do not log tokens, secrets, OTPs, or unnecessary personal data.
- Do not publish placeholder products with unreviewed claims.
- Keep phone OTP disabled until Supabase SMS provider setup is verified.
- Review Storage bucket public/private posture before launch.

## CSRF

Mutations are implemented as Server Actions with same-site application cookies. Sensitive mutations still validate user/session/ownership server-side and through RLS.
