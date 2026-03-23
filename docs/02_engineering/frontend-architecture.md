# Frontend Architecture

> Vayva platform frontend — Next.js 16.1.6 App Router monorepo

## Overview

The Vayva frontend is a monorepo containing four Next.js applications under `Frontend/`, sharing code through internal packages under `packages/`. All apps use the App Router pattern with React Server Components, SWR for client-side data fetching, and Turbopack for local development.

```
Frontend/
├── merchant/       # Merchant dashboard (merchant.vayva.ng)
├── ops-console/    # Internal operations console (ops.vayva.ng)
├── storefront/     # Customer-facing store rendering (store.vayva.ng)
└── marketing/      # Public marketing site (vayva.ng)
```

---

## Merchant Dashboard (`@vayva/merchant`)

The primary application for merchants to manage their businesses. Uses `standalone` output mode for Vercel deployment.

### Route Groups

| Group | Path | Purpose |
|-------|------|---------|
| `(auth)` | `/signin`, `/signup`, `/forgot-password`, `/reset-password` | Authentication flows |
| `(dashboard)` | `/dashboard/**` | Main dashboard with all merchant tools |
| `onboarding` | `/onboarding` | New merchant setup wizard |
| `billing` | `/billing` | Subscription and billing management |
| `checkout` | `/checkout` | Subscription checkout flow |

### Dashboard Pages (`(dashboard)/dashboard/`)

Core commerce:
- `page.tsx` — Main dashboard overview with KPI widgets
- `products/` — Product catalog management
- `orders/` — Order management and fulfillment
- `customers/` — Customer database and segments
- `inventory/` — Stock tracking and restock alerts

AI and automation:
- `autopilot/` — AI Autopilot configuration (PRO+ tiers)
- `ai/` — AI tools and generation
- `ai-hub/` — Centralized AI features dashboard
- `ai-agent/` — WhatsApp AI agent configuration
- `ai-insights/` — AI-powered business insights
- `workflow-automation/` — Visual workflow builder (PRO_PLUS only)

Sales and marketing:
- `analytics/` — Sales analytics and reporting
- `campaigns/` — Marketing campaign management
- `marketing/` — Marketing tools
- `social-media/`, `social-hub/`, `socials/` — Social media management
- `affiliate/` — Affiliate program management
- `referrals/` — Referral tracking

Finance:
- `billing/` — Billing and subscription management
- `finance/` — Financial overview and reports
- `transactions/` — Transaction history
- `subscriptions/` — Customer subscriptions
- `refunds/` — Refund processing
- `payouts/` — Payout management

Store management:
- `storefront/` — Storefront configuration
- `designer/` — Theme and layout designer
- `templates/` — Store template selection
- `domains/` — Custom domain management (PRO+ tiers)
- `pages/` — CMS page editor
- `blog/` — Blog post management

Operations:
- `settings/` — Store settings
- `integrations/` — Third-party integrations
- `webhooks/` — Webhook configuration
- `api-keys/` — API key management
- `support/` — Support ticket management
- `vendors/` — Vendor/supplier management

Industry-specific dashboards (PRO_PLUS):
- `kitchen/`, `grocery/`, `nightlife/` — Food and beverage
- `beauty/`, `wellness/` — Health and beauty
- `real-estate/`, `properties/` — Real estate
- `events/`, `bookings/` — Events and appointments
- `nonprofit/` — Nonprofit management
- `professional/`, `services/` — Professional services

Beta features:
- `beta/desktop-app/` — Desktop app preview
- `beta/industry-dashboards/` — Industry dashboard previews
- `beta/meal-kit/` — Meal kit management

### Component Organization (`src/components/`)

Components are organized by feature domain:

- `dashboard/`, `dashboard-v2/` — Dashboard widgets and layouts
- `products/`, `orders/`, `customers/` — Core commerce components
- `analytics/` — Charts and analytics widgets
- `ai/`, `ai-agent/`, `ai-insights/` — AI feature components
- `onboarding/` — Onboarding wizard components
- `billing/`, `subscription/` — Billing UI
- `auth/` — Authentication forms
- `settings/` — Settings panels
- `workflow/` — Workflow builder components
- `whatsapp/` — WhatsApp integration UI
- `ui/` — Local UI primitives (app-specific)
- `navigation/` — Sidebar, header, breadcrumbs
- `layout/` — Shell layouts (`admin-shell.tsx`, `auth-shell.tsx`)

### Onboarding System

The onboarding wizard lives in `src/components/onboarding/` and guides new merchants through setup:

