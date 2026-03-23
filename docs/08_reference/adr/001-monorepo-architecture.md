# ADR 001 — pnpm Monorepo with TurboRepo

| Field | Value |
|-------|-------|
| Status | Accepted |
| Date | 2024 (initial) |
| Deciders | Engineering team |
| Last reviewed | March 2026 |

---

## Context

Vayva is a multi-product platform comprising four Next.js frontends (marketing site, merchant dashboard, ops console, storefront), two backend services (NestJS core API, background worker), and a large set of shared domain packages (UI components, Prisma client, AI agent, payments, schemas, industry verticals, and more). As of early 2026 the repository contains over 50 packages.

Before the current architecture, code was split across separate repositories. This created several friction points:

- Making a cross-cutting change (e.g., updating the Prisma schema, changing a shared type) required opening PRs in multiple repos, coordinating merges, and publishing intermediate package versions.
- There was no enforced build order: a consumer could depend on a stale build of a shared package without noticing until runtime.
- Testing across package boundaries was impractical; integration tests had to be written against published npm packages rather than local source.
- Onboarding new contributors required cloning and setting up multiple repositories.

---

## Decision

Consolidate all code into a single **pnpm workspace monorepo** orchestrated by **TurboRepo**.

**pnpm** was chosen as the package manager for:

- Native workspace support with symlinked `node_modules`, enabling cross-package imports of local source without publish/link steps.
- The `pnpm-lock.yaml` single lockfile guarantees deterministic installs across all packages in one operation.
- The `pnpm overrides` field provides a single place to resolve transitive dependency conflicts (e.g., pinning `ioredis`, `tar`, `esbuild`, `lodash` to safe versions).
- Significantly faster installs than npm or yarn due to the content-addressable store.

**TurboRepo** was chosen as the task orchestrator for:

- Defining a task pipeline with explicit `dependsOn` relationships (`build` depends on `^build`, meaning all dependency builds must complete first), guaranteeing correct build order across the 50+ packages.
- Remote and local caching: unchanged packages are not rebuilt, dramatically reducing CI times.
- Parallel execution within the dependency graph — packages with no interdependency are built concurrently.
- A single `turbo run build` or `turbo run dev` command at the root operates the entire monorepo consistently.
- The `globalPassThroughEnv` list in `turbo.json` provides a single place to enumerate every environment variable that any package may need, making it easy to audit what secrets are in use.

---

## Alternatives Considered

### Separate repositories (status quo before decision)

Rejected. Cross-cutting changes were too costly, and there was no way to run integration tests across package boundaries without publishing.

### Yarn Workspaces + Lerna

Considered but rejected in favour of pnpm + TurboRepo. pnpm's strict `node_modules` layout prevents phantom dependencies (a package accidentally using a dependency it did not declare). TurboRepo's caching is simpler to configure than Lerna's and supports both local and remote caches out of the box.

### Nx

Nx is a capable alternative to TurboRepo. It was not chosen because TurboRepo's configuration (`turbo.json`) is simpler for a team already familiar with standard tooling, and Nx's additional features (generators, project graph UI) were not needed at the time of the decision.

### Changesets for versioning

The shared packages are not published to npm — they are consumed only within the monorepo via workspace protocol (`workspace:*`). Changesets was therefore not adopted; versioning and releases are managed purely through Git branches and tags.

---

## Consequences

### Positive

- A single `pnpm install` and `pnpm dev` from the repo root boots the entire platform.
- Build correctness is enforced by TurboRepo's dependency graph — no more stale shared packages.
- CI runs only the tasks affected by a given change thanks to TurboRepo's content-based caching.
- All packages share a single `tsconfig.base.json`, `eslint` configuration, and Prettier config, enforcing consistent code style without per-package boilerplate.
- The Prisma schema and generated client live in one place (`platform/infra/db/prisma/`) and are consumed by all packages that need database access.

### Negative / Trade-offs

- **Repository size:** With 50+ packages and their dependencies symlinked, the repo is large. `git clone` takes longer than a single-package repo.
- **pnpm version coupling:** The `packageManager` field in the root `package.json` pins pnpm to a specific version (`pnpm@10.2.0`). Upgrading pnpm requires updating this field and verifying all install scripts still work.
- **Turbopack incompatibility:** Some workspace packages have module resolution issues when Next.js uses Turbopack. All builds use `next build --webpack` as a workaround (see ADR 002).
- **Onboarding complexity:** New contributors must understand the workspace structure and TurboRepo task pipeline before making cross-package changes. This is mitigated by this documentation.

---

## References

- `pnpm-workspace.yaml` — workspace package glob definitions
- `turbo.json` — TurboRepo pipeline and environment variable configuration
- `package.json` — root scripts (`pnpm dev`, `pnpm build`, `pnpm db:generate`, etc.)
- [TurboRepo documentation](https://turbo.build/repo/docs)
- [pnpm workspaces documentation](https://pnpm.io/workspaces)
