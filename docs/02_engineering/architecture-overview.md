# Architecture Overview (Vayva)

**Owner:** Nyamsi Fredrick, Founder
**Last updated:** 2026-03-04

## Purpose
This document explains how Vayva is structured (apps, backend, database, background jobs) and how requests flow through the system.

## High-level components
### Frontend apps
Located under `Frontend/`:
- `Frontend/merchant-admin` — merchant dashboard
- `Frontend/ops-console` — internal operations console
- `Frontend/storefront` — customer storefront
- `Frontend/marketing` — marketing site

### Backend
Located under `Backend/`:
- `Backend/core-api` — primary backend API surface implemented via Next.js route handlers (`src/app/api/**`)
- `Backend/worker` — background processing (BullMQ)

### Database and ORM
- PostgreSQL is the system of record.
- Prisma schema is configured at repo root via `package.json`:
  - `prisma.schema = platform/infra/db/prisma/schema.prisma`
- A Prisma client wrapper is provided via `infra/db` and re-exported as `@vayva/db`.

### Background jobs
- BullMQ + Redis
- Worker code in `Backend/worker`

## Request flow (typical)
### Merchant Admin request
1. Browser loads UI from `Frontend/merchant-admin`.
2. UI calls API endpoints:
   - either to `Backend/core-api` route handlers
   - or to app-local route handlers (some apps have their own `src/app/api/**`).
3. API route uses Prisma (`@vayva/db`) to read/write Postgres.
4. If async work is needed, API enqueues a BullMQ job.
5. Worker consumes job and performs side effects (emails, WhatsApp, delivery callbacks, maintenance).

## Deployment topology (current)
### Vercel
Primary web apps are deployed on Vercel (domains may include):
- `merchant.vayva.ng`
- `ops.vayva.ng`
- `vayva.ng`
- `marketplace.vayva.ng` (confirm if live)

### VPS
Some services run on VPS as Docker containers and/or system processes.
- VPS 1 (app server)
  - Evolution API
  - Redis
  - MinIO
  - Nginx Proxy Manager
  - Worker (systemd/PM2)
- VPS 2 (db server)
  - PostgreSQL
  - Redis

## Integrations
- Paystack (payments)
- Resend (email)
- Kwik (delivery)
- Evolution API (WhatsApp gateway)
- Groq (LLM)

## Key references
- Repo scripts: root `package.json` scripts
- Turbo task graph: `turbo.json`
- Env vars: `.env.example` and `03_development/env-vars.md`
