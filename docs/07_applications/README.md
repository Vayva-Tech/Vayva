# Applications Documentation

**Owner:** Nyamsi Fredrick, Founder  
**Last Updated:** March 2026

---

## Overview

This section contains detailed documentation for all applications in the Vayva platform. Each application has its own architecture, features, and operational considerations.

## Application Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         VAYVA PLATFORM                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        FRONTEND LAYER                            │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │   │
│  │  │  Marketing  │  │   Merchant  │  │  Storefront │  │   Ops   │ │   │
│  │  │    Site     │  │    Admin    │  │   (Multi)   │  │ Console │ │   │
│  │  │  (Next.js)  │  │  (Next.js)  │  │  (Next.js)  │  │(Next.js)│ │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └────┬────┘ │   │
│  │         │                │                │               │      │   │
│  │         └────────────────┴────────────────┴───────────────┘      │   │
│  │                              │                                    │   │
│  │                              ▼                                    │   │
│  │  ┌───────────────────────────────────────────────────────────┐   │   │
│  │  │              Core API (Next.js API Routes)                 │   │   │
│  │  │         Business Logic + Database + Integrations           │   │   │
│  │  └───────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              │                                          │
│                              ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        BACKGROUND LAYER                          │   │
│  │  ┌───────────────────────────────────────────────────────────┐   │   │
│  │  │                    Worker (BullMQ)                         │   │   │
│  │  │  - Email Queue    - WhatsApp Queue    - Webhook Queue    │   │   │
│  │  │  - Order Queue    - Payment Queue     - Maintenance      │   │   │
│  │  └───────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              │                                          │
│                              ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        DATA LAYER                                │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │   │
│  │  │  PostgreSQL │  │    Redis    │  │         MinIO           │  │   │
│  │  │  (Prisma)   │  │  (BullMQ)   │  │   (Object Storage)      │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Applications

### Frontend Applications

| Application | Description | URL | Tech Stack |
|-------------|-------------|-----|------------|
| [Marketing](marketing/) | Public website, template gallery, pricing | vayva.ng | Next.js 15, Tailwind |
| [Merchant Admin](merchant-admin/) | Merchant dashboard, order/product management | merchant.vayva.ng | Next.js 15, Tailwind |
| [Storefront](storefront/) | Customer-facing stores (multi-tenant) | {slug}.vayva.ng | Next.js 15, Tailwind |
| [Ops Console](ops-console/) | Internal operations, incident management | ops.vayva.ng | Next.js 15, Tailwind |

### Backend Applications

| Application | Description | Runtime | Tech Stack |
|-------------|-------------|---------|------------|
| [Core API](core-api/) | Business logic, API endpoints | Vercel | Next.js 15 API Routes |
| [Worker](worker/) | Background job processing | VPS (systemd) | Node.js, BullMQ |
| [AI Agent](ai-agent/) | ML-enhanced AI service | VPS (systemd) | Node.js, Local ML |

### AI Agent Features

The AI Agent provides **zero-cost** machine learning capabilities:

| Feature | Description | Cost |
|---------|-------------|------|
| Sentiment Analysis | Customer message sentiment | FREE |
| Intent Classification | Conversation intent detection | FREE |
| Sales Forecasting | Revenue and order predictions | FREE |
| Anomaly Detection | Outlier detection in data | FREE |
| Product Recommendations | Personalized suggestions | FREE |
| Price Optimization | Market-based pricing | FREE |

See [AI Agent Documentation](ai-agent/) for details.

## Application Interactions

### Request Flow

```
Customer → Storefront → Core API → Database
                ↓
Merchant → Merchant Admin → Core API → Database
                ↓
Operator → Ops Console → Core API → Database
                ↓
All Apps → Worker (async jobs) → External APIs
```

### Data Flow

