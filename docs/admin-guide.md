# Admin Guide

## Access

Only authenticated users with the `admin` role can access `/admin`.

## Catalog

Use Products and Categories to manage storefront data. Products should stay `draft` or `inactive` until names, prices, stock, and images are reviewed.

## Orders

Admins can update order status, verify manual UPI payments, and add courier tracking. Historical order item and address snapshots are not editable.

## Settings

Manage public store name, contact details, shipping charge, UPI ID, UPI QR path, and branding assets.

## Import

Use `/admin/import`:

1. Upload or paste a normalized CSV.
2. Run dry-run.
3. Review errors and warnings.
4. Confirm import only after approval.

The current normalized file is `normalized-product-catalog-phase-7b.csv`.
