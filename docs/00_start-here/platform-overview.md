# Vayva Platform Overview

## What is Vayva?

Vayva is an AI-powered commerce SaaS platform built for the Nigerian and African market. It provides merchants with everything they need to sell online and offline:

- **Online storefronts** -- branded, customizable stores hosted on `store.vayva.ng`
- **AI-powered customer support** -- automated sales agents that engage customers via WhatsApp, handling product inquiries, order placement, and FAQs
- **Multi-channel sales** -- sell through WhatsApp, web stores, and social media from a single dashboard
- **Analytics and insights** -- revenue tracking, customer behavior, AI usage metrics
- **Payment processing** -- integrated with Paystack for Nigerian Naira transactions
- **Industry-specific features** -- specialized modules for restaurants, retail, events, travel, automotive, grocery, and 15+ other verticals

Merchants manage their business through `merchant.vayva.ng`. Vayva's internal team operates the platform through `ops.vayva.ng`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.1.6 (App Router) |
| Language | TypeScript 5.9 |
| UI | React 19.2, Tailwind CSS, Radix UI, Framer Motion |
| Database | PostgreSQL (via Prisma 5.7 ORM) |
| Cache/Queue | Redis (ioredis), BullMQ |
| AI | Groq SDK (GPT-4o Mini primary, Llama 3.3 70B for autopilot), OpenRouter |
| Payments | Paystack |
| Email | Resend, React Email |
| WhatsApp | Evolution API |
| File Storage | MinIO (S3-compatible) |
| Auth | NextAuth / Better Auth |
| Monitoring | Sentry |
| Build System | TurboRepo + pnpm workspaces |
| Testing | Vitest, Playwright (E2E), Testing Library |
| Deployment | Vercel (all frontends) |
| Package Manager | pnpm 10.2 |
| Node | >= 20 |

---

## Monorepo Structure

The project is a pnpm monorepo orchestrated by TurboRepo. Workspaces are defined in `pnpm-workspace.yaml`.

### Frontend Applications

| Workspace | Package Name | Port | Domain | Purpose |
|---|---|---|---|---|
| `Frontend/merchant` | `@vayva/merchant` | 3000 | `merchant.vayva.ng` | Merchant dashboard -- the primary application. Store management, products, orders, AI settings, analytics, billing. |
| `Frontend/marketing` | `@vayva/marketing` | 3001 | `vayva.ng` | Public marketing website and landing pages. |
| `Frontend/ops-console` | `@vayva/ops-console` | 3002 | `ops.vayva.ng` | Internal operations console for the Vayva team. Store oversight, abuse management, payouts, audit logs. |
| `Frontend/storefront` | `@vayva/storefront` | 3001 | `store.vayva.ng` | Customer-facing storefronts. Each merchant gets a subdomain or custom domain. |

### Backend Services

| Workspace | Package Name | Purpose |
|---|---|---|
| `Backend/core-api` | `@vayva/merchant-api` | Core API server (Next.js API routes). Handles auth, products, orders, AI, payments, webhooks. |
| `Backend/ops-console` | -- | Ops console backend logic |
| `Backend/worker` | -- | Background job workers (BullMQ) |
| `Backend/workflow` | -- | Workflow execution engine |

### Shared Packages (`packages/`)

**Core packages:**

| Package | Purpose |
|---|---|
| `packages/db` | Prisma client, database utilities, generated types |
| `packages/ui` | Shared UI component library (Radix-based) |
| `packages/schemas` | Zod validation schemas shared across apps |
| `packages/shared` | Common utilities, types, constants |
| `packages/templates` | Store/page templates |
| `packages/theme` | Theme configuration and tokens |
| `packages/content` | Content management utilities |
| `packages/tsconfig` | Shared TypeScript configurations |

**Domain packages (`packages/domain/`):**

| Package | Purpose |
|---|---|
| `packages/domain/ai-agent` | AI agent logic, prompt engineering, tool definitions |
| `packages/domain/analytics` | Analytics processing and aggregation |
| `packages/domain/payments` | Payment processing logic |

**Infrastructure packages (`packages/infra/`):**

