# Remaining tenancy & security scope

Follow-on work after merchant BFF session scoping, ops-console auth gaps, and selected service-layer fixes (`approvePayout`, `approveGrant`). This document defines **what is left**, **priority**, and **how to close** it.

Related: [ADR 004 — Merchant BFF & OAuth](./adr/004-merchant-bff-frontends-oauth.md), [Merchant BFF flow review](./merchant-bff-flow-review.md).

---

## 1. Non-goals (explicit)

- Replacing Paystack / provider contracts or redesigning checkout UX unless a finding requires it.
- Full SOC2-style evidence pack (this is an engineering backlog, not an audit deliverable).

---

## 2. Phase A — Core API as source of truth (`Backend/core-api`)

**Problem:** The merchant BFF can enforce session-derived `storeId` and headers, but **core-api must still reject** cross-tenant access if a token is replayed, a bug regresses the BFF, or a client calls core directly.

**Scope**

- For each sensitive domain (orders, customers, products, subscriptions, payouts, webhooks callbacks that mutate state): confirm handlers resolve **tenant from auth** (JWT / internal service identity), not from unvalidated body/query `storeId`.
- Prefer **compound** `where` clauses (`{ id, storeId }`) or equivalent for any `update` / `delete` / `findUnique` on tenant-owned rows.
- Document any intentional **cross-tenant** ops-only routes (if any) and protect with ops service auth, not merchant tokens.

**Exit criteria**

- Spot-check + scripted grep (or existing core-api lint) for risky Prisma patterns; file issues for exceptions with `// security: ...` comments.
- Critical mutations covered by at least one **integration test** that proves another store’s id returns 403/404.

---

## 3. Phase B — Merchant BFF & services (residual)

**3.1 Trust boundaries already special-cased**

- `/api/public/*`, `/api/webhooks/*`, `/api/storefront/*` — confirm **documented** threat model (who can call, what is forged, idempotency, signatures). Tighten only where product allows (e.g. bind `init` to signed params or server-known store slug).

**3.2 `/api/embedded/*`**

- Separate trust model (widget keys, origins, CORS). Per-route review: auth mechanism, rate limits, and whether `storeId` or embed token is authoritative.

**3.3 Service-layer “by id” helpers**

- Examples called out earlier: food reservations **PATCH** (`checkIn` / `cancel` by id only), and any similar `*Service.method(id)` used from BFF without `storeId`.
- Pattern: add `storeId` (or `storeId` + ownership join) to the service method; BFF passes **session** `storeId` only.

**3.4 Consistency**

- Prefer one of `buildBackendAuthHeaders` vs raw `getServerSession` per route tree when touching files; no big-bang refactor required.

**Exit criteria**

- Grep-driven inventory of `foodService`, `nonprofitService`, and other `@/services/*` methods invoked from `/api/**` with **only** `id`; each either fixed or marked with a security comment and ticket.

---

## 4. Phase C — Ops console & other apps

**4.1 Ops console**

- Re-run: routes under `Frontend/ops-console/src/app/api` that still lack `OpsAuthService` / `withOpsAuth` / `withOpsAPI` (excluding intentional public: health, auth, invitation validate).
- Role matrix: which **roles** may call **mutations** (feature flags, playbook queue, NPS queue, etc.); enforce with `requireRole` or permission helpers where today only “logged in” is required.

**4.2 Other frontends**

- If `apps/*` duplicates `Frontend/*`, align or delete dead trees so security fixes are not applied only to one copy.
- **Marketing (`Frontend/marketing`):** Public lead-gen and checkout BFF routes are intentional; `RescueIncident` writes use `status: "OPEN"`. AI chat (`/api/ai/chat` and `/api/public/ai/chat`) share a **Redis IP rate limit** (`rate_limit:marketing_ai:*`, 10/min). `rescue/incidents/[id]` remains public for polling — mitigate IDOR with unguessable ids if diagnostics are sensitive.

---

## 5. Phase D — Automation

- **CI:** Optional guard for `Frontend/ops-console` (mirror merchant BFF auth ratchet): require auth helper on `route.ts` except allowlist.
- **Tests:** Minimal Playwright (or API tests) for ops login + one protected API; merchant already has smoke paths — extend for embedded if high risk.
- **Monitoring:** Alert on 401 spikes on `/api/ops/*` after tightening (noise vs attack).

---

## 6. Suggested execution order

1. **Core-api** tenant enforcement on highest-value mutations (orders, customers, payouts, subscriptions).  
2. **Embedded** and **public/checkout** threat-model doc + code tweaks.  
3. **Service-by-id** fixes in merchant services.  
4. **Ops** role tightening + optional CI guard.  
5. Duplicate **apps vs Frontend** reconciliation.

---

## 7. Definition of done (program level)

- No known unauthenticated ops route that reads/writes production data or enqueues side-effect jobs (except explicitly documented public endpoints).  
- Core-api cannot mutate another tenant’s rows with a valid merchant token for store A and resource id from store B.  
- Residual exceptions are listed in this doc or in ADR addenda with owner and review date.

---

## 8. Completion notes (ops-console + merchant BFF trunk, 2026-03)

