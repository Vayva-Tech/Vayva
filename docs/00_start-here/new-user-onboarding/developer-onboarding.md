# Developer Onboarding Guide

> Last updated: 2026-03-23
> Status: Active
> Audience: New engineering hires

---

## Welcome to Vayva

Vayva is an AI-powered commerce SaaS platform built for the Nigerian market. Merchants use Vayva to sell online through branded storefronts and WhatsApp-powered AI agents. This guide will get you productive in your first week.

For a **full map** of every docs folder (product, ops, security, business, compliance), start at the [documentation home](../../README.md).

---

## First Day Checklist

### Accounts and Access

- [ ] GitHub access to `Vayva-Tech/vayva` repository
- [ ] Vercel team membership (deployment dashboard)
- [ ] Slack workspace (channels: `#engineering`, `#deploys`, `#incidents`, `#general`)
- [ ] Linear or project tracker access (task management)
- [ ] 1Password / shared vault access for development secrets
- [ ] Figma access (design files and component library)
- [ ] Sentry access (error monitoring)

### Tools to Install

| Tool | Version | Installation |
|------|---------|-------------|
| Node.js | >= 20 | `brew install node` or use `nvm` / `fnm` |
| pnpm | 10.2 | `corepack enable && corepack prepare pnpm@10.2.0 --activate` |
| Git | Latest | `brew install git` |
| PostgreSQL | 15+ | `brew install postgresql@15` or use Docker |
| Redis | 7+ | `brew install redis` or use Docker |
| Docker | Latest | [Docker Desktop](https://docker.com/products/docker-desktop) |
| VS Code | Latest | Recommended IDE with workspace extensions |
| Turbo | Latest | Installed via `pnpm` as a dev dependency |

### VS Code Extensions (Recommended)

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Prisma
- GitLens
- Error Lens

---

## Repository Setup

### 1. Clone the Repository

```bash
git clone git@github.com:Vayva-Tech/vayva.git
cd vayva
```

### 2. Install Dependencies

```bash
pnpm install
```

This runs `postinstall` which triggers `turbo run db:generate` to generate the Prisma client.

### 3. Environment Configuration

Copy the example environment files for each app:

```bash
cp apps/merchant/.env.example apps/merchant/.env.local
cp apps/marketing/.env.example apps/marketing/.env.local
cp apps/ops-console/.env.example apps/ops-console/.env.local
cp apps/worker/.env.example apps/worker/.env.local
```

Key environment variables to configure:

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `DATABASE_URL` | PostgreSQL connection string | Local DB or shared dev instance |
| `REDIS_URL` | Redis connection string | Local Redis or shared dev instance |
| `NEXTAUTH_SECRET` | Auth session secret | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | App URL for auth callbacks | `http://localhost:3000` for merchant |
| `PAYSTACK_SECRET_KEY` | Paystack test key | 1Password vault |
| `OPENROUTER_API_KEY` | AI model access | 1Password vault |
| `EVOLUTION_API_URL` | WhatsApp gateway | 1Password vault |
| `MINIO_ENDPOINT` | File storage | Local MinIO or shared instance |

### 4. Database Setup

```bash
# Push schema to local database
pnpm db:push

# Seed with sample data
pnpm db:seed
```

### 5. Run the Development Server

```bash
# Start all apps concurrently
pnpm dev

# Or run a specific app
pnpm --filter @vayva/merchant dev
```

| App | URL | Port |
|-----|-----|------|
| Merchant Dashboard | `http://localhost:3000` | 3000 |
| Marketing Site | `http://localhost:3001` | 3001 |
| Ops Console | `http://localhost:3002` | 3002 |
| Storefront | `http://localhost:3001` | 3001 |

### 6. Verify Your Setup

```bash
# Run the doctor script to check everything is configured
pnpm doctor

# Run smoke tests
pnpm test:smoke
```

---

## Architecture Overview

### Monorepo Structure

The codebase is a **pnpm monorepo** orchestrated by **TurboRepo**.

```
vayva/
  apps/
    merchant/        -- Merchant dashboard (Next.js, port 3000)
    marketing/       -- Public marketing site (Next.js, port 3001)
    ops-console/     -- Internal ops console (Next.js, port 3002)
    worker/          -- Background job workers (BullMQ)
    www/             -- Storefront app
  packages/
    db/              -- Prisma client and database utilities
    ui/              -- Shared UI component library (Radix-based)
    schemas/         -- Zod validation schemas
    shared/          -- Common utilities and types
    ai-agent/        -- AI agent integration
    billing/         -- Subscription and tier management
    payments/        -- Paystack payment processing
    workflow/        -- Workflow builder definitions
    industry-*/      -- 20+ industry vertical modules
    ...
  platform/
    ci/              -- CI/CD scripts
    infra/           -- Prisma schema, migrations
    scripts/         -- Developer tooling (doctor, smoke tests)
    testing/         -- Playwright E2E configuration
  docs/              -- Documentation (you are here)
  governance/        -- Platform governance rules
```

### Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5.9 (strict mode) |
| UI | React 19, Tailwind CSS, Radix UI, Framer Motion |
| Database | PostgreSQL via Prisma ORM |
| Cache / Queue | Redis, BullMQ |
| AI | GPT-4o Mini (OpenRouter), Llama 3.3 70B (Groq) |
| Payments | Paystack |
| WhatsApp | Evolution API |
| File Storage | MinIO (S3-compatible) |
| Auth | NextAuth / Better Auth |
| Testing | Vitest (unit), Playwright (E2E), Testing Library |
| Deployment | Vercel |

### Key Concepts

- **Tiers**: Three subscription tiers (STARTER, PRO, PRO_PLUS) gate feature access and usage limits.
- **AI Credits**: AI usage is metered. Each tier gets a monthly credit allocation. Credits are consumed per AI API call.
- **Industry Verticals**: 20+ industry-specific modules (fashion, restaurant, grocery, etc.) provide specialized features.
- **WhatsApp AI Agent**: Each merchant's AI agent handles customer conversations on WhatsApp, powered by GPT-4o Mini.
- **Amounts in Kobo**: All monetary amounts are stored in kobo (1 NGN = 100 kobo) for precision.

---

## Key Contacts

| Role | Responsibility |
|------|---------------|
| Engineering Lead | Architecture decisions, code reviews, sprint planning |
| Product Manager | Feature requirements, prioritization, user stories |
| DevOps | Infrastructure, deployment, monitoring |
| Design Lead | Figma designs, design system, UX reviews |

Ask in `#engineering` on Slack if you are unsure who to contact for a specific question.

---

## First Task Suggestions

### Week 1: Orientation

1. **Read the platform overview**: `docs/00_start-here/platform-overview.md`
2. **Read coding standards**: `docs/03_development/coding-standards.md`
3. **Explore the merchant dashboard**: Log in at `http://localhost:3000`, create a test store, add products, and place a test order.
4. **Browse the Prisma schema**: `platform/infra/db/prisma/schema.prisma` -- understand the data model.
5. **Pick up a "good first issue"**: Look for issues labeled `good-first-issue` in the project tracker.

### Week 2: First Contribution

1. **Fix a small bug or UI polish task** to get familiar with the PR process.
2. **Add a unit test** for an existing utility function in `packages/shared`.
3. **Review a teammate's PR** to learn the codebase through code review.

---

## Code Review Expectations

### As an Author

- Keep PRs focused: one logical change per PR.
- Write a clear PR description explaining **what** changed and **why**.
- Self-review your diff before requesting review.
- Ensure CI passes: `pnpm lint`, `pnpm typecheck`, and `pnpm test` must all succeed.
- Respond to review comments within 24 hours.

### As a Reviewer

- Review within 24 hours of being assigned.
- Focus on correctness, security implications, and maintainability.
- Use the code review checklist (see `docs/03_development/workflows/git-workflow.md`).
- Approve when satisfied; do not leave PRs in limbo.
- Be constructive: suggest alternatives rather than just pointing out problems.

### Standards to Enforce

- No `@ts-nocheck` or `@ts-ignore` -- fix actual TypeScript errors.
- All external input validated with Zod schemas.
- No hardcoded secrets or API keys.
- Feature-gated code must check the merchant's tier.
- Database queries must be scoped to the merchant's `storeId` (prevent IDOR).
- New API routes must include rate limiting.

---

## Useful Commands Reference

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps and packages |
| `pnpm lint` | Run ESLint across the monorepo |
| `pnpm lint:fix` | Auto-fix lint issues |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm test` | Run all unit tests (Vitest) |
| `pnpm test:e2e` | Run Playwright end-to-end tests |
| `pnpm doctor` | Check development environment health |
| `pnpm test:smoke` | Run smoke tests |
| `pnpm db:generate` | Regenerate Prisma client |
| `pnpm db:push` | Push schema changes to database |
| `pnpm db:seed` | Seed database with sample data |
| `pnpm validate:ship` | Full validation before shipping |
| `pnpm ci:guards` | Run CI guard scripts |
| `pnpm check:security` | Run dependency security audit |

---

## Next Steps

After completing your onboarding:

1. Read the full product documentation in `docs/01_product/`
2. Understand the API conventions in `docs/02_engineering/api-design/`
3. Review the git workflow in `docs/03_development/workflows/git-workflow.md`
4. Familiarize yourself with the deployment process in `docs/04_deployment/`
