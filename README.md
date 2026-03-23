<div align="center">

# Vayva

### The AI-Powered Commerce Platform for Africa

Build, sell, and scale your business with intelligent automation — powered by AI agents that sell for you on WhatsApp, manage your store, and delight your customers.

[Website](https://vayva.ng) &nbsp;&middot;&nbsp; [Merchant Dashboard](https://merchant.vayva.ng) &nbsp;&middot;&nbsp; [Documentation](./docs)

</div>

---

## What is Vayva?

Vayva is an AI-native commerce platform purpose-built for the African market. It gives merchants everything they need to launch, run, and grow an online business — from branded storefronts and product management to AI-powered sales agents that engage customers directly on WhatsApp.

Unlike traditional e-commerce tools that bolt on AI as an afterthought, Vayva is built around it. Every merchant gets an intelligent assistant that handles product inquiries, processes orders, recommends products, and operates autonomously around the clock. Merchants configure their agent's tone, personality, and escalation rules — then let it sell.

Vayva serves 20+ industry verticals including retail, restaurants, grocery, fashion, events, travel, healthcare, and more. With Paystack-native payment processing, Naira-first pricing, and deep WhatsApp integration, it is designed from the ground up for how African businesses actually operate.

## Key Features

- **AI-Powered Customer Support** — Autonomous sales agents on WhatsApp and web chat. Configurable tone, personality, and escalation rules. Handles inquiries, recommendations, and order placement 24/7.
- **Smart Store Management** — Full product catalog, inventory tracking, order lifecycle management, multi-staff accounts, and branded storefronts — all from a single dashboard.
- **Automated Workflows (AI Autopilot)** — Visual workflow builder for automating repetitive tasks. AI Autopilot mode lets the agent take autonomous actions like updating inventory, sending notifications, and processing orders.
- **Analytics & Insights** — Revenue tracking, customer behavior analysis, AI usage metrics, and conversion analytics. Real-time visibility into what is working.
- **Multi-Industry Support** — 20+ specialized vertical modules (restaurant menus, event ticketing, appointment booking, and more) without bloating the core platform.
- **Nigerian Payment Integration** — Native Paystack integration for seamless Naira transactions. Subscription billing, one-time payments, and automated payouts.

## Architecture

Vayva is a TypeScript monorepo managed with pnpm workspaces and TurboRepo.

```
vayva/
│
├── Frontend/                    # Next.js applications
│   ├── merchant/                # Merchant dashboard         → merchant.vayva.ng
│   ├── marketing/               # Public website & landing   → vayva.ng
│   ├── ops-console/             # Internal operations        → ops.vayva.ng
│   └── storefront/              # Customer-facing stores     → store.vayva.ng
│
├── Backend/                     # Server-side services
│   ├── core-api/                # Primary API server
│   ├── worker/                  # Background job processor (BullMQ)
│   ├── workflow/                # Workflow execution engine
│   └── ops-console/             # Ops backend logic
│
├── packages/                    # Shared libraries
│   ├── db/                      # Prisma client & schema
│   ├── ui/                      # Component library (Radix)
│   ├── schemas/                 # Zod validation schemas
│   ├── ai-agent/                # AI agent logic & prompts
│   ├── billing/                 # Subscription & tier management
│   ├── analytics/               # Analytics processing
│   ├── payments/                # Paystack integration
│   ├── industry-*/              # 20+ vertical modules
│   └── ...                      # Additional shared packages
│
├── platform/                    # CI/CD, scripts, testing
├── docs/                        # Platform documentation
└── infra/                       # Infrastructure (Terraform)
```

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5.9, React 19 |
| **Database** | PostgreSQL + Prisma ORM |
| **Cache & Queues** | Redis, BullMQ |
| **AI** | (GPT-4o Mini, Llama 3.3 70B), OpenRouter |
| **Payments** | Paystack |
| **Messaging** | Evolution API (WhatsApp) |
| **UI** | Tailwind CSS, Radix UI, Framer Motion |
| **Email** | Resend + React Email |
| **Auth** | NextAuth / Better Auth |
| **Monitoring** | Sentry |
| **Testing** | Vitest, Playwright, Testing Library |
| **Build System** | TurboRepo + pnpm workspaces |
| **Deployment** | Vercel |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10.2+ (`corepack enable && corepack prepare pnpm@10.2.0 --activate`)
- PostgreSQL 15+
- Redis 7+

### Quick Setup

```bash
# Clone the repository
git clone https://github.com/Vayva-Tech/Vayva.git && cd Vayva

# Install dependencies (auto-generates Prisma client)
pnpm install

# Configure environment variables
cp Frontend/merchant/.env.example Frontend/merchant/.env.local

# Push schema to database
pnpm db:push

# Start all applications
pnpm dev
```

For detailed setup instructions, environment variable reference, and troubleshooting, see the [Getting Started Guide](./docs/00_start-here/getting-started.md).

## Documentation

Full documentation is available in the [`docs/`](./docs) directory:

| Guide | Description |
|---|---|
| [Platform Overview](./docs/00_start-here/platform-overview.md) | Architecture, tech stack, and design principles |
| [Getting Started](./docs/00_start-here/getting-started.md) | Local development setup and common workflows |
| [Engineering](./docs/02_engineering/) | Engineering standards and conventions |
| [Deployment](./docs/04_deployment/) | Production deployment and infrastructure |

## Production

| Application | URL |
|---|---|
| Marketing & Landing | [vayva.ng](https://vayva.ng) |
| Merchant Dashboard | [merchant.vayva.ng](https://merchant.vayva.ng) |
| Operations Console | [ops.vayva.ng](https://ops.vayva.ng) |
| Customer Storefronts | [store.vayva.ng](https://store.vayva.ng) |

## License

Proprietary. All rights reserved. &copy; Vayva Technologies.
