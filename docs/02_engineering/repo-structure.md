# Repo Structure (Vayva)

**Owner:** Nyamsi Fredrick, Founder
**Last updated:** 2026-03-04

## Purpose
This document is the canonical map of the monorepo.

## Top-level directories
- `Frontend/` — Next.js apps
- `Backend/` — core API + worker
- `infra/` — infrastructure packages (notably Prisma DB client wrapper)
- `packages/` — shared libraries
- `platform/` — CI + infra helpers + deployment scripts
- `tests/` — repo-level tests
- `scripts/` — repo scripts

## Workspace layout (pnpm)
Workspace patterns are defined in `pnpm-workspace.yaml`:
- `frontend/*`
- `backend/*`
- `packages/ui`, `packages/shared/*`, `packages/infra/*`, `packages/domain/*`, etc.

Note:
- The pnpm globs are lowercase (`frontend/*`, `backend/*`).
- The on-disk directories in this repo are capitalized (`Frontend/`, `Backend/`).

## Root scripts (common)
From root `package.json`:
- `pnpm -w dev` — run dev tasks
- `pnpm -w build` — build via Turbo
- `pnpm -w typecheck` — runs `platform/ci/run-typecheck.mjs`
- `pnpm -w db:generate` — generate Prisma client
- `pnpm -w db:push` — push schema to DB

## Where code lives
### API routes
- Core API: `Backend/core-api/src/app/api/**`
- Ops API: `Frontend/ops-console/src/app/api/ops/**`

### Shared UI
- `packages/ui`

### Database
- Schema: `platform/infra/db/prisma/schema.prisma`
- DB client wrapper: `infra/db/src/client.ts` (exported as `@vayva/db`)

### Testing
- Playwright config: `platform/testing/playwright.config.ts`
- E2E tests: `tests/e2e/**`

## Known divergence
The root `README.md` contains older references to `apps/*` and `services/*`. Treat the filesystem as source of truth.
