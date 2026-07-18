# Deployment

## Checklist

- Set all environment variables in Vercel.
- Configure Supabase Auth redirect URLs for local and production.
- Configure Google OAuth credentials in Supabase.
- Keep phone OTP disabled until SMS provider setup is complete.
- Apply all migrations with `npx supabase db push --linked`.
- Regenerate Supabase types after migration changes.
- Verify Storage buckets and policies: `product-images`, `site-assets`.
- Bootstrap the first admin with controlled SQL.
- Replace placeholder business settings, logo, UPI ID, UPI QR, contact details, and imagery.
- Run import dry-run before catalog import.
- Run full verification commands.
- Configure Supabase backups and document restore ownership.

## Build

```bash
npm run build
```

## Production Smoke Tests

- Home, shop, category, search, and product pages.
- Login and auth callback.
- Cart, wishlist, checkout, COD, manual UPI.
- Customer orders and order detail.
- Admin dashboard, product/category/order/settings/import pages.
- Unauthenticated admin route redirects.
- Non-admin admin access denial.