1. `WelcomeStep` — Welcome and introduction
2. `BusinessStep` / `SimplifiedBusinessStep` — Business details
3. `IndustryStep` — Industry selection (determines available features)
4. `IdentityStep` — Brand identity setup
5. `FirstItemStep` — Add first product/service
6. `PaymentStep` — Payment provider configuration (Paystack)
7. `PoliciesStep` — Store policies
8. `SocialsStep` / `SimplifiedSocialsStep` — Social media connections
9. `KycStep` — KYC verification
10. `ReviewStep` — Review and launch
11. `PublishStep` — Go live

Additional specialized steps: `B2BSetupStep`, `EventsSetupStep`, `NonprofitSetupStep`.

Context and layout managed by `OnboardingContext.tsx`, `OnboardingLayout.tsx`, and `OnboardingWrapper.tsx`. An `OnboardingTutorial.tsx` component provides guided walkthroughs for first-time users after onboarding.

---

## Ops Console (`ops-console`)

Internal operations dashboard for Vayva team to monitor and manage the platform.

### Route Structure

| Group | Path | Purpose |
|-------|------|---------|
| `(dashboard)` | `/monitoring`, `/revenue`, `/customer-success` | Top-level KPI dashboards |
| `ops/(app)` | `/ops/**` | Full operations tooling |
| `ops/(auth)` | `/ops/login` | Ops team authentication |
| `admin/` | `/admin/subprocessors` | Admin and compliance pages |
| `analytics/` | `/analytics/cookie-consent` | Analytics compliance |

### Ops App Pages (`ops/(app)/`)

- `merchants/` — Merchant account management
- `orders/` — Platform-wide order monitoring
- `payments/`, `payouts/` — Payment processing oversight
- `subscriptions/` — Subscription management
- `analytics/` — Platform analytics
- `financials/` — Financial reporting
- `ai/` — AI usage monitoring
- `compliance/`, `kyc/` — Compliance and verification
- `disputes/`, `refunds/` — Dispute resolution
- `security/`, `risk/`, `fraud` (via webhooks) — Security monitoring
- `support/`, `live-chat/`, `inbox/` — Customer support tools
- `onboarding/` — Merchant onboarding oversight
- `health/` — System health monitoring
- `alerts/` — Alert configuration
- `developers/`, `webhooks/` — Developer tools
- `marketplace/` — Marketplace management
- `partners/` — Partner program management
- `rescue/` — Merchant rescue (AI-assisted intervention)
- `runbook/` — Operational runbooks
- `settings/`, `team/`, `users/` — Ops team management

---

## Storefront (`storefront`)

Customer-facing store rendering engine. Serves individual merchant storefronts.

### Route Structure

- `[lang]/` — Internationalized routes (language prefix)
  - `account/` — Customer account (login, orders, profile)
- `stores/` — Store directory
- `products/` — Product listing and detail pages
- `collections/` — Product collections
- `cart/` — Shopping cart
- `checkout/` — Checkout flow
- `order/`, `orders/` — Order confirmation and history
- `tracking/` — Order tracking
- `search/` — Product search
- `blog/` — Store blog
- `contact/` — Contact page
- `policies/` — Store policies (returns, privacy, etc.)
- `vendors/` — Vendor pages
- `affiliate/` — Affiliate landing pages
- `paystack-test/` — Payment integration testing

### Templates

Store templates live in `src/templates/` (e.g., `one-product/`) and provide different storefront layouts that merchants select during onboarding.

---

## Marketing Site (`marketing`)

Public-facing marketing website at `vayva.ng`.

### Route Structure (`(pages)/`)

- `page.tsx` — Homepage with GSAP animations (`GSAPLandingClient.tsx`)
- `pricing/` — Pricing page (STARTER / PRO / PRO_PLUS tiers)
- `features/`, `all-features/` — Feature showcase
- `solutions/` — Industry solutions
- `industries/` — Industry-specific landing pages
- `ai-agent/` — AI Agent feature page
- `autopilot/` — Autopilot feature page
- `store-builder/` — Store builder feature page
- `how-vayva-works/` — How it works
- `about/`, `team/` — Company pages
- `blog/` — Marketing blog
- `contact/`, `help/` — Support pages
- `developers/` — Developer documentation
- `trust/` — Trust and security page
- `legal/` — Legal pages (terms, privacy)
- `templates/` — Template gallery
- `desktop-download/`, `download/` — Desktop app downloads
- `checkout/` — Marketing checkout flow
- `system-status/` — Platform status page

---

## Shared Packages

All apps share code through internal packages under `packages/`:

### Core Packages

| Package | Purpose |
|---------|---------|
| `@vayva/ui` | Shared UI component library (buttons, inputs, modals, etc.) |
| `@vayva/theme` | Design tokens, color schemes, typography |
| `@vayva/schemas` | Zod validation schemas shared across apps |
| `@vayva/shared` | Shared utilities, constants, env parsing, URL helpers |
| `@vayva/api-client` | Typed API client for backend communication |
| `@vayva/db` | Prisma client and database utilities |
| `@vayva/content` | CMS and content management utilities |
| `@vayva/templates` | Store template definitions |
| `@vayva/emails` | Email template rendering (Resend) |

