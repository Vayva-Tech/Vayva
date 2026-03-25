# Merchant app: type safety, route QA, and beta cleanup — phased plan

This document describes the **merchant frontend** workstream for (1) removing obsolete beta UI, (2) tightening auth/session behavior, (3) **automated per-route load QA**, and (4) migrating **`page.tsx` files off `// @ts-nocheck`** in safe phases. It records **what is done**, **what is deferred**, and **how to finish**.

**Related**

- [Frontend architecture](../02_engineering/frontend-architecture.md) (App Router layout, beta routes)
- [ADR 004 — Merchant BFF & frontends OAuth](./adr/004-merchant-bff-frontends-oauth.md)
- [Remaining tenancy & security scope](./remaining-tenancy-security-scope.md) (BFF / core-api boundaries)

---

## 0. Goals and non-goals

**Goals**

- Remove the **beta “industry dashboards” waitlist** now that industry views are merged into **Pro+** (no duplicate beta entry point).
- Keep **one manifest of every merchant `page.tsx` URL** and a **repeatable stress/smoke** that visits them (authenticated) to surface **5xx** and hard navigation failures.
- Reduce reliance on `// @ts-nocheck` so **`pnpm exec tsc --noEmit`** in `Frontend/merchant` catches real regressions on as many pages as possible.

**Non-goals**

- Removing **product** feature flags or navigation for **real** industry dashboards (`IndustryDashboardRouter`, `canAccessIndustryDashboards`, `/dashboard/industries`, core-api `industry_dashboards` gating). Those are **not** the deleted beta waitlist.
- Replacing the route stress test with full visual regression or accessibility audits (can be later phases).
- Fixing every BFF `// @ts-nocheck` on **API** routes in this same document (separate backlog).

---

## Phase 1 — Remove beta industry-dashboard waitlist (complete)

**Intent:** Delete the standalone beta page and API that only existed to collect waitlist signups for “industry dashboard previews.” Industry experiences now ship under the main product (Pro+).

**Removed**

- `Frontend/merchant/src/app/(dashboard)/beta/industry-dashboards/page.tsx`
- `Frontend/merchant/src/app/api/beta/industry-dashboards-waitlist/route.ts` and the empty `src/app/api/beta` tree (once no other routes lived there)

**Updated**

- `docs/02_engineering/frontend-architecture.md` — beta list no longer references `beta/industry-dashboards/`.

**Regenerated**

- `Frontend/merchant/e2e/merchant-routes.json` — route count drops by one (e.g. 302 URLs after removal).

**Exit criteria**

- No references to `/beta/industry-dashboards` or `/api/beta/industry-dashboards-waitlist` in the repo.
- `pnpm run generate:merchant-routes` runs cleanly (see script comment: do not use `**/page` inside block comments in `.mjs` files).

---

## Phase 2 — Auth, session, and shell consistency (complete)

**Intent:** Align **server** dashboard layout with **middleware** and **cookie**-based merchant JWT (`vayva_session`), and polish sign-in / verify / sign-out UX.

**Delivered (high level)**

| Area | Change |
|------|--------|
| `getSessionUser()` | Resolves user via **`requireAuthFromRequest`** built from current `cookies()`, so **`vayva_session`** validates like BFF routes and middleware token checks. |
| OTP session cookie | Optional **`rememberMe`** on verify-otp path: longer **`maxAge`** on `vayva_session` when true (sign-in stores preference in `sessionStorage` before redirect to `/verify`). |
| Sign-in | Banner for **`?reset=success`** after password reset. |
| Verify | Redirect to `/signin` if `email` missing; green UI aligned with sign-in; dev auto-verify gated on email. |
| Admin shell | User menu **Escape** + **click-outside**; consistent **“Sign out”** copy; menu button **`aria-expanded`**. |
| Account deletion | Post-delete redirect to **`/signin`**. |

**Exit criteria**

