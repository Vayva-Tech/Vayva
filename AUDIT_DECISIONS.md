# Vayva Platform - All Decisions from Audit Session

## Architecture

### Deployment

- **Frontend (Vercel)**: Merchant Dashboard (`merchant.vayva.ng`), Storefront (`{slug}.vayva.ng`), Ops Console (`ops.vayva.ng`)
- **Backend (VPS)**: Fastify microservices at `api.vayva.ng/api/v1/`
- **Database**: PostgreSQL, Redis, MinIO (all on VPS)
- **ML**: Ollama + Qdrant on VPS (drop Neo4j)
- **Local Dev**: Docker Compose for PostgreSQL + Redis + MinIO

### Backend Architecture

- **Microservices**: Split Fastify into services (Auth, Commerce, Finance, Industry, Platform, AI, Admin)
- **All routes under `/api/v1/`**
- **Zero API routes on Next.js frontends** - everything goes through Fastify
- **File uploads**: Presigned URL flow (Frontend → Fastify → MinIO)

### Frontend Architecture

- **All 3 frontends are pure UI** - no Next.js API routes
- **API client**: `@vayva/api-client` package, points to Fastify
- **Auth**: JWT Bearer tokens in localStorage
- **Data fetching**: TanStack Query (replace SWR)
- **Tables**: TanStack Table
- **Brand color**: Configurable per merchant
- **Insights sidebar**: All dashboard pages

## Auth

### JWT Flow

- Login hits Fastify `/api/v1/auth/login`
- Returns JWT, frontend stores in localStorage
- Frontend sends `Authorization: Bearer <token>` header
- Fastify middleware validates JWT

### Login Methods

- Email + Password (free)
- Google OAuth (free)
- No SMS OTP (costs money)

### Session Models

- All 5 session models are active (OpsUser, MerchantSession, UserSession, SamlSession, CustomerSession)
- SamlSession/Scim models should be removed (no enterprise plan)

## Database / Schema

### Plan System

- **3 tiers**: STARTER, PRO, PRO_PLUS
- **Prisma Plan model is source of truth** - frontend fetches from DB
- **Update schema enum**: Add PRO_PLUS to SubscriptionPlan
- **Remove**: MerchantAiSubscription (AI credits bundled into main plans)
- **Remove**: SCIM/SAML models (no enterprise plan)
- **Remove**: SamlServiceProvider, SamlAuthRequest, SamlSession, SamlUserLink, SamlRoleMapping, ScimUser, ScimGroup, ScimToken, SamlIdentityProvider

### Store Model

- `industrySlug` is REQUIRED (not nullable) - update schema
- `plan: SubscriptionPlan` is the main subscription indicator

### Schema Cleanup

- **Audit all 200+ models** for actual usage before any changes
- **Remove unused models aggressively** (Farm, Crop, Livestock, Book, ServerInstance if not used)
- **Keep Paystack + Stripe providers**

### Tenant vs Store

- Tenant is for billing/org-level stuff
- Membership is for actual store access
- TenantMembership is separate concept

## Industry System

### Industry Model

- **26+ industry packages**, all kept (they add value)
- **Industry required at signup** - no null allowed
- **4 archetypes**: Commerce, Food, Bookings, Content
- **Industry-specific overrides** for labels, icons, routes, widgets

### Dashboard

- **ONE universal dashboard component** (`UniversalProDashboard`)
- **Industry packages register widgets** into universal dashboard
- **No per-industry dashboard components** - everything goes through universal one
- **IndustryDashboardRouter**: Loads universal dashboard, passes industry config

### Sidebar

- **Main sidebar shows sections** (~10 items): Home, Commerce, Growth, Money, Platform
- **Breadcrumbs for drill-down** sub-pages
- **Industry sub-items shown dynamically** in main sidebar (no double sidebar)
- **Onboarding "Select Tools" = sidebar modules** (direct mapping)

### Settings

- **Industry-agnostic settings** - one page that adapts dynamically
- Remove industry-specific settings directories (beauty/, grocery/, real-estate/, etc.)

## Commerce

### Commerce Flow (Need to Audit)

```
Customer → Storefront → Fastify → Create Order → Payment → Dashboard
```

### Storefront

- **Multi-tenant by subdomain**: `{slug}.vayva.ng`
- **Custom domains for premium** plan
- **Public browsing**, optional customer login
- **Template marketplace** for storefront designs
- Need to audit slug resolution middleware

### POS System

- **Universal POS** that adapts by industry
- Remove industry-specific POS directories

### Fulfillment

