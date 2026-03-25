# Environment Matrix

> Last updated: 2026-03-23

This document defines all deployment environments, their URLs, configuration differences, data isolation boundaries, and access controls.

---

## Environment Overview

| Attribute | Development | Staging | Production |
|---|---|---|---|
| **Purpose** | Local feature development and debugging | Integration testing, QA, pre-release validation | Live customer-facing traffic |
| **Data** | Seeded fixtures / local DB | Sanitized copy of production (refreshed weekly) | Real merchant and customer data |
| **Deployment trigger** | Manual (`pnpm dev`) | Push to `staging` branch / manual deploy | Push to `main` branch (auto-deploy via Vercel + manual VPS deploy) |
| **Who can access** | Any engineer with repo access | Engineering team, QA, product | End users, ops team, on-call engineers |

---

## URLs Per Environment

### Frontend Applications (Vercel)

| Application | Development | Staging | Production |
|---|---|---|---|
| **Marketing** | `http://localhost:3003` | `staging.vayva.ng` | `vayva.ng` |
| **Merchant Admin** | `http://localhost:3000` | `staging-merchant.vayva.ng` | `merchant.vayva.ng` |
| **Ops Console** | `http://localhost:3001` | `staging-ops.vayva.ng` | `ops.vayva.ng` |
| **Storefront** | `http://localhost:3002` | `staging-store.vayva.ng` | `*.vayva.ng` (wildcard subdomains) |

### Backend Services (VPS: 163.245.209.x)

| Service | Development | Staging | Production |
|---|---|---|---|
| **Core API** | `http://localhost:3000` | `staging-api.vayva.ng` | `api.vayva.ng` (163.245.209.x:3000) |
| **Worker** | `tsx watch src/worker.ts` | Docker container on staging VPS | Docker container (163.245.209.x) |
| **AI Agent** | `http://localhost:3001` | Docker container on staging VPS | Docker container (163.245.209.x:3001) |
| **Evolution API (WhatsApp)** | N/A or local Docker | `http://163.245.209.202:8080` (staging) | `http://163.245.209.202:8080` |

### Infrastructure Services

| Service | Development | Staging | Production |
|---|---|---|---|
| **PostgreSQL** | `localhost:5432` (Docker) | Staging VPS `163.245.209.203:5432` | `163.245.209.203:5432` (PostgreSQL 16) |
| **Redis** | `localhost:6379` (Docker) | Staging VPS `163.245.209.203:6379` | `163.245.209.203:6379` (Redis 7) |
| **MinIO (S3-compatible storage)** | `localhost:9000` | Staging VPS | Production VPS |
| **Prometheus** | N/A | Optional | `localhost:9090` (on VPS) |
| **Grafana** | N/A | Optional | `localhost:3004` (on VPS) |

---

## Environment Variable Differences

### Variables That Change Per Environment

| Variable | Development | Staging | Production |
|---|---|---|---|
| `NODE_ENV` | `development` | `staging` | `production` |
| `DATABASE_URL` | `postgresql://postgres:password@localhost:5432/vayva` | Staging DB connection string | Production DB connection string (sslmode=require) |
| `REDIS_URL` | `redis://localhost:6379` | Staging Redis with password | `redis://:$REDIS_PASSWORD@163.245.209.203:6379` |
| `NEXTAUTH_URL` | `http://localhost:3000` | `https://staging-merchant.vayva.ng` | `https://merchant.vayva.ng` |
| `MARKETING_BASE_URL` | `http://localhost:3003` | `https://staging.vayva.ng` | `https://vayva.ng` |
| `MERCHANT_BASE_URL` | `http://localhost:3000` | `https://staging-merchant.vayva.ng` | `https://merchant.vayva.ng` |
| `OPS_BASE_URL` | `http://localhost:3001` | `https://staging-ops.vayva.ng` | `https://ops.vayva.ng` |
| `PAYSTACK_SECRET_KEY` | `sk_test_*` | `sk_test_*` | `sk_live_*` |
| `NEXT_PUBLIC_PAYSTACK_KEY` | `pk_test_*` | `pk_test_*` | `pk_live_*` |
| `PAYSTACK_MOCK` | `true` | `false` | `false` |
| `OPENROUTER_API_KEY` | Dev API key | Staging API key | Production API key |
| `SENTRY_DSN` | Unset or dev project | Staging Sentry project | Production Sentry project |
| `LOG_LEVEL` | `debug` | `info` | `info` |
| `WORKER_CONCURRENCY` | `1` | `3` | `5` |
| `FEATURE_FLAGS_ENABLED` | `true` | `true` | `true` |
| `DEV_TOOLS_ENABLED` | `true` | `true` | `false` |