This section records what was **closed** in-repo for Phases **B** (merchant BFF services used from `/api`) and **C** (ops-console). Phase **A** (core-api) and **D** (CI automation) remain governed by §2 and §5 above.

### 8.1 Merchant BFF — direct `@/services/*` from `Frontend/merchant/src/app/api/**`

Routes that call Prisma-backed services were reviewed and updated to pass **session `storeId`** (or ownership joins such as `Customer` for child rows without `storeId`) for mutations and sensitive reads: **events**, **food reservations**, **nonprofit** (grants/volunteers), **automotive trade-ins**, **electronics warranties**, **fashion** size profiles, **beauty** skin profiles. Other API trees (loyalty, onboarding, referral, WhatsApp) already used session-scoped patterns or proxy-only calls to core-api.

**`/api/embedded/*`:** Handlers use `buildBackendAuthHeaders` / `requireAuthFromRequest`; the BFF forwards **authenticated** merchant context to **core-api**. **Authoritative tenant** for data changes must remain enforced in **core-api** as well. Widget/embed **CORS**, **rate limits**, and any **embed signing** are deployment and product concerns; treat this surface as **higher trust than anonymous public** but **not equivalent to full merchant dashboard session** until core-api embed contracts are finalized.

**`/api/public/*`, `/api/webhooks/*`, `/api/storefront/*`:** Unchanged here; they require their own signatures, idempotency, and store binding per product (see ADR 004). No blanket hardening in this pass.

### 8.2 Ops console — auth coverage and role matrix

**Intentionally unauthenticated or alternate auth (documented):**

- `src/app/api/auth/[...nextauth]/route.ts` — NextAuth.
- `src/app/api/health/route.ts`, `src/app/api/ops/health/route.ts` — load balancer / uptime probes.
- `src/app/api/ops/invitations/validate/route.ts` — invitation token validation.
- `src/app/api/ops/auth/login/route.ts` — login.
- `POST src/app/api/ops/jobs/drain-emails/route.ts` — optional **`x-job-token`** matching `JOBS_DRAIN_TOKEN` for cron; otherwise ops session + role (below).

All other **`src/app/api/**/route.ts`** handlers use **`OpsAuthService.requireSession`**, **`withOpsAuth`**, or **`withOpsAPI`**, or dedicated internal checks.

**Minimum role summary for routes tightened in this program (hierarchy: `OPS_OWNER` / `SUPERVISOR` / `OPS_ADMIN` ≥ `OPERATOR` > `OPS_SUPPORT`):**

| Area | Read / query | Mutate / queue / side effects |
|------|----------------|-------------------------------|
| OpenAPI YAML, monitoring metrics, ops health metrics & system, cookie consent analytics GET | `OPERATOR` | — |
| Health-score GET (all stores, owner PII in aggregates) | `OPERATOR` | — |
| Health-score GET (single `storeId`) | `OPS_SUPPORT` | — |
| Health-score POST (recalc queue) | — | `OPERATOR` |
| NPS GET without `storeId` (cross-tenant) | `OPERATOR` | — |
| NPS GET with `storeId` | `OPS_SUPPORT` | — |
| NPS POST (queue send) | — | `OPERATOR` |
| Playbooks GET | `OPS_SUPPORT` | — |
| Playbooks POST (queue execution) | — | `OPERATOR` |
| Feature flags list / GET by id | `OPERATOR` | — |
| Feature flags POST / PATCH | — | `SUPERVISOR` |
| Support tickets list / PATCH | `OPS_SUPPORT` | (same) |
| Merchants `[id]` products / customers | `OPS_SUPPORT` | — |
| Communications segments GET | `OPS_OWNER` / `OPS_ADMIN` / `OPS_SUPPORT` (existing check) + **`storeId` required** | — |
| Communications logs GET | same + **`storeId` required** | — |
| Bulk notifications POST | — | `OPERATOR` |
| Email drain (manual, no job token) | — | `SUPERVISOR` |
| MFA setup / verify / disable | Authenticated ops user (self); no extra role gate | — |

Shared JSON mapping for `requireSession` / `requireRole` failures: `Frontend/ops-console/src/lib/ops-api-auth.ts` → **`opsApiAuthErrorResponse`**.

### 8.3 `apps/*` vs `Frontend/*`

**`Frontend/merchant`** is the canonical merchant app and BFF. **`apps/merchant`** currently holds a small subset of pages (e.g. settings); it does **not** duplicate the full `Frontend/merchant` API tree. Security-sensitive work should land under **`Frontend/*`** unless `apps/merchant` is explicitly promoted to first-class; reconcile or remove duplicate trees in a dedicated cleanup if both stay long term.

### 8.4 Still open (by design)

- **§2 Phase A:** Ongoing core-api tenant proofs and optional grep/CI ratchet.
- **§5 Phase D:** **Ops route auth guard** runs in [`.github/workflows/ops-guard.yml`](../../.github/workflows/ops-guard.yml) via `Frontend/ops-console/scripts/verify-api-route-auth.sh` (also `pnpm --filter @vayva/ops-console verify-api-auth`). Remaining: Playwright smoke, monitoring runbooks.
- **§3.1** Public / webhook / storefront per-route hardening when product mandates stricter signing or slugs.
