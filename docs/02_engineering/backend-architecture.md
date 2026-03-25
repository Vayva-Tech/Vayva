# Vayva Backend Architecture

> Last updated: 2026-03-23

## Overview

Vayva is a multi-tenant AI-commerce SaaS platform targeting the Nigerian market. The backend is built as a **Next.js App Router API** (not Express/Fastify) running on Vercel, backed by PostgreSQL via Prisma ORM. The monorepo lives at `Backend/core-api/` for the main application, with shared logic split across `packages/`.

---

## Tech Stack

| Layer            | Technology                                         |
|------------------|-----------------------------------------------------|
| Runtime          | Next.js 14+ (App Router) on Vercel                  |
| Language         | TypeScript (strict)                                  |
| Database         | PostgreSQL via Prisma ORM                            |
| Auth             | NextAuth.js (Credentials provider, JWT strategy)     |
| Payments         | Paystack (NGN-native)                                |
| AI               | OpenRouter (Gemini 2.5 Flash multimodal)            |
| WhatsApp         | Evolution API (self-hosted gateway)                  |
| Cache            | Redis (rate limiting, dashboard cache)               |
| File Storage     | Uploads via platform storage service                 |
| Email            | Email automation service (transactional + campaigns) |
| Monitoring       | Sentry, custom APM, structured logging               |

---

## Project Structure

```
Backend/core-api/src/
  app/
    api/                   # Next.js Route Handlers (~100+ route groups)
    (dashboard)/           # Dashboard pages (server components)
    auth/                  # Auth pages
    healthz/               # Health check endpoint
  config/
    pricing.ts             # Single source of truth for plan pricing
    routes.ts              # Centralized route constants
    industry.ts            # Industry configuration
    sidebar.ts             # Dashboard sidebar config
  middleware/
    rate-limiter.ts        # Tier-based rate limiting (in-memory + Redis)
    rate-limiter-redis.ts  # Redis-backed rate limiter
    cdn-caching.ts         # CDN cache headers
  services/
    PaystackService.ts     # Paystack payment integration
    whatsapp/              # WhatsApp agent + Evolution API manager
    auth.ts                # Auth service (login, register, verify, OTP)
    wallet.ts              # Wallet operations
    onboarding.server.ts   # Onboarding flow
    dashboard.server.ts    # Dashboard data aggregation
    autopilot-engine.ts    # AI autopilot for automated operations
    order-state.service.ts # Order state machine
    product-core.service.ts# Product CRUD
    inventory.service.ts   # Inventory management
    discount.service.ts    # Discount engine
    referral.service.ts    # Referral program
    kyc.ts                 # KYC verification
  lib/
    ai/                    # AI integration layer
    billing/               # Plan definitions, gating, access control
    credits/               # Credit manager
    auth/                  # Auth utilities
    subscription/          # Subscription gating
    whatsapp-otp.ts        # WhatsApp OTP delivery
    db.ts                  # Prisma client singleton
    redis.ts               # Redis client
    cache.ts               # Caching utilities
    logger.ts              # Structured logger
    webhooks/              # Webhook processing
    delivery/              # Delivery/shipping logic
    payment/               # Payment processing
    events/                # Event system
    security/              # Security utilities
    email/                 # Email templates and sending
    storage/               # File storage
    analytics/             # Analytics aggregation
  jobs/
    scheduled-reports.ts   # Cron-triggered report generation
    processVoiceNote.ts    # Voice note transcription
  websocket/               # Real-time WebSocket handlers
  types/                   # TypeScript type definitions
```

---

## API Route Organization