- Dashboard server layout no longer assumes **only** NextAuth for users who only have `vayva_session`.
- `pnpm exec tsc --noEmit` passes for the merchant app (with remaining page-level `@ts-nocheck` where still applied — see Phase 4–5).

---

## Phase 3 — Route inventory and automated load QA (complete)

**Intent:** Treat “every page loads without blowing up” as a **repeatable** check, not a one-off manual crawl.

**Artifacts**

| Artifact | Purpose |
|----------|---------|
| `Frontend/merchant/e2e/merchant-routes.json` | Canonical list of URLs (dynamic segments replaced with placeholders such as `1`). |
| `Frontend/merchant/scripts/generate-merchant-routes.mjs` | Regenerates the JSON from `src/app/**/page.tsx`. |
| `Frontend/merchant/e2e/merchant-route-stress.spec.ts` | Playwright: **sign in**, then **sequentially** `goto` each route, `domcontentloaded`, fail on **HTTP ≥ 500** or navigation errors; logs slow routes. |
| `Frontend/merchant/scripts/merchant-route-fetch-stress.mjs` | Optional **concurrent GET** stress against `STRESS_BASE_URL` (unauthenticated by default → expect redirects/401 on protected paths; optional cookie env for auth). |

**Package scripts** (`Frontend/merchant/package.json`)

- `generate:merchant-routes` — refresh the JSON.
- `test:e2e:route-stress` — Playwright full route crawl (long-running; serial; high timeout).
- `stress:routes:fetch` — Node fetch stress.

**Exit criteria**

- After adding/removing pages, CI or a release checklist runs **`pnpm run generate:merchant-routes`** and commits updated JSON when routes change.
- Teams run **`pnpm run test:e2e:route-stress`** against an environment with **E2E auth** (`e2e/fixtures/auth.ts`, dev OTP bypass, etc.) before major releases.

**Limitations (by design)**

- Does **not** assert business correctness, empty states, or API contracts — only **transport-level** health and **hard** client failures.
- Sequential browser crawl is **slow** (hundreds of routes); tune timeouts per environment.

---

## Phase 4 — Bulk removal of `// @ts-nocheck` on `page.tsx` (complete)

**Intent:** Remove `// @ts-nocheck` from all `src/app/**/page.tsx` files and fix TypeScript until `tsc` is green.

**What happened**

- Stripping **`// @ts-nocheck`** from every `page.tsx` surfaced a **large** set of real issues (missing imports, wrong component props, `useSearchParams` / `params` nullability, missing workspace packages such as `@vayva/workflow-engine`, duplicate identifiers, domain type drift vs shared types, etc.).
- Work was completed in **clusters** (Phase 5) until **`rg -l '@ts-nocheck' --glob '**/page.tsx' src/app`** returned **no paths** and **`pnpm exec tsc --noEmit`** stayed green.

**TypeScript rule (still apply when adding pages):** `// @ts-nocheck` must be the **first line of the file** (before `"use client"`). If it sits **below** `"use client"`, **it does not suppress** errors for that file.

**Current numbers**

- **~302** `page.tsx` files under `Frontend/merchant/src/app`.
- **0** `page.tsx` files with **`// @ts-nocheck`**.

**Command to re-count**

```bash
cd Frontend/merchant
find src/app -name 'page.tsx' | wc -l
rg -l '@ts-nocheck' --glob '**/page.tsx' src/app | wc -l
```

**Exit criteria for “Phase 4 closed”**

- No deferred `page.tsx` files use `@ts-nocheck`; `tsc` stays green (**done**).

---

## Phase 5 — Strict typing for the remaining `page.tsx` files (complete)

**Intent:** Clear the previously deferred pages in **clusters** so each batch is reviewable and `tsc` remains green.

Suggested **workstreams** (map to failing patterns from the bulk strip):

