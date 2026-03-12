# Core API Documentation

**Application:** Core API  
**Owner:** Nyamsi Fredrick, Founder  
**Last Updated:** March 2026  
**Framework:** Next.js 15 (API Routes) + TypeScript  
**Base URL:** `https://api.vayva.ng`

---

## Overview

The Core API is the central business logic layer for the Vayva platform. It provides RESTful endpoints for all frontend applications (Merchant Admin, Ops Console, Marketing, Storefront) and handles all database operations, integrations, and business rules.

## Architecture

```
Backend/core-api/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes
│   │   │   ├── merchant/       # Merchant-facing endpoints
│   │   │   │   ├── me/         # Current merchant
│   │   │   │   ├── orders/     # Order management
│   │   │   │   ├── products/   # Product catalog
│   │   │   │   ├── customers/  # Customer management
│   │   │   │   ├── analytics/  # Business analytics
│   │   │   │   └── finance/    # Financial operations
│   │   │   ├── ops/            # Ops console endpoints
│   │   │   │   ├── merchants/  # Merchant management
│   │   │   │   ├── orders/     # Platform orders
│   │   │   │   ├── users/      # User management
│   │   │   │   ├── rescue/     # Rescue system
│   │   │   │   └── webhooks/   # Webhook management
│   │   │   ├── storefront/     # Storefront endpoints
│   │   │   ├── payments/       # Payment processing
│   │   │   ├── webhooks/       # Webhook receivers
│   │   │   └── health/         # Health checks
│   │   ├── layout.tsx          # Root layout
│   │   ├── error.tsx           # Error boundary
│   │   └── global-error.tsx    # Global error handler
│   ├── lib/                    # Utilities and services
│   │   ├── rescue/             # Rescue service
│   │   ├── logger.ts           # Logging
│   │   └── prisma.ts           # Database client
│   └── types/                  # TypeScript definitions
├── package.json
└── tsconfig.json
```

## API Structure

### Merchant API (`/api/merchant/*`)

