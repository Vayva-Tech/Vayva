# Access Control

**Owner:** Nyamsi Fredrick, Founder
**Last updated:** 2026-03-04

## Purpose
Define **enforceable** access-control rules for all HTTP surfaces.

This doc is written as a checklist you can apply during PR review. If a route does not satisfy the applicable checklist, it should not ship.

## Surfaces
- Merchant Admin
- Ops Console
- Storefront

## Threat model summary
- Merchants must never access other merchants’ data.
- Customers must never access merchant/admin-only routes.
- Ops routes must never be reachable without ops session.

## Enforcement layers
- Middleware guards
- Server-side route handler checks
- Database scoping by `storeId`

## Route classes (pick exactly one)

### 1) Public routes
Definition:
- No authenticated merchant session is required.
- Examples: storefront pages, public webhooks, public forms.

Non-negotiables:
- Any state-changing action must use POST/PUT/PATCH/DELETE (no state-changing GET).
- Input validation must reject unexpected fields.
- If the route calls a paid provider (e.g. LLM, shipping), it must be rate-limited.
- Responses must not leak internal identifiers unless explicitly required.

### 2) Merchant routes
Definition:
- Route requires an authenticated merchant session.
- Used for merchant dashboard features and merchant-owned resources.

Non-negotiables:
- Auth must be structural (hard to forget). Prefer the shared merchant API wrapper.
- Tenant isolation must be enforced server-side using `storeId` derived from session.
- Never accept `storeId` from the client if it can be derived from session.

### 3) Ops routes
Definition:
- Route requires an authenticated ops session.
- Used for internal back-office administration.

Non-negotiables:
- Ops API routes must be wrapped by the ops auth wrapper.
- Authorization must be checked by role/permission.
- Ops routes must never be reachable from a merchant session alone.

## Merchant Admin access control
### Enforceable checklist (merchant API routes)
For any route under the merchant app API surface:

1. **Auth wrapper is used**
   - The handler uses the merchant API wrapper (`withVayvaAPI`) or an equivalent structural guard.
   - The wrapper must derive `storeId` from session.
2. **Permission is declared**
   - The wrapper is passed a permission key (or explicit `null` only for intentionally public merchant endpoints).
3. **Tenant isolation is enforced**
   - All DB reads/writes for tenant-owned resources include `where: { storeId }`.
   - Any lookup by `id` must also include `storeId` scoping.
4. **No client-provided storeId**
   - The handler never trusts `storeId` from JSON/body/query.
5. **Input is validated**
   - Params are parsed and validated (UUID/slug formats).
   - Bodies are schema-validated (Zod or equivalent).
6. **State-changing methods are correct**
   - No state-changing GET.
   - Prefer POST/PUT/PATCH/DELETE.
7. **Rate limiting is present when needed**
   - Auth routes, enumeration-prone routes, and any expensive provider calls are rate-limited.
8. **Error handling is safe**
   - No secret leakage.
   - Avoid returning raw upstream error payloads.

### CI guardrails
The repo has CI checks for merchant routes:
- `pnpm -w ci:guards`

## Ops Console access control
### Enforceable checklist (ops API routes)
For any route under the ops API surface:

1. **Ops auth wrapper is used**
   - The handler uses the ops auth wrapper (`withOpsAuth`) unless explicitly whitelisted.
2. **Authorization is explicit**
   - Route declares required role, required category, or required permission.
3. **No mixed-session access**
   - Merchant cookies/sessions are not treated as ops authentication.
4. **Input validation**
   - Params and body validated.
5. **Safe responses**
   - No internal secrets in response payloads.
   - Avoid leaking raw stack traces.

### Ops UI routes
- Ops UI routes must be protected by middleware/layout guard.
- Any server actions used by ops UI must also enforce ops auth.

## Storefront access control
### Enforceable checklist (public storefront routes)
1. **Rate limiting**
   - Required for routes that can be abused (quotes, AI, shipping, auth-like endpoints).
2. **No tenant escalation**
   - If `storeId` is accepted (public context), validate it and scope queries by it.
   - Do not accept any privileged identifiers that would allow cross-tenant access.
3. **Safe identifiers**
   - Prefer slugs/public IDs over internal primary keys.
4. **Provider safety**
   - Protect paid provider calls with validation + rate limits + timeouts.

## Tenant isolation (non-negotiable)
- Any DB query for tenant-owned resources must include `storeId` scoping.
- Never accept `storeId` from the client if it can be derived from session.

### Tenant isolation invariants (apply to all apps)
1. **All tenant data is keyed by storeId**
   - Tables containing merchant-owned data must be queryable by `storeId`.
2. **No naked `findUnique({ where: { id } })` for tenant-owned resources**
   - Prefer `findFirst({ where: { id, storeId } })` or equivalent.
3. **Joins must not bypass storeId**
   - If you join via relations, ensure the root query is scoped by `storeId`.
4. **Cross-tenant writes are impossible**
   - Update/delete must include `storeId` in the where clause.
5. **Derive storeId from session**
   - For merchant routes, storeId comes from auth context, not client input.

## Code review checklist
When reviewing a PR that adds/changes routes:
1. Identify route type:
   - public
   - merchant
   - ops
2. Apply the checklist for that route class (above).
3. Confirm tenant isolation invariants are satisfied.
4. Confirm rate limits exist (for public / abuse-prone routes).
5. Confirm errors do not leak secrets.

## How to audit routes (commands)
From repo root:
```bash
# list all route handlers
find Backend Frontend -name route.ts

# find ops routes
rg -n "src/app/api/ops" Frontend/ops-console

# search for storeId scoping
rg -n "storeId" Backend Frontend
```

## Notes
- Merchant API routes should prefer the merchant wrapper for structural enforcement.
- Ops API routes should use the ops wrapper for structural enforcement.