### Variables Constant Across Environments

These remain the same structurally but values differ:

- `BETTER_AUTH_SECRET` / `NEXTAUTH_SECRET` -- unique per environment, generated via `openssl rand -hex 32`
- `JWT_SECRET` -- unique per environment
- `COOKIE_SECRET` -- unique per environment
- `INTERNAL_API_SECRET` -- unique per environment, used for inter-service communication
- `RESEND_API_KEY` -- may use same key across staging/production (domain-verified)
- `EVOLUTION_API_KEY` -- matches the Evolution API instance configuration

### Env File Locations

| Scope | File | Notes |
|---|---|---|
| Root (all apps) | `.env.local` | Local development overrides, gitignored |
| Root (all apps) | `.env.staging` | Staging defaults |
| Root (all apps) | `.env.production` | Production defaults |
| Merchant Frontend | `Frontend/merchant/.env.local` | Local overrides |
| Merchant Frontend | `Frontend/merchant/.env.production` | Production values |
| Ops Console | `Frontend/ops-console/.env.local` | Local overrides |
| Ops Console | `Frontend/ops-console/.env.production` | Production values |
| Storefront | `Frontend/storefront/.env.local` | Local overrides |
| Marketing | `Frontend/marketing/.env.local` | Local overrides |
| Core API | `Backend/core-api/.env.local` | Local overrides |
| VPS Deploy | `platform/scripts/deploy/.env.app` | Docker compose env vars |
| VPS Sync | `vps-sync/.env.production` | VPS deployment sync config |

TurboRepo passes environment variables through via `globalPassThroughEnv` in `turbo.json`. See `/turbo.json` for the full list.

---

## Data Isolation

### Database Isolation

- **Development**: Completely separate local PostgreSQL instance (`docker-compose.yml`). Seeded with fixtures via `pnpm db:seed`.
- **Staging**: Separate database on staging VPS. Periodically refreshed with a sanitized snapshot of production data (PII stripped).
- **Production**: Primary database at `163.245.209.203:5432`. Contains live merchant and customer data. Subject to backup schedule (see database-maintenance.md).

**Critical rule**: Production database credentials must never appear in staging or development configurations. Use separate credentials per environment.

### Redis Isolation

- **Development**: Local Redis without authentication (`docker-compose.yml`).
- **Staging**: Separate Redis instance with password authentication.
- **Production**: Redis at `163.245.209.203:6379` with `requirepass` enabled and AOF persistence.

All BullMQ queues share the same Redis instance within an environment but are logically isolated by queue name prefixes.

### File Storage Isolation

- **Development**: Local MinIO instance or filesystem.
- **Staging/Production**: Separate MinIO buckets or Vercel Blob storage per environment.

---

## Access Controls

### Development Environment

| Role | Access |
|---|---|
| All engineers | Full access to all services |
| External contributors | Must use `.env.example` to configure; no access to shared secrets |

### Staging Environment

| Role | Access |
|---|---|
| Engineers | SSH access to staging VPS, Vercel staging deployments |
| QA / Product | Staging frontend URLs only (no SSH, no direct DB access) |
| External contractors | Frontend URLs only, provisioned per-project |

### Production Environment

| Role | Access |
|---|---|
| Senior engineers / DevOps | SSH access to production VPS (key-based only, no password auth) |
| On-call engineer | SSH + database read access for incident response |
| Ops team | Ops Console (`ops.vayva.ng`) -- role-based access within the application |
| Merchants | Merchant Admin (`merchant.vayva.ng`) -- scoped to their own store data |
| Customers | Storefront only -- scoped to public store data |

### Secret Management

- All secrets are stored in Vercel Environment Variables (frontends) and VPS `.env` files (backend).
- Secrets are **never** committed to git. `.env.local`, `.env.production`, and `.env.staging` are gitignored.
- Only `.env.example` and `.env.*.example` files are committed as templates.
- Production secret rotation requires updating both Vercel env vars and VPS `.env` files, followed by redeployment.

### Network Access

| Service | Port | Exposure |
|---|---|---|
| PostgreSQL | 5432 | VPS internal only (firewall blocks external) |
| Redis | 6379 | VPS internal only (firewall blocks external) |
| Core API | 3000 | Behind reverse proxy (Nginx/Caddy) |
| AI Agent | 3001 | Behind reverse proxy |
| Evolution API | 8080 | VPS internal only |
| Prometheus | 9090 | VPS internal only |
| Grafana | 3004 | VPS internal only (tunnel for access) |