| Package | Purpose |
|---|---|
| `packages/infra/redis-adapter` | Redis connection and caching layer |
| `packages/infra/workflow-engine` | Workflow execution engine |

**Feature packages:**

| Package | Purpose |
|---|---|
| `packages/ai-agent` | AI agent integration |
| `packages/analytics` | Analytics dashboards and reports |
| `packages/api-client` | Typed API client for frontend-backend communication |
| `packages/billing` | Subscription billing and tier management |
| `packages/catalog` | Product catalog management |
| `packages/compliance` | Regulatory compliance (NDPR, consumer protection) |
| `packages/emails` | Email templates and sending |
| `packages/extensions` | Plugin/extension system |
| `packages/integrations` | Third-party integrations |
| `packages/inventory` | Inventory tracking |
| `packages/logistics` | Delivery and shipping |
| `packages/marketplace` | Marketplace features |
| `packages/notification-engine` | Push/email/SMS notifications |
| `packages/payments` | Payment gateway integration (Paystack) |
| `packages/policies` | Store policies (returns, shipping, etc.) |
| `packages/pos` | Point-of-sale system |
| `packages/realtime` | Real-time features (WebSockets) |
| `packages/security` | Security utilities, rate limiting |
| `packages/settings` | Store settings management |
| `packages/social` | Social media integrations |
| `packages/subscriptions` | Recurring subscription products |
| `packages/workflow` | Workflow builder definitions |

**Industry vertical packages (`packages/industry-*`):**

Specialized modules for 20+ industry verticals: automotive, blog-media, core, creative, education, events, fashion, food, grocery, healthcare, legal, meal-kit, nightlife, nonprofit, petcare, professional, realestate, restaurant, retail, saas, services, specialized, travel, wellness, wholesale.

### Platform (`platform/`)

| Directory | Purpose |
|---|---|
| `platform/ci` | CI/CD scripts and checks |
| `platform/infra` | Infrastructure config (Prisma schema, migrations) |
| `platform/scripts` | Developer tooling (doctor, smoke tests, bundle checks) |
| `platform/testing` | E2E test configuration (Playwright) |

### Other

| Directory | Purpose |
|---|---|
| `governance/` | Platform governance rules and documentation |
| `tests/` | Cross-cutting test suites |

---

## Pricing Tiers

Vayva has three paid tiers. There is no free tier.

| Tier | Monthly Price | Key Features |
|---|---|---|
| **STARTER** | NGN 25,000/mo | Online store, basic AI assistant, WhatsApp integration, product management, order management |
| **PRO** | NGN 35,000/mo | Everything in Starter + advanced AI (autopilot mode), workflow builder, analytics dashboards, multi-staff accounts |
| **PRO_PLUS** | NGN 50,000/mo | Everything in Pro + priority support, custom integrations, advanced analytics, higher AI credit limits, API access |

---

## AI System

### Models

- **Primary model:** GPT-4o Mini (via Groq) -- used for customer-facing chat, product recommendations, order assistance
- **Autopilot model:** Llama 3.3 70B (via Groq) -- used for autonomous actions (placing orders, updating inventory)
- **Routing:** OpenRouter for model selection and fallback

### Credit System

- AI usage is metered via a credit system: **0.24 credits per 1,000 tokens**
- Each tier includes a monthly credit allocation
- Usage is tracked per-store with daily aggregation (`AiUsageEvent`, `AiUsageDaily` tables)
- Merchants can monitor usage in their dashboard

### AI Agent Configuration

Merchants can customize their AI agent through `MerchantAiProfile`:
- Agent name and tone preset (Friendly, Professional, Luxury, Playful, Minimal)
- Greeting and sign-off templates
- Persuasion level (0-3)
- Brevity mode (Short, Medium)
- Escalation rules and prohibited claims
- Language selection

---

## WhatsApp Integration

Vayva uses **Evolution API** to connect merchants with their customers on WhatsApp.

- **Evolution API endpoint:** `http://163.245.209.202:8080`
- Each merchant store can have its own WhatsApp instance
- The AI sales agent handles incoming messages automatically
- Configurable via `WhatsAppAgentSettings`: business hours, auto-reply, catalog mode, image understanding
- Merchants can also connect their own social media accounts

