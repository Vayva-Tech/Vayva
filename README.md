# Vayva 🚀

[![CI](https://github.com/itsfredrick/vayva-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/itsfredrick/vayva-platform/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Vayva is a **multi-tenant e-commerce and commerce-operations platform** purpose-built for the Nigerian market. It enables merchants to launch, operate, and scale online businesses across web, mobile, and conversational channels, with native payments, logistics, and AI-powered customer engagement.

The platform is designed as **infrastructure**, not just a storefront—combining payments, fulfillment, marketing, and automated customer interaction into a single, extensible system.

---

🎯 Core Capabilities

- **Multi-Tenant Commerce Engine**
  Secure, isolated merchant environments with shared infrastructure and centralized governance.

- **Merchant Dashboard**
  Unified interface for product management, orders, customers, analytics, marketing campaigns, and payouts.

- **AI-Powered WhatsApp Commerce**
  Conversational storefronts that handle customer inquiries, product discovery, and order placement directly on WhatsApp.

- **Native Paystack Payments**
  First-class integration with Paystack for cards, bank transfers, and local payment flows.

- **Logistics & Fulfillment Automation**
  Order routing, delivery coordination, and fulfillment status tracking.

### 💡 Why WhatsApp Commerce?

**The Problem**:
In emerging markets like Nigeria, **trust and data** are the biggest barriers to e-commerce adoption.

1. Customers don't trust websites they've never heard of.
2. Data is expensive; users live in WhatsApp where data is bundled/cheap.
3. Downloading an app for a single store is high friction.

**Our Approach**:
Vayva brings the _entire store_ into WhatsApp.

- **Catalog & Search**: Browse products without leaving the chat.
- **Checkout**: Add to cart and pay via secure links generated in-chat.
- **AI Agent**: Automatically answers "How much is delivery?" and "Is this available?".

**Constraints**:

- Must work on low-end Android devices (latency sensitive).
- Must handle intermittent connectivity (optimistic UI).

- **Marketing & Growth Tools**
  Discount campaigns, SEO-friendly storefronts, and customer engagement workflows.

- **Operations Console (Internal)**
  Administrative tools for onboarding merchants, auditing transactions, resolving disputes, and platform oversight.

- **Append-Only Financial Ledger**
  Immutable transaction records designed for audits, reconciliation, and regulatory clarity.

---

## 🏗 System Architecture

> **See full documentation in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**

Vayva is implemented as a **high-performance monorepo** using **TurboRepo**, optimized for independent scaling of applications and services while maintaining strong type safety and shared standards.

### Repository Layout

#### `apps/`

End-user and internal applications:

- **`web`** — Next.js application containing:
  - Public marketing site
  - Merchant dashboard
  - Customer-facing storefronts

- **`ops-console`** — Internal admin and support tooling
- **`mobile`** — Merchant mobile application
- **`worker`** — Background job processor (emails, webhooks, sync tasks)

#### `services/`

Domain-focused backend services, including:

- Authentication & identity
- Payments & ledgering
- Orders & fulfillment
- WhatsApp messaging
- AI orchestration and automation

Each service is independently deployable and communicates via standardized APIs.

#### `packages/`

Shared foundations across the platform:

- **`ui`** — Premium “Light Glass” design system and components
- **`schemas`** — Shared Zod schemas for runtime and compile-time validation
- **`shared`** — Common utilities, types, and constants
- **`api-client`** — Typed service-to-service and frontend API clients

---

## 🛠 Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19
- **Styling**: Tailwind CSS
- **State & Data Fetching**: React Context API, SWR
- **Database**: PostgreSQL with Prisma ORM
- **Background Jobs / Caching**: Redis
- **Email**: Resend
- **Monorepo Tooling**: TurboRepo, pnpm
- **Animation & Motion**: Framer Motion
- **Testing**: Playwright, unit and integration test suites

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9
- Docker (for PostgreSQL and Redis)

### Setup

```bash
git clone https://github.com/itsfredrick/vayva-platform.git
cd vayva-platform
pnpm install
```

Create your environment file:

```bash
cp .env.staging.example .env
```

Initialize the database:

```bash
pnpm db:generate
pnpm db:push
```

### Local Development

Start the core applications:

```bash
pnpm dev
```

Accessible endpoints:

- Merchant Dashboard: [http://localhost:3000](http://localhost:3000)
- Ops Console: [http://localhost:3002](http://localhost:3002)

---

## 🧪 Quality & Validation

- Type safety: `pnpm typecheck`
- Linting: `pnpm lint`
- Unit & integration tests: `pnpm test`
- End-to-end tests: `pnpm test:e2e`
- Smoke tests: `pnpm test:smoke`

---

## 📜 Development Standards

- Feature-based branching (`feat/*`, `fix/*`)
- Conventional commits
- Mandatory type checks before merge
- CI-enforced test and build validation

---

**Vayva is designed as long-term commerce infrastructure for emerging markets—modular, auditable, and automation-first.**

---

## Explanation of the README (what each part communicates)

**What this README does better**

- Positions Vayva as **commerce infrastructure**, not just an e-commerce site.
- Makes the Nigerian-market focus explicit without sounding narrow.
- Signals production readiness, auditability, and scale.
- Helps investors, contributors, and reviewers quickly understand _why this exists_ and _how it works_.

### 1. Introduction

Explains _what Vayva is_ and _why it exists_.
Key idea: Vayva is not a Shopify clone—it is an integrated commerce + operations + AI platform.

### 2. Core Capabilities

This replaces a generic “features list” with **business-level capabilities**:

- Multi-tenancy → scale and isolation
- WhatsApp AI → local behavior fit
- Ledger → financial correctness and trust
  This helps technical and non-technical readers.

### 3. Architecture

Clarifies that:

- This is a **monorepo by design**, not accident.
- Apps, services, and packages are separated for scale.
- Services are domain-driven and deployable independently.

### 4. Technology Stack

Signals modern, forward-compatible choices:

- Next.js 15
- Prisma + PostgreSQL
- Redis + background workers
  This reassures contributors that the project is not experimental chaos.

### 5. Getting Started

Optimized for:

- New contributors
- Reviewers cloning the repo
- CI environments
  Minimal but complete.

### 6. Quality & Validation

Communicates engineering discipline:

- Type safety
- E2E testing
- Smoke tests
  This matters for trust.

### 7. Development Standards

Shows maturity:

- Branching strategy
- Commit discipline
- CI enforcement

---

## 🗺 Roadmap

### 🔴 Now (Current Focus)

- **Core Stability**: Fixing CI/CD pipelines and type safety.
- **Documentation**: Establishing architectural baselines (`docs/ARCHITECTURE.md`).
- **Email System**: Productionizing transactional emails with Resend.

### 🟡 Next (Upcoming)

- **Merchant Onboarding**: Smooth KYC and Business Profile setup.
- **AI Agent Hardening**: Improving WhatsApp sales bot intent recognition.
- **Payments**: End-to-end Paystack integration for split payments.

### 🟢 Later (Future)

- **Marketplace**: Centralized discovery for all Vayva merchants.
- **Mobile App**: Dedicated Android/iOS app for store management.
- **Advanced Analytics**: Cross-channel attribution modeling.
