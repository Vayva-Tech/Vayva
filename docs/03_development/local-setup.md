# Local Development Setup

> Vayva Engineering — Last updated: March 2026
> Owner: Engineering

This guide walks a new contributor through setting up the Vayva monorepo on their local machine, from prerequisites through running all services.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Cloning the Repository](#cloning-the-repository)
3. [Installing Dependencies](#installing-dependencies)
4. [Environment Variables](#environment-variables)
5. [Local Infrastructure (Database, Redis, MinIO)](#local-infrastructure)
6. [Database Migrations](#database-migrations)
7. [Starting Dev Servers](#starting-dev-servers)
8. [Monorepo Structure](#monorepo-structure)
9. [Turbopack vs Webpack](#turbopack-vs-webpack)
10. [Common Setup Issues](#common-setup-issues)

---

## Prerequisites

Install the following tools before cloning the repo. Versions listed are the minimum required; newer patch releases are fine.

| Tool | Minimum Version | Install |
|------|----------------|---------|
| Node.js | 20.x | [nodejs.org](https://nodejs.org) or `nvm install 20` |
| pnpm | 8.x (project uses 10.2.0) | `npm i -g pnpm` |
| PostgreSQL | 15.x | [postgresql.org](https://www.postgresql.org/download/) or Docker |
| Redis | 7.x | [redis.io](https://redis.io/docs/getting-started/) or Docker |
| Git | any recent | [git-scm.com](https://git-scm.com) |
| Docker (optional) | 24+ | [docker.com](https://www.docker.com) — simplest way to run Postgres + Redis |

> The project enforces `"node": ">=20"` in `package.json` engines. Running an older Node version will cause build failures.

---

## Cloning the Repository

```bash
git clone git@github.com:itsfredrick/vayva.git
cd vayva
```

The default branch is `main` (production). Active development happens on the `Vayva` branch:

```bash
git checkout Vayva
```

---

## Installing Dependencies

The project uses **pnpm workspaces** managed by **TurboRepo**. All packages are installed from the repo root with a single command:

```bash
pnpm install
```

This installs dependencies for every workspace package and runs `postinstall`, which triggers `turbo run db:generate` to generate the Prisma client automatically.

> Never run `npm install` or `yarn install` — they will not respect the workspace lockfile and will create conflicting `node_modules`.

---

## Environment Variables

Each application reads its own `.env.local` file (git-ignored). Template files are provided as `.env.example`.

### Root environment

```bash
cp .env.example .env.local
```

Key variables to fill in for local development:

| Variable | Purpose | Local value |
|----------|---------|-------------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql://vayva:vayva_password@localhost:5432/vayva_dev` |
| `REDIS_URL` | Redis connection | `redis://localhost:6379` |
| `BETTER_AUTH_SECRET` | Auth signing secret | Generate: `openssl rand -hex 32` |
| `NEXTAUTH_SECRET` | NextAuth signing secret | Generate: `openssl rand -hex 32` |
| `INTERNAL_API_SECRET` | Inter-service auth | Generate: `openssl rand -hex 32` |
| `GROQ_API_KEY` | AI features (Groq) | Get from [console.groq.com](https://console.groq.com/keys) |
| `PAYSTACK_SECRET_KEY` | Payments | Use test key from Paystack dashboard |
| `EVOLUTION_API_URL` | WhatsApp gateway | `http://163.245.209.202:8080` (staging) or local |
| `EVOLUTION_API_KEY` | WhatsApp API key | Provided by ops |

### Per-frontend environments

The merchant dashboard also has its own `.env.example`:

```bash
cp Frontend/merchant/.env.example Frontend/merchant/.env.local
```

Most values mirror the root `.env.local`. At minimum, set `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL=http://localhost:3000`, and any AI keys you need.

> Never commit `.env.local` or any file containing real secrets. The CI guard `check-docs-secrets` will fail the build if secrets leak into committed files.

---

## Local Infrastructure

The easiest way to run Postgres and Redis locally is Docker Compose. A pre-configured file is included:

```bash
docker compose -f docker-compose.dev.yml up -d
```

This starts:

| Service | Container | Port |
|---------|-----------|------|
| PostgreSQL 16 | `vayva-postgres-dev` | `5432` |
| Redis 7 | `vayva-redis-dev` | `6379` |
| MinIO (S3-compatible) | `vayva-minio-dev` | `9000` (API), `9001` (console) |

Default Postgres credentials (local only): user `vayva`, password `vayva_password`, database `vayva_dev`.

If you prefer a native installation, ensure Postgres is running on port 5432 and Redis on 6379, then update your `DATABASE_URL` and `REDIS_URL` accordingly.

---

## Database Migrations

After infrastructure is running, push the Prisma schema to your local database:

```bash
pnpm db:push
```

This applies all schema changes. For a fresh database you can also seed sample data:

```bash
pnpm db:seed
```

The Prisma schema lives at `platform/infra/db/prisma/schema.prisma`. The generated Prisma client is output to `packages/db/src/generated/client/`.

---

## Starting Dev Servers

### All services at once (recommended for full-stack work)

```bash
pnpm dev
```

TurboRepo starts all workspaces in parallel with a concurrency of 30. Services come up in dependency order.

### Individual frontends

For focused frontend work, start only the app you need:

| App | Package filter | Default port |
|-----|----------------|-------------|
| Marketing site | `pnpm --filter @vayva/marketing dev` | 3001 |
| Merchant dashboard | `pnpm --filter @vayva/merchant dev` | 3000 |
| Ops console | `pnpm --filter @vayva/ops-console dev` | 3002 |
| Storefront | `pnpm --filter @vayva/storefront dev` | 3001 |

> Storefront and marketing both default to port 3001. If you run them simultaneously, set `PORT=3003` for one of them.

### Backend services

```bash
# NestJS core API
pnpm --filter @vayva/merchant-api dev

# Background worker
pnpm --filter @vayva/worker dev
```

### Shared packages (watch mode)

When working on `@vayva/ui` or `@vayva/shared`, TurboRepo's `dev` task handles rebuilding automatically when you run `pnpm dev` from the root. For isolated package work:

```bash
pnpm --filter @vayva/ui dev
```

---

## Monorepo Structure

```
vayva/
├── Frontend/                  # Next.js 16 applications
│   ├── marketing/             # @vayva/marketing  (vayva.ng)
│   ├── merchant/              # @vayva/merchant   (merchant.vayva.ng)
│   ├── ops-console/           # @vayva/ops-console (ops.vayva.ng)
│   └── storefront/            # @vayva/storefront  (*.vayva.ng)
├── Backend/                   # Server-side services
│   ├── core-api/              # @vayva/merchant-api — NestJS REST API
│   └── worker/                # @vayva/worker — background job processor
├── packages/                  # Shared libraries
│   ├── ui/                    # @vayva/ui — design system components
│   ├── shared/                # @vayva/shared — utilities, types, logger
│   ├── db/                    # @vayva/db — Prisma client wrapper
│   ├── ai-agent/              # @vayva/ai-agent — AI/LLM integrations
│   ├── schemas/               # @vayva/schemas — Zod schemas
│   ├── integrations/          # @vayva/integrations — third-party connectors
│   └── ...                    # 50+ additional domain packages
├── platform/                  # CI, scripts, infra tooling
│   └── infra/db/prisma/       # Prisma schema & migrations
├── docs/                      # Project documentation
├── turbo.json                 # TurboRepo pipeline config
├── pnpm-workspace.yaml        # Workspace definitions
└── package.json               # Root scripts and devDependencies
```

Workspace globs defined in `pnpm-workspace.yaml`:

```
Frontend/*
Backend/*
packages/shared/*
packages/infra/*
packages/domain/*
platform/*
platform/*/*
governance/*
packages/ui
packages/compliance
packages/realtime
...
```

---

## Turbopack vs Webpack

All four Next.js frontends build with **webpack**, not Turbopack:

```json
"build": "next build --webpack"
```

Turbopack (`next dev --turbopack`) has been tested but causes module resolution issues with some workspace packages, particularly `@vayva/ui` and `@vayva/shared`. Until those are resolved, **do not enable Turbopack** for production builds or CI.

For local `dev` mode, the frontends omit `--webpack` and use Next.js's default (which may use Turbopack in Next.js 16). If you encounter HMR or module-not-found errors during `pnpm dev`, add `--webpack` to the specific app's dev script:

```json
"dev": "next dev -p 3000 --webpack"
```

---

## Common Setup Issues

### `pnpm install` fails with engine mismatch

**Symptom:** `ERR_PNPM_UNSUPPORTED_ENGINE`

**Fix:** Upgrade Node.js to 20 or later. Use `nvm use 20` if you have nvm installed.

---

### `DATABASE_URL` connection refused

**Symptom:** Prisma throws `Can't reach database server at localhost:5432`

**Fix:** Ensure Docker containers are running: `docker compose -f docker-compose.dev.yml ps`. If they are stopped, run `docker compose -f docker-compose.dev.yml up -d`.

---

### Prisma client not found after install

**Symptom:** `Cannot find module '@vayva/db/generated/client'`

**Fix:** The postinstall hook runs `db:generate` automatically, but it can fail silently if `DATABASE_URL` is not set. Set the variable, then run:

```bash
pnpm db:generate
```

---

### Port already in use

**Symptom:** `Error: listen EADDRINUSE: address already in use :::3000`

**Fix:** Kill the conflicting process or change the port. To find what is using the port:

```bash
lsof -i :3000
```

You can also override the port with an environment variable before starting:

```bash
PORT=3005 pnpm --filter @vayva/merchant dev
```

---

### `next build` fails with `Module not found` for a workspace package

**Symptom:** Build errors referencing `@vayva/ui` or similar packages

**Fix:** This is the known Turbopack compatibility issue. Ensure the build script uses `--webpack`:

```bash
next build --webpack
```

See the [Turbopack vs Webpack](#turbopack-vs-webpack) section above.

---

### `postinstall` generates Prisma into the wrong location

**Symptom:** Type errors about missing Prisma models

**Fix:** Verify `DATABASE_URL` is exported in your shell and re-run:

```bash
export DATABASE_URL="postgresql://vayva:vayva_password@localhost:5432/vayva_dev"
pnpm db:generate
```

---

### Hot reload not working in a workspace package

**Symptom:** Changes in `packages/ui` are not reflected in the app during `pnpm dev`

**Fix:** TurboRepo's `dev` task is configured as persistent and cache-disabled, so it should watch automatically. If it does not, stop `pnpm dev`, run `pnpm install` again to ensure symlinks are fresh, then restart.
