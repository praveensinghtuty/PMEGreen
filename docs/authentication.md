# Authentication

Supabase Auth is the authentication source.

## Providers

- Google OAuth is implemented application-side and requires Supabase dashboard setup.
- Phone OTP UI is implemented but must remain disabled unless an SMS provider is configured in Supabase.

## Redirects

Auth return paths use relative `next` paths only. External redirects are rejected.

Required local redirect URL:

```text
http://localhost:3000/auth/callback
```

Required production redirect URL:

```text
https://<production-domain>/auth/callback
```

## Roles

Application authorization uses `user_roles` with `customer` and `admin`.

## First Admin

Do not auto-promote the first registered user. Bootstrap the first admin with controlled SQL after verifying the profile id.