```
Database (PostgreSQL)
    ├── Merchant Data
    ├── Order Data
    ├── Product Data
    ├── Customer Data
    └── Platform Data

Cache (Redis)
    ├── Session Storage
    ├── BullMQ Queues
    └── Rate Limiting

Storage (MinIO)
    ├── Product Images
    ├── Merchant Assets
    └── User Uploads
```

## Common Patterns

### Error Handling

All frontend applications integrate with [Vayva Rescue](../05_operations/automation/vayva-rescue.md):

```typescript
// global-error.tsx pattern used across all apps
import { RescueOverlay } from "@/components/rescue/RescueOverlay";

export default function GlobalError({ error, reset }) {
  return <RescueOverlay error={error} reset={reset} />;
}
```

### Authentication

| Application | Auth Method | Provider |
|-------------|-------------|----------|
| Marketing | None (public) | - |
| Merchant Admin | JWT | Better Auth |
| Storefront | Session/Cookie | Better Auth |
| Ops Console | Session | Custom Ops Auth |
| Core API | JWT/Session | Better Auth + Custom |

### API Communication

```typescript
// Standard API client pattern
const api = {
  async get<T>(path: string): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },
  
  async post<T>(path: string, data: unknown): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return res.json();
  }
};
```

## Shared Resources

### Packages

| Package | Purpose | Location |
|---------|---------|----------|
| `@vayva/ui` | Shared UI components | `packages/ui/` |
| `@vayva/db` | Database client (Prisma) | `platform/infra/db/` |
| `@vayva/shared` | Shared utilities | `packages/shared/` |

### Integrations

All applications use common integrations:

- **Payments:** Paystack
- **Delivery:** Kwik
- **Messaging:** Evolution API (WhatsApp)
- **Email:** Resend
- **AI:** Groq, DeepSeek (external)
- **ML:** Local AI Agent (free, no API costs)

See [Integrations](../08_reference/integrations/) for details.

## Environment Variables

Each application has its own environment configuration. Common variables:

```bash
# Database
DATABASE_URL=postgresql://...

# Redis
REDIS_URL=redis://...

# Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=

# API
NEXT_PUBLIC_API_URL=https://api.vayva.ng

# Rescue System
GROQ_API_KEY_RESCUE=
OPS_RESCUE_ENABLE=true
```

See individual application docs for complete variable lists.

## Deployment

| Application | Platform | Domain |
|-------------|----------|--------|
| Marketing | Vercel | vayva.ng |
| Merchant Admin | Vercel | merchant.vayva.ng |
| Storefront | Vercel | *.vayva.ng |
| Ops Console | Vercel | ops.vayva.ng |
| Core API | Vercel | api.vayva.ng |
| Worker | VPS (systemd) | - |
| AI Agent | VPS (systemd) | 127.0.0.1:4000 |

See [Deployment Guide](../04_deployment/) for procedures.

## Monitoring

All applications are monitored via:

- **Vercel Analytics** - Performance metrics
- **Sentry** - Error tracking
- **Vayva Rescue** - Incident response
- **Custom Dashboards** - Business metrics

## Development

### Local Setup

1. Clone repository
2. Install dependencies: `pnpm install`
3. Set up environment variables
4. Run database migrations: `pnpm db:push`
5. Start development servers

See [Development Guide](../03_development/) for detailed setup.

### Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Type checking
pnpm typecheck
```

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| API connection failed | Check `NEXT_PUBLIC_API_URL` |
| Database error | Verify `DATABASE_URL` |
| Redis connection failed | Check `REDIS_URL` |
| Worker not processing | Check systemd status |
| Auth failures | Verify auth secrets |

See individual application docs for specific troubleshooting.

## Related Documentation

- [Architecture Overview](../02_engineering/architecture-overview.md)
- [Vayva Rescue](../05_operations/automation/vayva-rescue.md)
- [Deployment Guide](../04_deployment/)
- [Development Guide](../03_development/)

---

**Questions?** Check individual application docs or contact the platform team.