### Feature Packages

| Package | Purpose |
|---------|---------|
| `@vayva/billing` | Billing and subscription logic |
| `@vayva/payments` | Payment processing (Paystack) |
| `@vayva/analytics` | Analytics tracking and reporting |
| `@vayva/compliance` | KYC and compliance utilities |
| `@vayva/inventory` | Inventory management logic |
| `@vayva/logistics` | Shipping and delivery |
| `@vayva/workflow` | Workflow automation engine |
| `@vayva/realtime` | WebSocket and real-time features |
| `@vayva/notification-engine` | Push and in-app notifications |
| `@vayva/social` | Social media integration |
| `@vayva/addons` | Add-on/extension system |
| `@vayva/marketplace` | Marketplace features |
| `@vayva/pos` | Point-of-sale features |
| `@vayva/security` | Security utilities |

### Industry Packages

Vertical-specific logic under `packages/industry-*`:

`industry-core`, `industry-retail`, `industry-restaurant`, `industry-food`, `industry-grocery`, `industry-fashion`, `industry-events`, `industry-nightlife`, `industry-nonprofit`, `industry-wellness`, `industry-travel`, `industry-realestate`, `industry-automotive`, `industry-legal`, `industry-professional`, `industry-meal-kit`, `industry-education`, `industry-healthcare`, `industry-creative`, `industry-saas`, `industry-services`, `industry-specialized`, `industry-wholesale`, `industry-petcare`, `industry-blog-media`

---

## Data Fetching Patterns

### SWR (Client-Side)

The merchant dashboard uses SWR (`^2.3.8`) for client-side data fetching with automatic revalidation:

```tsx
import useSWR from "swr";

const { data, error, isLoading } = useSWR("/api/products", fetcher);
```

SWR is used for dashboard pages that need real-time updates: products, orders, customers, analytics, inventory, finance, marketing, and the AI hub.

### API Proxying

The merchant app proxies API requests through Next.js rewrites when `MERCHANT_API_URL` is set:

- `/api/auth/*` routes are handled locally (NextAuth)
- All other `/api/*` routes are proxied to the backend API server
- Ops console routes can be proxied via `OPS_CONSOLE_URL`

### Real-Time Data

WebSocket connections for live dashboard updates use `NEXT_PUBLIC_WS_URL` (defaults to `ws://localhost:3001`). Used for real-time order notifications, inventory alerts, and retail dashboards.

---

## Feature Gating by Tier

Feature access is controlled through `src/lib/access-control/tier-limits.ts`. Three tiers exist:

### STARTER
- 500 products, 500 orders/month, 1,000 customers
- 1 team member, 10K AI tokens, 500 WhatsApp messages
- 3 automation rules, 5 campaigns, 90-day analytics
- No AI Autopilot, no custom domains, no API access, no industry dashboards

### PRO
- 1,000 products, 10K orders/month, unlimited customers
- 3 team members, 100K AI tokens, 5K WhatsApp messages
- 20 automation rules, unlimited campaigns, 365-day analytics
- AI Autopilot enabled, custom domains, API access, multi-store
- No industry dashboards, no visual workflow builder

### PRO_PLUS
- Unlimited products, orders, customers
- 5 team members, 200K AI tokens, 10K WhatsApp messages
- Unlimited automation rules, unlimited dashboard widgets
- All PRO features plus: industry dashboards, merged industry dashboard, visual workflow builder

Helper functions:
- `isFeatureAvailable(tier, feature)` — Boolean check
- `getFeatureLimit(tier, feature)` — Get max items for a feature

---

## Build Configuration

All apps share common Next.js configuration patterns:

- **Output**: `standalone` (required for Vercel serverless deployment)
- **Turbopack**: Root set to monorepo root via `path.resolve(__dirname, "../..")`
- **Transpile packages**: All `@vayva/*` packages are listed in `transpilePackages`
- **React Compiler**: Enabled for ops-console and storefront; disabled for merchant
- **Optimized imports**: `@phosphor-icons/react`, `lucide-react`, `framer-motion`, `recharts`, `date-fns`
- **Security headers**: All apps set `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, and `Referrer-Policy`
- **Image domains**: Cloudinary, Unsplash, Vercel Blob Storage, S3

### Merchant-Specific Config
- Webpack fallbacks for server-only modules (dns, net, tls, fs)
- Puppeteer externalized from server bundle (PDF generation)
- API rewrites for backend proxying
- Login/register redirects to signin/signup
- Cron job: `/api/jobs/cron/trial-reminders` runs daily at 08:00

### Storefront-Specific Config
- MinIO image support (`163.245.209.202:9000`)
- Webpack alias for `@/` path resolution