| Workstream | Typical fixes | Suggested order |
|------------|---------------|-----------------|
| **A — Shared UI imports** | Add missing `Label`, `Dialog*`, `Select*`, `Badge`, `Input`, framer-motion `motion` / `AnimatePresence`, `Icon`, lucide `Loader2` / `X` / `Plus`, etc., from `@vayva/ui`, `@/components/ui/*`, or `lucide-react` as appropriate. | High volume; do first. |
| **B — Next.js 15+ hook nullability** | `useSearchParams()` and `params` can be `null` — use optional chaining, early return, or non-null assertions only where provably safe. | Quick wins across many files. |
| **C — Legal pages** | Align `LegalPageLayout` props with `IntrinsicAttributes` (e.g. `document` vs actual prop name). | Small file count. |
| **D — Controlled vs uncontrolled primitives** | `Switch` and similar: replace `defaultChecked`-only usage with **`checked` + `onCheckedChange`** (or use a primitive that supports uncontrolled if design allows). | Settings / legal subpages. |
| **E — Workflows** | Resolve `@vayva/workflow-engine` (add package, path alias, or `declare module` shim), fix **`Workflow` type vs value** collision, align `WorkflowListItem` shape. | Isolated feature area. |
| **F — Domain types** | Payouts, transactions, events: align UI comparisons and fields with shared types (`SUCCESS` vs `completed`, `CHARGE` vs `credit`, optional metrics). | Per-domain PRs. |
| **G — One-off bugs** | Example: account edit `formData` / `setFormData` naming, `FileUpload` prop names, `HubGrid` `loading` prop, location modal props. | Fix as discovered. |

**Per-batch exit criteria**

- Remove `// @ts-nocheck` from every file in the batch.
- `cd Frontend/merchant && pnpm exec tsc --noEmit` passes.
- Optional: run **`pnpm run test:e2e:route-stress`** on touched routes in a dev environment.

**Follow-up (separate from this doc’s original scope)**

