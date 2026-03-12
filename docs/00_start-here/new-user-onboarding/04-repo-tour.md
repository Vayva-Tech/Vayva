# Repo Tour (Vayva)

This is a guided walkthrough of the repo layout and where to look for things.

## Top-level
- `Frontend/`
  - `merchant-admin/` — merchant dashboard
  - `ops-console/` — internal ops
  - `storefront/` — customer storefront
  - `marketing/` — public marketing site
- `Backend/`
  - `core-api/` — primary API surface (Next route handlers)
  - `worker/` — background jobs
- `infra/`
  - `db/` — Prisma + generated client exported as `@vayva/db`
- `packages/`
  - shared libraries (UI, shared utils, domain packages)
- `platform/`
  - CI scripts, infra helpers, deployment scripts
- `tests/`
  - repo-level Playwright/integration/load tests
- `scripts/`
  - repo scripts (one-off and CI helpers)

## Important repo-level files
- `package.json` (root scripts)
- `pnpm-workspace.yaml` (workspace globs)
- `turbo.json` (task orchestration)
- `.nvmrc` (Node version)
- `.env.example` (env template)

## Key workflows (where to look)
### Database
- Schema (root prisma config points here): `platform/infra/db/prisma/schema.prisma`
- Workspace DB package: `infra/db` exports `@vayva/db`
- Generate Prisma client:
  - repo script: `pnpm -w db:generate`

### API routes
- Core API route handlers: `Backend/core-api/src/app/api/**`
- Ops API routes: `Frontend/ops-console/src/app/api/ops/**`

### UI
- Shared components: `packages/ui`

### Tests
- Playwright config: `platform/testing/playwright.config.ts`
- E2E tests: `tests/e2e/**`

## Known doc mismatch you must ignore
The root `README.md` still mentions `apps/*` and `services/*` in some sections. The current repo layout is `Frontend/*` and `Backend/*`.