- Wire up to real API calls (currently hardcoded stub)

### Integrations Marketplace

- **Full integrations marketplace** (not just links)
- **Payment**: Paystack (default), Stripe (optional, switch in settings)
- **Social/AI**: Evolution API (default WhatsApp), Instagram, Messenger, TikTok DMs
- **Ads**: Meta Ads, Google Ads, TikTok Ads
- **Accounting**: Xero, QuickBooks
- **Logistics**: Kwik Delivery

## AI / ML

### Dual AI Systems (Both Active)

- **OpenRouter Client**: Chat, agent, vision, tool calling
- **ML Gateway**: Local RAG, zero-cost queries

### AI Provider

- **OpenRouter only** (remove OpenAI direct calls)
- **DeepSeek VL2** for vision (via OpenRouter)
- Models: DeepSeek Chat (general), DeepSeek Reasoner (reasoning), Mistral Large (realtime)

### ML Infrastructure

- **Ollama + Qdrant** (keep, deploy to VPS via Docker)
- **Neo4j** (drop - overkill)
- **Embedding service** (deploy to VPS)

### AI Agent (Platform-Agnostic)

- **Default**: WhatsApp via Evolution API (deployed and configured)
- **Extensible**: Instagram DMs, Facebook Messenger, TikTok DMs
- **Scope**: DM replies only (not comments/posts)
- **Same agent config** works on any connected platform
- **Features**: Product search, order placement, delivery quotes, image understanding, escalation
- **All features from day one**

### AI Credits

- **Bundled into main subscription plans** (user defines exact numbers later)
- **Remove MerchantAiSubscription** model
- **Simple credits balance** on Store or plan-based allocation

### AI Tools (Dashboard)

- Text Generator, Image Generator, Marketing Copy
- Routes exist but are stubs - need to implement with OpenRouter

### AI Insights

- **Both BI summaries + Predictive analytics**
- "Your sales are up 15% this week, driven by product X"
- "Based on trends, you'll run out of stock in 3 days"

### Automation

- **Worker processes them** via BullMQ + Redis
- **Multiple workers exist** - need consolidation
- Triggers: ORDER_CREATED, ABANDONED_CHECKOUT, etc.
- Actions: SEND_EMAIL, SEND_WHATSAPP, APPLY_DISCOUNT, etc.

### Visual Search

- **Both customer search + merchant cataloging**
- Customers upload photo → find similar products
- Merchants upload images → auto-generate descriptions/tags

## Dashboard Pages

### Page Status

- **176 total pages** in /dashboard/
- **21 pages have real API calls** (useSWR/fetch/apiClient)
- **155 pages are stubs** with hardcoded data
- **Implement all stubs** - wire up to Fastify endpoints

### Priority

- **Start with 21 pages that have API calls** already
- Then implement remaining stubs

### Real Pages (with API calls)

Products, Orders, Customers, Finance, Marketing, Billing, AI Hub, AI Usage, Addons, API Keys, Creative, Events, Feature Flags, Healthcare Services, Inventory, Plans, Portfolio, Properties, Resources, Subscriptions, Tenants, Webhooks

### Stub Pages (hardcoded data)

Fulfillment, POS, Restaurant, Healthcare, Hotel, Education, and ~150 more

## Onboarding

### Flow (12 steps, all skippable)

1. Welcome → 2. Plan Selection → 3. Identity → 4. Business → 5. Industry → 6. Tools (= sidebar modules) → 7. First Item (skip) → 8. Socials (skip) → 9. Finance (bank + NIN/BVN/CAC) → 10. KYC → 11. Policies → 12. Publish Storefront

### KYC

- Bank account required
- Plus one of: NIN, BVN, or CAC (merchant picks)

### Auto-Creation

- Store created after signup
- Storefront needs manual publish
- Incomplete steps accessible from Account page later

## Ops Console

- **Separate app on Vercel** - pure UI
- **All operations through Fastify**
- **Remove backend dependencies** (bcryptjs, bullmq, ioredis, otplib, resend)
- **Platform administrators only**

## Worker

- **Multiple workers**: apps/worker/, Backend/worker/, ops-console BullMQ
- **Need consolidation** into single worker service
- Uses BullMQ + Redis

## Billing

- **Paystack for Africa**, Stripe for international
- **Plan prices from Prisma Plan model** (not frontend config)

## General Principles

- **Full build, just fix the bugs** - don't remove features, make everything work
- **26+ industries from day one**
- **Simplify where possible** but keep all features
- **Prisma Plan model is source of truth** for plans/pricing
- **OpenRouter is sole AI provider**