### How it works

1. Customer sends a WhatsApp message to the merchant's number
2. Evolution API receives the webhook and forwards to Vayva
3. The AI agent processes the message using the merchant's product catalog and settings
4. Response is sent back through Evolution API
5. Conversations, messages, and AI actions are logged for merchant review

---

## Deployment

All frontend applications are deployed on **Vercel**.

| Application | Domain | Environment |
|---|---|---|
| Marketing | `vayva.ng` | Production |
| Merchant Dashboard | `merchant.vayva.ng` | Production |
| Ops Console | `ops.vayva.ng` | Production |
| Storefront | `store.vayva.ng` | Production |

### Infrastructure

- **Database:** PostgreSQL (connection via `DATABASE_URL` / `DIRECT_URL`)
- **Cache:** Redis (`REDIS_URL`)
- **File Storage:** MinIO (`MINIO_ENDPOINT`)
- **Email:** Resend (`RESEND_API_KEY`)
- **Payments:** Paystack (`PAYSTACK_SECRET_KEY`)

---

## Key Commands

### Installation and Setup

```bash
# Install all dependencies (runs db:generate automatically via postinstall)
pnpm install
```

### Development

```bash
# Run ALL workspaces in dev mode (concurrency=30)
pnpm dev

# Run a specific frontend
pnpm --filter @vayva/merchant dev
pnpm --filter @vayva/marketing dev
pnpm --filter @vayva/ops-console dev
pnpm --filter @vayva/storefront dev
```

### Build and Quality

```bash
# Build all workspaces
pnpm build

# Type checking
pnpm typecheck

# Linting
pnpm lint
pnpm lint:fix

# Format code
pnpm format
```

### Testing

```bash
# Run unit tests
pnpm test

# Run E2E tests (Playwright)
pnpm test:e2e

# Playwright UI mode
pnpm test:ui

# Smoke tests
pnpm test:smoke
```

### Database

```bash
# Generate Prisma client
pnpm db:generate

# Push schema changes to database
pnpm db:push

# Seed database
pnpm db:seed
```

### CI and Validation

```bash
# Full pre-ship validation (doctor + lint + build + e2e)
pnpm validate:ship

# CI guard checks (hardcoded domains, auth wrappers, IDORs, audit logs, docs)
pnpm ci:guards

# Security audit
pnpm check:security

# Bundle size check
pnpm check:bundle

# Dead code detection
pnpm check:dead-code

# Accessibility check
pnpm check:a11y

# Health check
pnpm doctor
```

### TurboRepo

```bash
# Run any task across workspaces
turbo run <task>

# Run task for specific package
turbo run build --filter=@vayva/merchant

# See task dependency graph
turbo run build --graph
```

---

## Database Schema Highlights

The Prisma schema (at `platform/infra/db/prisma/schema.prisma`) uses PostgreSQL and includes models for:

- **Stores and Merchants** -- multi-tenant store management
- **Products and Catalog** -- product listings, categories, variants
- **Orders** -- order lifecycle, payments, fulfillment
- **AI System** -- `AiUsageEvent`, `AiUsageDaily`, `MerchantAiProfile`, `WhatsAppAgentSettings`, `AiActionRun`, `AiActionDefinition`
- **Conversations and Messages** -- WhatsApp and webchat conversations
- **Audit Logs** -- `AuditLog`, `AdminAuditLog` for compliance and traceability
- **Account Management** -- `AccountDeletionRequest` with scheduled deletion support
- **Abuse Prevention** -- `AbuseRule` for automated abuse detection

---

## Architecture Principles

1. **Multi-tenant by design** -- every resource is scoped to a `storeId`
2. **AI-first commerce** -- AI is not a bolt-on; it is central to the merchant and customer experience
3. **Industry verticals** -- modular industry packages allow specialized features without bloating the core
4. **Audit everything** -- comprehensive audit logging for compliance (NDPR) and operational visibility
5. **Nigerian market focus** -- Naira pricing, Paystack payments, WhatsApp as primary channel, local compliance
