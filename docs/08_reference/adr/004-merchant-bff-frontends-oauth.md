# ADR 004 — Merchant BFF, `Frontend/` vs `apps/`, and OAuth boundaries

| Field | Value |
|-------|-------|
| Status | Accepted |
| Date | March 2026 |
| Deciders | Engineering |
| Supersedes | — |

---

## Context

The merchant dashboard is a **Next.js BFF**: browser calls `/api/*` on the same origin; route handlers proxy to `BACKEND_API_URL` (core API) with session cookies. This keeps secrets off the client but requires clear rules for **which routes are public**, **how store scope is enforced**, and **how OAuth redirects and cookies align with deployment hosts**.

The repository also contains **`Frontend/*`** (deployable Next apps and shared UI consumers) and historically **`apps/*`** (e.g. worker-style services). Contributors need a single place to understand layout and env vars for Instagram and checkout flows.

---

## Decision

1. **Primary merchant app path:** [`Frontend/merchant`](../../../Frontend/merchant/package.json) is the canonical merchant admin. Prefer new work there unless a separate deployable explicitly requires another package.

2. **`apps/` vs `Backend/`:** Use **`Backend/worker`** (workspace package `@vayva/worker`) for the BullMQ worker. The duplicate [`apps/worker`](../../../apps/worker/package.json) tree exists for legacy or alternate deploys; CI uses `apps/worker` only when a `test` script is present. New automation should target the pnpm workspace package.

3. **Instagram OAuth:** Meta requires an exact **redirect URI** registered on the app. Set `META_IG_REDIRECT_URI` (and matching Meta dashboard URL) to the **merchant origin** callback route (e.g. `https://merchant.example.com/api/socials/instagram/callback`). Mismatched protocol, host, or path breaks the code exchange. Session cookies for OAuth state must use a **`Domain`** (or host-only) consistent with that origin; avoid sharing cookies across unrelated subdomains unless intentionally configured.

4. **Public checkout verify:** [`Frontend/merchant/src/app/api/public/checkout/verify/route.ts`](../../../Frontend/merchant/src/app/api/public/checkout/verify/route.ts) is intentionally **unauthenticated** for Paystack reference verification and provisioning. **Security posture:**
   - Treat `reference` as an opaque idempotency key; rely on Paystack verification and backend idempotency, not on client trust.
   - Do not expose internal store IDs or PII without backend authorization.
   - Rate-limit and monitor this path in production (WAF / edge rules as appropriate).
   - OTP/email flows for verify UI belong in the **backend** or a trusted email provider; the BFF must not log or echo secrets.

5. **BFF IDOR scope:** Dashboard `/api/*` routes must resolve `storeId` from **session** (or explicit admin override with audit), never from unchecked client body/query alone. Repository guards under `platform/scripts/ci/check-merchant-idors.js` encode part of this policy.

---

## Consequences

- On-call and security reviews use this ADR plus [`docs/04_deployment/environment-variables.md`](../../04_deployment/environment-variables.md) for env naming.
- New public BFF routes require an explicit threat model (replay, enumeration, abuse).
- E2E docs link here for OAuth env setup: [`docs/03_development/e2e-merchant-smoke.md`](../../03_development/e2e-merchant-smoke.md).

---

## References

- [`docs/08_reference/adr/001-monorepo-architecture.md`](001-monorepo-architecture.md)
- [`docs/02_engineering/frontend-architecture.md`](../../02_engineering/frontend-architecture.md)