- Many **`src/app/api/**/route.ts`** files and some **shared components** still use **`// @ts-nocheck`**; tightening those is a **BFF / shared-module backlog** (see non-goals above). Dashboard **`layout.tsx`** under `src/app` should stay strict where possible.
- **API batches cleared (strict `tsc`):** `src/app/api/account/**` — overview, domains (+ verify), store, security, profile (`route.ts` only; other account routes were already strict). **`src/app/api/dashboard/**`** — recent-orders, inventory-alerts, earnings, customer-insights, activity. **`src/app/api/customers/**`** — list, `[id]` (GET/PATCH/DELETE), summary, insights. **`src/app/api/collections/**`** — list, `[id]` (GET/PUT/DELETE; auth + id validation were missing under `@ts-nocheck` and are now fixed). **`src/app/api/products/**`** — categories, `items/[id]`, `[id]` (GET/PATCH/DELETE), publish, inventory + history, calendar-sync, variants + `[variantId]`, bulk + bulk-status + bulk-delete (several routes referenced undefined `auth`/`storeId`; **`bulk`** used undefined `user.id` — now `auth.user.id` or `email`). **`src/app/api/orders/**`** — `[id]` (GET/PATCH/DELETE), notes, delivery manual-status + dispatch (`[id]` had undefined `auth`/`storeId`; dispatch tightened types and **`orderId`** validation). **`src/app/api/bookings/**`** — list + `[id]` (GET/PATCH/DELETE; **`auth`** was undefined; PATCH used undefined **`storeId`** — now **`auth.headers`**). **`src/app/api/leads/**`** — `[id]` GET/PATCH (undefined **`LeadBody`** under `@ts-nocheck` → **`LeadPatchBody`** + **`id`** checks). **`src/app/api/posts/**`** — list (**`auth`** was undefined; query via **`URLSearchParams`**). **`src/app/api/inventory/**`** — transfers + locations GET (**`auth`** was undefined). **`src/app/api/menu-items/**`** — POST (**`auth`** + **`unknown`** body / response **`data`**). **`src/app/api/calendar/**`** — events GET (**`auth`** was undefined). **`src/app/api/checkout/initialize`** — POST (undefined **`user.email`** → **`auth.user.email`**; explicit **`CheckoutItem`** + body narrowing). **`src/app/api/billing/**`** — upgrade + subscription GET (**`auth`** was undefined). **`src/app/api/wallet/**`** — balance GET, pin verify + reset-request POST, payouts GET, withdraw quote POST (**`auth`** / **`user.id`/`user.email`** fixes; **`withdraw/quote`** had missing **`NextRequest`** import). **`src/app/api/onboarding/check-slug`** — GET (removed broken **`apiJson`/`auth`**; **slug taken** check via **`prisma.store`**). **`src/app/api/team/invites/accept`** — GET/POST (**`crypto`**, **`bcryptjs`**, **`prisma`**, **`AppRole`** imports; **`encodeURIComponent(token)`**; body narrowing; **`MembershipStatus`** via typed **`"ACTIVE"`**). **`src/app/api/settings/industry`**, **`automation/rules`**, **`appeals`** — GET (**`auth`** was undefined). **`src/app/api/events`** — GET/PATCH/POST (GET catch returns **500** instead of **`throw`**; **`URLSearchParams`**; POST body **`unknown`** + **`logger.error`** metadata object). **`src/app/api/shipping/**`** — Kwik quote GET (cleanup imports); custom quote POST (**no `ShippingQuote` Prisma model** — returns **`crypto.randomUUID()`** quote id + logs). **`src/app/api/domains/[id]`** + **`verify`** — DELETE/POST (**`id`** checks, unused **`storeId`** removed). **`src/app/api/uploads/finalize`** + **`delete`** — undefined **`user.id`** → **`auth.user.id`**; purpose validation; dropped unused imports. **`src/app/api/templates/mine/**`** — list GET/POST, **`[id]`** DELETE, **`duplicate`** POST (**`correlationId`** via **`x-request-id` || `randomUUID()`**; removed undefined **`correlationId`** / unused **`PERMISSIONS`**). **`src/app/api/kyc/upload-url`** — POST (**`success`/`error`** on response type; **`unknown`** body). **`src/app/api/ops/support/tickets/**`** — stats, list, **`[id]`** GET/PATCH, **`reply`** POST (**`logger`** import; **`params.id`** in **`catch`** fixed; **POST list create** + **PATCH ticket** no longer use invalid **Prisma** shapes — **proxied to `BACKEND_API_URL`** like GET/reply).

---

## Phase 6 — Per-page product QA (ongoing)

**Intent:** Beyond TypeScript and HTTP status, validate **behavior**: loading states, empty states, error toasts, and correct API wiring.

**Automation (already in place)**

- **`test:e2e:route-stress`** — breadth over depth (see Phase 3).

**Manual / deeper QA (suggested matrix)**

| Journey | What to verify |
|---------|----------------|
| Auth | Sign-in, OTP verify, forgot/reset password, sign-out, session cookie lifetime with/without remember-me. |
| Onboarding | Step progression, redirects when incomplete vs complete. |
| Core commerce | Products, orders, customers — list/detail, mutations, permissions. |
| Billing | Plans, trial, payment flows linked from merchant. |
| Settings | Team, security, integrations — save flows and error handling. |

**Exit criteria**

- Critical journeys have **dedicated E2E specs** (beyond route stress); route stress remains a **release gate** for “nothing explodes on navigation.”

---

## Appendix A — Maintenance checklist

1. Add or remove a `page.tsx` → run **`pnpm run generate:merchant-routes`** and commit **`e2e/merchant-routes.json`** if it changed.
2. Before release → run **`pnpm run test:e2e:route-stress`** (or nightly) on a stack with valid E2E credentials / dev bypass.
3. When tightening types → remove **`// @ts-nocheck`** only after **`tsc`** is green for that file.

---

## Appendix B — List of deferred strict pages (regenerate anytime)

The exact set changes as pages are fixed. Generate the list:

```bash
cd Frontend/merchant
rg -l '@ts-nocheck' --glob '**/page.tsx' src/app | sort
```

When Phase 5 is complete, this command should return **no paths**.
