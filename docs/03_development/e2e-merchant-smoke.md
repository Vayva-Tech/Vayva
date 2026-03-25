# Merchant E2E smoke tests

## What runs

- **Minimal (fast):** [`Frontend/merchant/e2e/merchant-minimal-smoke.spec.ts`](../../Frontend/merchant/e2e/merchant-minimal-smoke.spec.ts) — `/api/health` and `/signin` only.
- **Auth / orders / integration boundary:** [`Frontend/merchant/e2e/merchant-auth-orders-integrations.spec.ts`](../../Frontend/merchant/e2e/merchant-auth-orders-integrations.spec.ts) — unauthenticated `/dashboard` redirect, `/api/orders` and Instagram connect 401s, sign-in HTML markers (no seeded login).
- **Broader:** [`Frontend/merchant/e2e/dashboard-smoke.spec.ts`](../../Frontend/merchant/e2e/dashboard-smoke.spec.ts) — authenticated dashboard flows (requires seeded user and full env).

## Local commands

From the repo root:

```bash
pnpm test:e2e:smoke:merchant
```

Or from `Frontend/merchant` (dev server starts via `playwright.config.ts` unless `CI=true`):

```bash
pnpm test:e2e:smoke
```

Full merchant Playwright suite (as in CI after build):

```bash
pnpm --filter @vayva/merchant playwright test
```

## Environment variables (CI parity)

Match [`.github/workflows/e2e-tests.yml`](../../.github/workflows/e2e-tests.yml) for serious runs:

| Variable | Purpose |
|----------|---------|
| `VAYVA_E2E_MODE` | Enables test-friendly behavior in the app (`true` in CI). |
| `DATABASE_URL` | Postgres for session and data-dependent tests. |
| `REDIS_URL` | Caching / rate limits where used. |
| `NEXTAUTH_SECRET` / `NEXTAUTH_URL` | Auth for sign-in flows. |
| `BACKEND_API_URL` | BFF proxy target for API routes. |
| `MERCHANT_ORIGIN` | Canonical merchant base URL (cookies, redirects). |
| `MARKETING_ORIGIN` / `OPS_ORIGIN` | Cross-app links in some flows. |
| `PAYSTACK_SECRET_KEY` / `NEXT_PUBLIC_PAYSTACK_KEY` | Billing-related routes (placeholders OK for smoke-only). |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Email paths (placeholders OK for smoke-only). |

Instagram OAuth E2E is optional and needs Meta app config; see [ADR 004](../08_reference/adr/004-merchant-bff-frontends-oauth.md) for `META_IG_REDIRECT_URI` and cookie domain notes.

## Root Playwright config

Cross-app tests use [`platform/testing/playwright.config.ts`](../../platform/testing/playwright.config.ts) and `pnpm test:e2e`. Set `VAYVA_E2E_TARGET=merchant` to start only the merchant dev server.