Authentication: JWT (Better Auth)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/merchant/me` | GET | Get current merchant profile |
| `/api/merchant/me` | PATCH | Update merchant profile |
| `/api/merchant/orders` | GET | List merchant orders |
| `/api/merchant/orders` | POST | Create order |
| `/api/merchant/orders/:id` | GET | Get order details |
| `/api/merchant/orders/:id` | PATCH | Update order |
| `/api/merchant/products` | GET | List products |
| `/api/merchant/products` | POST | Create product |
| `/api/merchant/products/:id` | GET | Get product |
| `/api/merchant/products/:id` | PATCH | Update product |
| `/api/merchant/products/:id` | DELETE | Delete product |
| `/api/merchant/customers` | GET | List customers |
| `/api/merchant/customers/:id` | GET | Get customer |
| `/api/merchant/analytics` | GET | Get analytics |
| `/api/merchant/finance` | GET | Get financial data |

### Ops API (`/api/ops/*`)

Authentication: Ops Session

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ops/merchants` | GET | List all merchants |
| `/api/ops/merchants/:id` | GET | Get merchant details |
| `/api/ops/merchants/:id` | PATCH | Update merchant |
| `/api/ops/orders` | GET | List platform orders |
| `/api/ops/users` | GET | List ops users |
| `/api/ops/users/:id` | PATCH | Update user |
| `/api/ops/rescue/incidents` | GET | List incidents |
| `/api/ops/rescue/runbooks` | POST | Execute runbook |
| `/api/ops/webhooks` | GET | List webhook events |
| `/api/ops/webhooks/:id/replay` | POST | Replay webhook |

### Storefront API (`/api/storefront/*`)

Authentication: Public (with optional session)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/storefront/:storeSlug` | GET | Get store info |
| `/api/storefront/:storeSlug/products` | GET | List store products |
| `/api/storefront/:storeSlug/products/:id` | GET | Get product |
| `/api/storefront/:storeSlug/cart` | GET | Get cart |
| `/api/storefront/:storeSlug/cart` | POST | Update cart |
| `/api/storefront/:storeSlug/checkout` | POST | Initiate checkout |

### Payment API (`/api/payments/*`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/payments/initialize` | POST | Initialize payment |
| `/api/payments/verify` | POST | Verify payment |
| `/api/payments/refund` | POST | Process refund |

### Webhook Receivers (`/api/webhooks/*`)

| Endpoint | Method | Source | Description |
|----------|--------|--------|-------------|
| `/api/webhooks/paystack` | POST | Paystack | Payment events |
| `/api/webhooks/kwik` | POST | Kwik | Delivery updates |
| `/api/webhooks/evolution` | POST | Evolution | WhatsApp messages |

## Key Services

### Order Service

**Responsibilities:**
- Order creation and lifecycle
- Status transitions
- Inventory management
- Notification triggers

**Order Lifecycle:**
```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
   ↓          ↓            ↓           ↓          ↓
CANCELLED  ON_HOLD    AWAITING    IN_TRANSIT  COMPLETED
```

### Product Service

**Responsibilities:**
- CRUD operations
- Inventory tracking
- Variant management
- Catalog sync (WhatsApp)

### Customer Service

**Responsibilities:**
- Customer profiles
- Purchase history
- WhatsApp integration
- Segmentation

### Payment Service

**Responsibilities:**
- Paystack integration
- Payment initialization
- Webhook handling
- Refund processing

**Payment Flow:**
1. Client requests payment initialization
2. API creates transaction record
3. Paystack API called
4. Authorization URL returned
5. Customer completes payment
6. Paystack webhook received
7. Order status updated

### Analytics Service

**Responsibilities:**
- KPI calculations
- Report generation
- Data aggregation
- Trend analysis

### Rescue Service

**Responsibilities:**
- Incident creation
- AI diagnosis coordination
- Runbook execution
- Audit logging

See [Vayva Rescue](../../05_operations/automation/vayva-rescue.md) for details.

## Database Integration

**ORM:** Prisma

**Client:** `@vayva/db`

**Key Models:**
- `Merchant` - Store/business data
- `Order` - Order records
- `Product` - Product catalog
- `Customer` - Customer profiles
- `Transaction` - Payment records
- `WebhookEvent` - Webhook delivery log
- `RescueIncident` - Incident records
- `OpsUser` - Operations users

## Integrations

### Paystack (Payments)

**Features:**
- Payment initialization
- Transaction verification
- Refund processing
- Webhook handling

**Configuration:**
```bash
PAYSTACK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_PAYSTACK_KEY=pk_test_...
```

### Kwik (Delivery)

**Features:**
- Delivery quotes
- Order creation
- Tracking updates
- Webhook handling

**Configuration:**
```bash
KWIK_BASE_URL=
KWIK_EMAIL=
KWIK_PASSWORD=
KWIK_DOMAIN_NAME=
```

### Evolution API (WhatsApp)

**Features:**
- Message sending
- Webhook reception
- Template messages
- Media handling

**Configuration:**
```bash
EVOLUTION_API_URL=
EVOLUTION_API_KEY=
EVOLUTION_INSTANCE_NAME=
```

### Resend (Email)

**Features:**
- Transactional emails
- Marketing emails
- Template rendering

**Configuration:**
```bash
RESEND_API_KEY=
RESEND_FROM_EMAIL=
```

## Error Handling

**Global Error Handler:** `global-error.tsx`

**Rescue System Integration:**
```typescript
import { RescueOverlay } from "@/components/rescue/RescueOverlay";

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <RescueOverlay error={error} reset={reset} />
      </body>
    </html>
  );
}
```

**Error Response Format:**
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {},
  "requestId": "uuid"
}
```

## Authentication

### Merchant Auth (Better Auth)

**Flow:**
1. Login credentials submitted
2. Better Auth validates
3. JWT token issued
4. Token included in `Authorization: Bearer <token>` header
5. Middleware validates token
6. `merchantId` available in request context

### Ops Auth (Custom)

**Flow:**
1. Login credentials submitted
2. Password validated against bcrypt hash
3. Session created in `OpsSession` table
4. Session cookie set
5. Middleware validates session
6. `opsUserId` available in request context

## Rate Limiting

**Implementation:** Custom middleware

**Limits:**
- Public endpoints: 100 req/min
- Authenticated: 1000 req/min
- Webhooks: 500 req/min

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...

# Redis
REDIS_URL=redis://...

# Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
OPS_AUTH_SECRET=

# Payments
PAYSTACK_SECRET_KEY=

# Delivery
KWIK_BASE_URL=
KWIK_EMAIL=
KWIK_PASSWORD=

# WhatsApp
EVOLUTION_API_URL=
EVOLUTION_API_KEY=

# Email
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# AI
GROQ_API_KEY=
GROQ_API_KEY_RESCUE=

# Internal
INTERNAL_API_SECRET=
```

## Deployment

**Platform:** Vercel

**Domains:**
- Production: `api.vayva.ng`
- Staging: `staging-api.vayva.ng`

**Regions:**
- Primary: Europe (close to VPS)
- Edge: Global CDN

## Health Checks

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-03-07T10:00:00Z",
  "checks": {
    "database": "ok",
    "redis": "ok",
    "paystack": "ok"
  }
}
```

## Monitoring

- Vercel Analytics
- Sentry error tracking
- Custom metrics
- Rescue system health

## API Versioning

Current version: **v1** (implicit)

Future versions will use URL prefix: `/api/v2/...`

## Related Documentation

- [Vayva Rescue](../../05_operations/automation/vayva-rescue.md)
- [Database Schema](../../02_engineering/data-model/)
- [Integrations](../../08_reference/integrations/)
- [Webhook Security](../../06_security_compliance/webhook-security.md)

---

**API Questions?** Check the [API Reference](../../08_reference/api-entrypoints.md) or contact backend team.
