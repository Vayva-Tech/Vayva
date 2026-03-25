# Getting Started

This guide walks you through setting up the Vayva platform for local development.

---

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| **Node.js** | >= 20 | Use [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm) to manage versions |
| **pnpm** | 10.2.0 | Install with `corepack enable && corepack prepare pnpm@10.2.0 --activate` |
| **PostgreSQL** | 15+ | Local instance or cloud-hosted (Supabase, Neon, etc.) |
| **Redis** | 7+ | Local instance or cloud-hosted (Upstash, etc.) |
| **Git** | Latest | Required for version control |

Optional but recommended:
- **Docker** -- for running PostgreSQL and Redis locally
- **Turbo CLI** -- `pnpm add -g turbo` for direct turbo commands

---

## 1. Clone the Repository

```bash
git clone <repo-url> vayva
cd vayva
```

---

## 2. Install Dependencies

```bash
pnpm install
```

This will:
1. Install all workspace dependencies
2. Run `postinstall` which triggers `turbo run db:generate` to generate the Prisma client

---

## 3. Environment Setup

Each application needs its own `.env` file. Create them from the examples or set them manually.

### Root-level environment variables

These are passed through to all workspaces via TurboRepo's `globalPassThroughEnv` in `turbo.json`.

### Required variables

Create `.env` files in the relevant workspace directories:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/vayva"
DIRECT_URL="postgresql://user:password@localhost:5432/vayva"

# Redis
REDIS_URL="redis://localhost:6379"

# Auth
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
BETTER_AUTH_SECRET="your-secret-here"
BETTER_AUTH_URL="http://localhost:3000"

# Payments (Paystack)
PAYSTACK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_PAYSTACK_KEY="pk_test_..."

# Email (Resend)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@vayva.ng"
EMAIL_HELLO="hello@vayva.ng"

# WhatsApp (Evolution API)
EVOLUTION_API_URL="http://163.245.209.202:8080"
EVOLUTION_API_KEY="your-evolution-api-key"

# AI (OpenRouter)
OPENROUTER_API_KEY="sk-or-..."

# File Storage (MinIO)
MINIO_ENDPOINT="your-minio-endpoint"
MINIO_ACCESS_KEY="your-access-key"
MINIO_SECRET_KEY="your-secret-key"
MINIO_BUCKET="vayva"
MINIO_PUBLIC_BASE_URL="https://your-minio-public-url"

# Internal
INTERNAL_API_SECRET="your-internal-secret"

# Public URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_MARKETING_URL="http://localhost:3001"
NEXT_PUBLIC_STOREFRONT_URL="http://localhost:3001"
NEXT_PUBLIC_OPS_URL="http://localhost:3002"
```

> **Security note:** Never commit `.env` files. They are gitignored by default.

---

## 4. Database Setup

### Push the schema to your database

```bash
pnpm db:push
```

This applies the Prisma schema to your PostgreSQL database without creating migration files (useful for development).

### Generate the Prisma client

```bash
pnpm db:generate
```

This is also run automatically on `pnpm install`.

### Seed the database (optional)

```bash
pnpm db:seed
```

---

## 5. Running Locally

### Run everything

```bash
pnpm dev
```

This starts all workspaces in development mode with hot reloading (concurrency=30 via TurboRepo).

| Application | URL |
|---|---|
| Merchant Dashboard | http://localhost:3000 |
| Marketing Site | http://localhost:3001 |
| Ops Console | http://localhost:3002 |
| Storefront | http://localhost:3001 |

> Note: Marketing and Storefront share port 3001 by default. Run them individually if you need both simultaneously, or change the PORT.

### Run individual apps

```bash
# Merchant dashboard only
pnpm --filter @vayva/merchant dev

# Marketing site only
pnpm --filter @vayva/marketing dev

# Ops console only
pnpm --filter @vayva/ops-console dev

# Storefront only
pnpm --filter @vayva/storefront dev
```

---

## 6. Common Workflows

### Adding a new dependency

```bash
# Add to a specific workspace
pnpm --filter @vayva/merchant add <package>

# Add to root (dev dependency)
pnpm add -D -w <package>

# Add a workspace dependency
pnpm --filter @vayva/merchant add @vayva/ui@workspace:*
```

### Working with the database

```bash
# After changing schema.prisma
pnpm db:generate   # Regenerate Prisma client
pnpm db:push       # Push changes to database
```

The Prisma schema is located at: `platform/infra/db/prisma/schema.prisma`

### Running tests

```bash
# All tests
pnpm test

# Tests for a specific workspace
pnpm --filter @vayva/merchant test
pnpm --filter @vayva/ops-console test

# E2E tests
pnpm test:e2e

# E2E with Playwright UI
pnpm test:ui
```

### Type checking

```bash
# Check all workspaces
pnpm typecheck

# Check a specific workspace
pnpm --filter @vayva/merchant typecheck
```

### Pre-ship validation

Before pushing to production, run the full validation suite:

```bash
pnpm validate:ship
```

This runs: `doctor` -> `lint` -> `build` -> `test:e2e`

### Health check

```bash
pnpm doctor
```

The doctor script checks for common issues in your local setup.

---

## 7. Project Conventions

- **TypeScript everywhere** -- no JavaScript files, no `@ts-nocheck` directives. Fix actual type errors.
- **Prisma for database** -- all database access goes through the Prisma client from `@vayva/db`.
- **Zod for validation** -- shared schemas live in `packages/schemas`.
- **Workspace imports** -- use `@vayva/<package>` imports, never relative paths across workspace boundaries.
- **Audit logging** -- all sensitive operations must create audit log entries.
- **Store-scoped queries** -- every database query must be scoped to a `storeId` to prevent cross-tenant data access.

---

## Troubleshooting

### `prisma generate` fails

Make sure `DATABASE_URL` is set in your environment. The Prisma schema is at `platform/infra/db/prisma/schema.prisma`.

### Port conflicts

If port 3000/3001/3002 is already in use:

```bash
PORT=3010 pnpm --filter @vayva/merchant dev
```

### pnpm install fails

Ensure you are using pnpm 10.2.0:

```bash
corepack enable
corepack prepare pnpm@10.2.0 --activate
```

### TurboRepo cache issues

```bash
turbo run build --force
```

This bypasses the cache and rebuilds everything.