Routes are organized under `Backend/core-api/src/app/api/` as Next.js Route Handlers. Each directory contains a `route.ts` file exporting HTTP method handlers (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`).

### Core Route Groups

| Group          | Path Prefix          | Purpose                                |
|----------------|----------------------|-----------------------------------------|
| auth           | `/api/auth`          | Login, register, OTP, password reset    |
| products       | `/api/products`      | Product CRUD, variants, images          |
| orders         | `/api/orders`        | Order management, fulfillment           |
| customers      | `/api/customers`     | Customer profiles, addresses, notes     |
| billing        | `/api/billing`       | Subscription management, invoices       |
| payments       | `/api/payments`      | Payment intents, Paystack integration   |
| wallet         | `/api/wallet`        | Wallet balance, withdrawals, deposits   |
| credits        | `/api/credits`       | AI credit balance, top-ups              |
| ai             | `/api/ai`            | AI completions, merchant brain          |
| ai-agent       | `/api/ai-agent`      | Conversational AI agent                 |
| wa-agent       | `/api/wa-agent`      | WhatsApp AI agent                       |
| whatsapp       | `/api/whatsapp`      | WhatsApp channel management             |
| inventory      | `/api/inventory`     | Stock levels, locations, movements      |
| collections    | `/api/collections`   | Product collections                     |
| carts          | `/api/carts`         | Shopping cart management                |
| checkout       | `/api/checkout`      | Checkout flow                           |
| settings       | `/api/settings`      | Store settings                          |
| team           | `/api/team`          | Staff/membership management             |
| analytics      | `/api/analytics`     | Sales, delivery, support analytics      |
| dashboard      | `/api/dashboard`     | Dashboard data aggregation              |
| onboarding     | `/api/onboarding`    | Merchant onboarding flow                |
| kyc            | `/api/kyc`           | KYC verification                        |
| webhooks       | `/api/webhooks`      | Incoming webhook handlers               |
| campaigns      | `/api/campaigns`     | Marketing campaigns                     |
| templates      | `/api/templates`     | Store templates                         |
| domains        | `/api/domains`       | Custom domain management                |
| uploads        | `/api/uploads`       | File upload                             |
| notifications  | `/api/notifications` | Notification preferences and history    |
| blog           | `/api/blog`          | Blog post CRUD                          |
| coupons        | `/api/coupons`       | Coupon/discount management              |
| refunds        | `/api/refunds`       | Refund processing                       |
| disputes       | `/api/disputes`      | Payment dispute management              |
| support        | `/api/support`       | Support tickets                         |
| reports        | `/api/reports`       | Report generation                       |

### Industry-Specific Routes

The platform supports 20+ industry verticals with dedicated API routes:

`/api/restaurant`, `/api/fashion`, `/api/beauty`, `/api/healthcare`, `/api/realestate`, `/api/education`, `/api/events`, `/api/grocery`, `/api/retail`, `/api/wholesale`, `/api/nightlife`, `/api/nonprofit`, `/api/professional`, `/api/creative`, `/api/saas`, `/api/travel`, `/api/wellness`, etc.

---

## Authentication & Authorization

### NextAuth.js Configuration

**File:** `Backend/core-api/src/lib/auth.ts`

- **Provider:** `CredentialsProvider` (email + password with bcrypt)
- **Session strategy:** JWT (7-day max age)
- **Adapter:** `PrismaAdapter` for user storage
- **Cookie:** `__Secure-vayva-merchant-session` (production), `next-auth.merchant-session` (dev)

### Auth Flow

1. User submits email + password
2. `authorize()` looks up `User` with active `Membership` records
3. Password verified via `bcrypt.compare()`
4. JWT token includes: `userId`, `storeId`, `storeName`, `role`, `plan`, `trialEndsAt`, `sessionVersion`
5. 30-minute idle timeout with sliding window (5-minute refresh granularity)
6. Session invalidated on idle via `RefreshAccessTokenError` flag

### Authorization Model

- **Membership** model links `User` to `Store` with a `role_enum` (AppRole: `OWNER`, `ADMIN`, `STAFF`)
- **Role-based access:** Granular `Permission` records linked via `RolePermission` join table
- **Plan-based gating:** Feature access controlled by `Store.plan` (STARTER / PRO / PRO_PLUS)
- **Feature overrides:** `MerchantFeatureOverride` allows per-store feature toggles

### OTP Verification

- Email OTP for signup verification (`OtpCode` model)
- WhatsApp OTP delivery via Evolution API (`lib/whatsapp-otp.ts`)

---

## Database Architecture

**ORM:** Prisma with PostgreSQL
**Schema:** `infra/db/prisma/schema.prisma` (~10,100 lines, 150+ models)
**Client output:** `infra/db/prisma/src/generated/client`

### Multi-Tenancy

Every merchant record is scoped by `storeId`. The `Store` model is the central tenant entity with 100+ relations. Data isolation is enforced at the query level -- every Prisma query includes a `storeId` filter.

### Key Design Patterns

- **UUID primary keys** (`@default(uuid())` or `@default(cuid())`)
- **Soft deletes** via `deletedAt` on critical models (User, Product, Order, Customer)
- **Optimistic locking** via `version` field on Store
- **Audit logging** via `AuditLog` and `AdminAuditLog` models
- **Event sourcing** for orders via `OrderEvent` and `OrderTimelineEvent`
- **Outbox pattern** for reliable event delivery (`OutboxEvent`, `NotificationOutbox`)

See `docs/02_engineering/database-schema.md` for detailed model documentation.

---

## Billing System

### Subscription Tiers

Defined in `Backend/core-api/src/config/pricing.ts` and `Backend/core-api/src/lib/billing/plans.ts`.

| Tier     | Monthly (NGN) | Team Seats | AI Credits | Key Features                                    |
|----------|--------------|------------|------------|--------------------------------------------------|
| STARTER  | 25,000       | 1          | 5,000      | WhatsApp automation, inbox, reports, analytics    |
| PRO      | 35,000       | 3          | 10,000     | + Custom domain, API access, AI autopilot, approvals |
| PRO_PLUS | 50,000       | 5          | 25,000     | + Visual workflow builder, priority support, all features |

All tiers use a 7-day free trial (except PRO_PLUS which has 0 trial days). A 3% withdrawal fee applies to all payouts.

### Feature Gating

**File:** `Backend/core-api/src/lib/billing/gating.ts`

Features are gated per plan via the `PLANS` configuration object. Each plan defines:
- `limits`: teamSeats, templatesIncluded, creditsPerMonth, monthlyCampaignSends, dashboardWidgets
- `features`: boolean flags for approvals, apiAccess, visualWorkflowBuilder, aiAutopilot, customDomain, removeBranding, prioritySupport, etc.

### Paystack Integration

**File:** `Backend/core-api/src/services/PaystackService.ts`
**Package:** `@vayva/payments`

- Transaction initialization with callback URL
- Transaction verification with full customer/payment data extraction
- Webhook processing for async payment events
- Amounts handled in kobo (1 NGN = 100 kobo)

### Wallet System

The `Wallet` model tracks per-store balances in kobo with:
- Balance tracking (deposits, payouts)
- Lock mechanism (`isLocked`, `lockReason`, `lockedBy`)
- Withdrawal processing with fee calculation (`Withdrawal` model)
- Bank beneficiary management (`BankBeneficiary` model)

---

## AI Services

For USD + NGN pricing scenarios and mapping credits to token budgets, see:
- `docs/08_reference/ai-pricing-and-credits.md`

### Architecture

```
OpenRouter API  <--  OpenRouterClient  <--  AI Route Handlers
                                        |
                    AICreditService     <--  Credit deduction on every call
```

### OpenRouter Integration

**File:** `Backend/core-api/src/lib/ai/openrouter-client.ts`

- Calls `https://openrouter.ai/api/v1/chat/completions`
- PII sanitization (email, phone, card number stripping) before sending to API
- 20-second timeout with `AbortController`
- Automatic credit deduction after each successful call
- Blocked response returned when credits exhausted

### AI Models

| Model                     | Role                      |
|--------------------------|---------------------------|
| `google/gemini-2.5-flash`| Primary (chat/vision/voice/autopilot) |

### Credit System

**File:** `Backend/core-api/src/lib/ai/credit-service.ts`

**Initial allocation per plan:**
- STARTER: 5,000 credits
- PRO: 10,000 credits
- PRO_PLUS: 25,000 credits

**Credit consumption formula:**
- `1 credit = ₦3 of AI usage value`
- Credits charged are based on provider cost + target margin (see `AICreditService.calculateCreditConsumption`)

For cost examples (USD + NGN @ ₦1,600/$) and “what 5,000 credits buys”, see:
- `docs/08_reference/ai-pricing-and-credits.md`

**Top-up packages (multi-currency):**
- Small: 3,000 credits -- NGN 3,000 / $7
- Medium: 8,000 credits -- NGN 7,000 / $16
- Large: 20,000 credits -- NGN 15,000 / $35

Low credit alert triggers at 200 credits remaining (with 24-hour cooldown).

### AI Agent Package

**Path:** `packages/ai-agent/`

Exports:
- `SalesAgent` -- Conversational sales AI for WhatsApp/web
- `VoiceProcessor` -- Voice note transcription
- `OpenRouterClient` -- OpenRouter completion client
- `DataGovernanceService` -- AI data governance and consent
- `NotificationService` -- AI-triggered notifications
- ML modules (no external API needed): `SentimentAnalyzer`, `SalesForecaster`, `RecommendationEngine`, `IntentClassifier`, `SimpleEmbedding`

### Merchant AI Profile

The `MerchantAiProfile` model allows merchants to customize their AI agent:
- Agent name, tone preset (Friendly/Professional/Luxury/Playful/Minimal)
- Greeting and sign-off templates
- Persuasion level (0-3), brevity mode
- Escalation rules, prohibited claims, policy overrides
- Language selection

---

## WhatsApp Integration

### Evolution API

**File:** `Backend/core-api/src/services/whatsapp/manager.server.ts`

Self-hosted WhatsApp gateway via Evolution API:
- Instance creation and QR code connection
- Message sending (text, media, templates)
- Webhook receiving for inbound messages
- Channel status tracking (`WhatsappChannel` model)

### WhatsApp Agent

**File:** `Backend/core-api/src/services/whatsapp/agent.server.ts`

Server-side service managing:
- Conversation threads (mapped to `Conversation` model)
- Knowledge base persistence (`KnowledgeBaseEntry`)
- Automation rules (`AutomationRule`)
- WhatsApp channel configuration

### WhatsApp Agent Settings

Per-store configuration (`WhatsAppAgentSettings` model):
- Business hours with auto-reply
- Catalog mode (StrictCatalogOnly / CatalogPlusFAQ)
- Image understanding toggle
- Order status access
- Payment guidance mode
- Daily message limits per user
- Human handoff with destination routing
- Safety filters

### Templates & Broadcasts

- `WhatsAppTemplate`: Reusable message templates with variable substitution, approval workflow
- `WhatsAppBroadcast`: Bulk message campaigns with segment targeting
- `WhatsAppBroadcastRecipient`: Per-recipient delivery tracking (sent, delivered, read, failed)

---

## Workflow Engine

**Path:** `packages/workflow/engine/`

Visual workflow builder (PRO_PLUS tier only) with:

### Triggers
`order_created`, `order_paid`, `order_cancelled`, `inventory_low`, `customer_segment_entered`, `customer_segment_exited`, `schedule`, `webhook`, `manual`, `ai_intent_detected`, `product_added`, `product_updated`, `customer_created`, `payment_received`, `refund_requested`

### Node Types
- **Logic:** condition, delay, split, merge, loop
- **Actions:** send_email, send_sms, send_whatsapp, send_push, update_inventory, create_task, update_customer, apply_discount, tag_customer, create_purchase_order, update_collection, filter_customers, send_notification
- **Industry-specific:** fashion_size_alert, restaurant_86_item, and more

### Components
- `engine/executor.ts` -- Workflow execution engine
- `engine/scheduler.ts` -- Scheduled workflow triggers
- `nodes/registry.ts` -- Node type registry
- `triggers/registry.ts` -- Trigger type registry
- `validation/` -- Workflow definition validation

---

## Background Jobs & Cron Tasks

| Job                        | File                              | Schedule    | Purpose                                 |
|----------------------------|-----------------------------------|-------------|------------------------------------------|
| Scheduled Reports          | `jobs/scheduled-reports.ts`       | Daily       | Send weekly/monthly merchant reports     |
| Voice Note Processing      | `jobs/processVoiceNote.ts`        | On-demand   | Transcribe voice notes from WhatsApp     |
| Domain Verification        | `lib/jobs/domain-verification.ts` | Periodic    | Verify custom domain DNS configuration   |
| Autopilot Engine           | `services/autopilot-engine.ts`    | Continuous  | AI-driven automated store operations     |
| Email Automation           | `services/email-automation.ts`    | Event-driven| Transactional and marketing emails       |

---

## Middleware Stack

1. **Rate Limiting** (`middleware/rate-limiter.ts`): Tier-based limits (100/500/2000/10000 req/hr for free/starter/pro/enterprise)
2. **Redis Rate Limiter** (`middleware/rate-limiter-redis.ts`): Production Redis-backed rate limiting
3. **CDN Caching** (`middleware/cdn-caching.ts`): Cache-Control header management
4. **Input Sanitization** (`lib/input-sanitization.ts`): Request payload sanitization
5. **Request ID** (`lib/request-id.ts`): Unique request ID injection for tracing
6. **Idempotency** (`lib/idempotency.ts`): Idempotency key support for payment endpoints

---

## Packages (Shared Libraries)

Key packages under `packages/`:

| Package            | Purpose                                          |
|--------------------|--------------------------------------------------|
| `ai-agent`         | Sales agent, voice processing, ML inference       |
| `billing`          | Billing logic shared across apps                  |
| `catalog`          | Product catalog utilities                         |
| `customer-success` | Customer success tooling                          |
| `db`               | Prisma client singleton (`@vayva/db`)             |
| `domain`           | Domain logic (ai-agent, analytics, payments)      |
| `emails`           | Email template rendering                          |
| `infra`            | Infrastructure utilities (logger, etc.)           |
| `integrations`     | Third-party integration adapters                  |
| `inventory`        | Inventory management logic                        |
| `logistics`        | Shipping and delivery                             |
| `notification-engine` | Multi-channel notification delivery            |
| `payments`         | Paystack wrapper (`@vayva/payments`)              |
| `schemas`          | Shared Zod/validation schemas                     |
| `shared`           | Shared types, logger, utilities (`@vayva/shared`) |
| `workflow`         | Visual workflow builder engine                    |

---

## Security Measures

- **Password hashing:** bcrypt
- **JWT with sliding window:** 30-minute idle timeout, 7-day max session
- **PII sanitization:** Email, phone, card numbers stripped before AI API calls
- **Rate limiting:** Tier-based, Redis-backed in production
- **API keys:** Hashed storage, IP allowlists, expiration support (`ApiKey` model)
- **KYC verification:** Identity verification flow (`KycRecord` model)
- **Audit logging:** Comprehensive audit trail for all sensitive operations
- **SAML/SSO:** Enterprise SSO support via `SamlSession`, `SamlUserLink`
- **SCIM provisioning:** Automated user provisioning (`ScimUser`, `ScimGroup`)
- **Kill switches:** `PlatformKillSwitch` model for emergency feature disabling
- **Abuse detection:** `SignupAbuseSignal`, `AbuseRule` for fraud prevention
