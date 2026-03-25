# Merchant BFF flow review (Frontend/merchant)

Structured map of primary journeys, API touchpoints, security notes, and release checks. Complements [ADR 004](./adr/004-merchant-bff-frontends-oauth.md).

## Flow-to-route matrix

| Journey | Pages (App Router) | BFF `/api` (representative) | Backend / deps |
| --- | --- | --- | --- |
| Auth | `(auth)/signin`, signup, forgot/reset, `/verify` | `/api/auth/*` (login, OTP, OAuth callbacks) | `BACKEND_API_URL`, NextAuth cookies |
| Onboarding | `/onboarding` | `/api/onboarding/*`, `/api/merchant/onboarding/complete` | Core API store/slug flows |
| Dashboard shell | `(dashboard)/layout`, `admin-shell` | `/api/me`, `/api/me/plan`, `/api/dashboard/*` | Session + plan gating |
| Orders / fulfilment | `dashboard/orders/*` | `/api/orders`, `/api/orders/summary`, `/api/fulfillment/*` | Core orders, carriers |
| Products / catalog | `dashboard/products/*` | `/api/products/*`, `/api/inventory/*`, `/api/collections/*` | Core catalog |
| Customers | `dashboard/customers/*` | `/api/customers/*` | Core CRM |
| Billing / plans | `dashboard/settings` billing areas | `/api/billing/*`, `/api/me/plan` | Paystack, subscriptions |
| Public checkout (signup pay) | Marketing links | `/api/public/checkout/init`, `/api/public/checkout/verify` | Paystack verify + `.../provision` |
| Integrations | `dashboard/socials`, settings | `/api/socials/instagram/*`, `/api/integrations/*`, `/api/health/integrations` | Meta OAuth, ops health |
| Team / RBAC | Team settings | `/api/merchant/team/*`, `/api/team/invites/accept` | Core team APIs |
| Embedded / widgets | Storefront embeds | `/api/embedded/*` | Intentionally separate trust model; review per route |
| Ops / support | Internal tools | `/api/ops/*`, `/api/support/*` | Elevated roles |

## Public checkout, billing, webhooks (review summary)

- **`POST /api/webhooks/paystack`**: Verifies `x-paystack-signature` with `PAYSTACK_SECRET_KEY` via `verifyPaystackSignature`; rejects unsigned/invalid payloads (401). Forwards raw body to core API when `NEXT_PUBLIC_API_URL` is an absolute gateway URL; returns 410 when gateway is not configured (fail-closed for this ingress).
- **`POST /api/public/checkout/verify`**: Idempotent fast path when backend already has a transaction for `reference`. Otherwise calls `PaystackService.verifyTransaction(reference)`, enforces Paystack `success`, validates plan metadata and **amount vs `getPlanPrice`** (kobo), then `POST .../api/public/checkout/provision`. Does not trust client for amount/plan alone.
- **`POST /api/public/checkout/init`**: BFF proxy to core `.../api/public/checkout/init`; may send `x-store-id` when present. Intentionally unauthenticated for net-new checkout from marketing.
- **Affiliate payout PATCH** (related hardening): Reject path now loads `AffiliatePayout` by `{ id, storeId }` and uses `updateMany` scoped to the store.

## Middleware vs `/api` trees

Edge middleware only checks **presence** of a session cookie or `Authorization: Bearer` (see `getAuthToken` in `Frontend/merchant/src/middleware.ts`). It does **not** validate the token. `PROTECTED_ROUTE_PREFIXES` was extended so additional sensitive trees receive the same coarse 401/redirect behavior when no credential is present: `/api/me`, `/api/onboarding`, `/api/ops`, `/api/ledger`, `/api/payments`, `/api/integrations`, `/api/socials`, `/api/storage`, `/api/team`, `/api/uploads`. **Handler-level auth remains authoritative** (`requireAuthFromRequest`, `withVayvaAPI`, `buildBackendAuthHeaders`, etc.).

`/api/public`, `/api/webhooks`, and `/api/auth` stay public at the edge via `PUBLIC_ROUTES` / `isPublicRoute`.

## Sample audit by prefix (store scoping)

| Prefix | Pattern (representative) | Note |
| --- | --- | --- |
| Most authenticated BFF trees | **`buildBackendAuthHeaders(request)`** → `auth.headers` + `auth.user.storeId` | Bulk migration: core proxies use session-derived store and cookies/bearer, not client `x-store-id` alone. |
| Some industry / legacy routes | **`getServerSession`** (sometimes with `buildBackendAuthHeaders`) | Accepted by the auth guard; consolidate on one pattern when touching a file. |
| `/api/integrations/*/oauth/*` | QuickBooks / Xero OAuth | Allowlisted in the guard; review CSRF/state on callbacks. |
| `/api/embedded/*` | Varies | Public/partner trust model; verify each route. |
| `/api/ops/*` | Strong auth + RBAC | Middleware prefix + handler checks. |

Mechanical guard: `pnpm ci:guards` runs `check-frontend-merchant-bff-auth.js` (requires `requireAuthFromRequest`, `buildBackendAuthHeaders`, `withVayvaAPI`, `withTenantIsolation`, `requireAuth`, or `getServerSession`; public/webhook/oauth allowlists apply). The baseline file may be **empty** when there are zero grandfathered gaps. `check-merchant-idors.js` includes `Frontend/merchant/src/app/api`. Optional tooling: `platform/scripts/ci/migrate-bff-buildBackendAuthHeaders.mjs`, `repair-bff-auth-blocks.mjs`.

## Manual QA checklist (~30 min)

1. **Auth**: Sign in, sign out, open `/dashboard` (expect redirect when logged out).
2. **Onboarding**: Complete or resume onboarding; confirm store slug and dashboard load.
3. **Catalog**: Create or edit one product; list shows the change.
4. **Orders**: Open orders list and a single order detail (if data exists).
5. **Billing**: Open plan/billing UI; confirm Paystack/customer portal link loads or fails gracefully with clear error.
6. **Integration**: Open social/Instagram connect (expect 401 when logged out; OAuth redirect when logged in and configured).
7. **Public checkout** (staging): Complete a test payment and verify account provision (or verify idempotent re-fetch with same reference).

Follow-on security backlog: [Remaining tenancy & security scope](./remaining-tenancy-security-scope.md).

Related: [E2E smoke doc](../03_development/e2e-merchant-smoke.md).
