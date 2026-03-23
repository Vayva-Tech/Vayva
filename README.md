# Vayva

AI-powered commerce platform for African businesses. Vayva gives merchants an all-in-one store with AI customer support via WhatsApp, multi-channel sales, analytics, and automated workflows.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.6 (App Router) |
| Language | TypeScript, React 19 |
| Database | PostgreSQL + Prisma ORM |
| Styling | Tailwind CSS |
| Monorepo | pnpm workspaces + TurboRepo |
| Payments | Paystack |
| AI | OpenRouter (GPT-4o Mini, Llama 3.3 70B) |
| Messaging | Evolution API (WhatsApp) |
| Hosting | Vercel |

## Monorepo Structure

```
vayva/
├── Frontend/
│   ├── merchant/        # Merchant dashboard (primary app)
│   ├── marketing/       # Landing pages & website
│   ├── ops-console/     # Internal operations console
│   ├── storefront/      # Customer-facing stores
│   └── mobile/          # Mobile app (React Native)
├── Backend/
│   ├── core-api/        # Main API server
│   ├── worker/          # Background job processor
│   ├── workflow/        # Workflow execution engine
│   └── ops-console/     # Ops API
├── packages/
│   ├── ui/              # Shared UI components
│   ├── db/              # Prisma client & schema
│   ├── ai-agent/        # AI agent services
│   ├── shared/          # Shared utilities
│   ├── schemas/         # Zod validation schemas
│   ├── billing/         # Billing & subscription logic
│   ├── analytics/       # Analytics services
│   ├── content/         # CMS & content management
│   ├── emails/          # Email templates
│   ├── compliance/      # Legal & compliance
│   ├── industry-*/      # Industry-specific modules
│   └── ...              # Additional packages
├── infra/
│   ├── db/              # Prisma schema & migrations
│   └── terraform/       # Infrastructure as code
├── platform/            # CI, testing, scripts
└── docs/                # Documentation
```

## Pricing Tiers

| Tier | Price | AI Credits |
|------|-------|-----------|
| STARTER | ₦25,000/mo | 5,000 |
| PRO | ₦35,000/mo | 10,000 |
| PRO_PLUS | ₦50,000/mo | 25,000 |

AI credits: 0.24 credits per 1,000 tokens.

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10.2+
- PostgreSQL 15+

### Setup

```bash
# Clone
git clone https://github.com/Vayva-Tech/Vayva.git
cd Vayva

# Install dependencies
pnpm install

# Set up environment
cp Frontend/merchant/.env.example Frontend/merchant/.env.local
# Edit .env.local with your database URL, API keys, etc.

# Generate Prisma client
pnpm --filter @vayva/db db:generate

# Push schema to database
pnpm --filter @vayva/db db:push

# Run all apps
pnpm dev
```

### Run Individual Apps

```bash
pnpm --filter @vayva/merchant dev      # Merchant dashboard (port 3000)
pnpm --filter @vayva/storefront dev    # Storefront (port 3001)
pnpm --filter @vayva/marketing dev     # Marketing site (port 3002)
pnpm --filter @vayva/ops-console dev   # Ops console (port 3003)
```

## Production Domains

| App | Domain |
|-----|--------|
| Marketing | [vayva.ng](https://vayva.ng) |
| Merchant | [merchant.vayva.ng](https://merchant.vayva.ng) |
| Ops Console | [ops.vayva.ng](https://ops.vayva.ng) |
| Storefront | [store.vayva.ng](https://store.vayva.ng) |

## Key Environment Variables

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
OPENROUTER_API_KEY=...
EVOLUTION_API_URL=http://163.245.209.202:8080
EVOLUTION_API_KEY=...
PAYSTACK_SECRET_KEY=...
PAYSTACK_PUBLIC_KEY=...
```

## Documentation

Full documentation is available in the [`/docs`](./docs) directory:

- [Platform Overview](./docs/00_start-here/platform-overview.md)
- [Getting Started](./docs/00_start-here/getting-started.md)
- [Engineering](./docs/02_engineering/)
- [Deployment](./docs/04_deployment/)

## License

Proprietary. All rights reserved.
