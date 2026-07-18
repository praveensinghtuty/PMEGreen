# Developer Guide

## Commands

```bash
npm install
npm run dev
npm run format
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

## Patterns

- Prefer Server Components for reads.
- Keep mutations in feature server actions.
- Use PostgreSQL RPCs for atomic multi-table workflows.
- Validate inputs with Zod or parser utilities.
- Use typed Supabase clients and generated `src/types/supabase.ts`.

## Tests

Current unit tests are in `tests/catalog-utils.test.mjs`. Database verification scripts are in `supabase/tests`.

Recommended future E2E coverage:

- Browse product -> cart -> login -> checkout -> order.
- Admin create product -> publish -> visible storefront.
- Customer isolation.
- Non-admin denied admin access.
