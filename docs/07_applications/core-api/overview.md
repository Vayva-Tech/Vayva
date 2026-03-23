# Core API

> **Application:** `Backend/core-api`
> **Framework:** Next.js 16 API Routes (App Router)
> **Base URL:** `https://api.vayva.ng`

## Purpose

The Core API is Vayva's primary backend service. It handles all business logic, data persistence, authentication, payment processing, AI orchestration, and third-party integrations. Every frontend application (merchant dashboard, storefront, ops console) communicates with the Core API for data and operations.

## Architecture

### Framework

The Core API is built as a Next.js application using the App Router's API route handlers. Each route module exports HTTP method handlers (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) as named exports.

### Directory Structure

```
Backend/core-api/src/
  app/
    (dashboard)/          # Dashboard-related pages (settings, SEO)
    api/                  # API route handlers
      account/            # Account management
      ai/                 # AI agent endpoints
      ai-agent/           # AI agent configuration
      analytics/          # Analytics data
      auth/               # Authentication
      billing/            # Subscription & billing
      bookings/           # Booking system
      campaigns/          # Marketing campaigns
      carts/              # Shopping cart
      checkout/           # Checkout flow
      collections/        # Product collections
      compliance/         # Regulatory compliance
      coupons/            # Discount codes
      credits/            # AI credit system
      customers/          # Customer management
      dashboard/          # Dashboard data
      domains/            # Custom domain management
      events/             # Events vertical
      fashion/            # Fashion vertical
      finance/            # Financial operations
      fulfillment/        # Order fulfillment
      health/             # Health check endpoint
      healthcare/         # Healthcare vertical
      integrations/       # Third-party integrations
      inventory/          # Inventory management
      orders/             # Order management (assumed)
      payments/           # Payment processing
      products/           # Product CRUD (assumed)
      reports/            # Reporting
      restaurant/         # Restaurant vertical
      returns/            # Return processing
      reviews/            # Product reviews
      security/           # Security settings
      seller/             # Seller/merchant endpoints
      settings/           # Store settings
      settlements/        # Payment settlements
      store/              # Store configuration
      storefront/         # Storefront data API
      subscriptions/      # Subscription management
      support/            # Support tickets
      team/               # Team management
      templates/          # Store templates
      travel/             # Travel vertical
      uploads/            # File uploads
      v1/                 # Versioned API (dashboard, analytics, live)
      wa-agent/           # WhatsApp agent status
      webhooks/           # Webhook management
      whatsapp/           # WhatsApp integration
      ... and 20+ industry-specific modules
  middleware/             # Request middleware
  context/               # Request context utilities
  types/                 # TypeScript type definitions
  websocket/             # WebSocket server
  __tests__/             # Test files
```

## Key Modules

### Authentication (`/api/auth`)

- **Registration** -- New merchant signup with email, phone, and business details
- **Login** -- Email/password authentication returning JWT access + refresh tokens
- **Password reset** -- Forgot password flow via `/api/auth/forgot-password`
- **OTP verification** -- Phone number verification via `/api/account/otp/send` and `/api/account/otp/verify`
- **Session management** -- Token refresh and invalidation

### Products

- **CRUD operations** -- Create, read, update, and delete products with full variant support
- **Bulk operations** -- Import/export via CSV
- **Image management** -- Upload and manage product images via `/api/uploads`
- **Inventory** -- Stock level management with automatic decrement on order confirmation

### Orders

- **Order creation** -- Process new orders from storefront checkout or WhatsApp agent
- **Lifecycle management** -- Transition orders through statuses (pending, confirmed, processing, shipped, delivered)
- **Fulfillment** -- Coordinate with logistics providers for delivery
- **Returns and refunds** -- Process return requests and issue refunds via Paystack

### Customers (`/api/customers`)

- **Customer profiles** -- CRUD for customer records with contact info and addresses
- **Notes** -- Internal notes attached to customer profiles (`/api/customers/[id]/notes`)
- **Addresses** -- Multiple address management (`/api/customers/[id]/addresses`)
- **History** -- Purchase history and interaction timeline (`/api/customers/[id]/history`)
- **Insights** -- Aggregate customer analytics (`/api/customers/insights`)
- **Import/Export** -- Bulk customer data operations

### Billing (`/api/billing`, `/api/credits`, `/api/subscriptions`)

- **Subscription management** -- Create, upgrade, downgrade, and cancel subscriptions
- **Credit system** -- Track AI credit balances, deductions, and top-ups
- **Payment processing** -- Interface with Paystack for subscription payments
- **Invoice generation** -- Create and store billing invoices
- **Dunning** -- Handle failed payment retries (coordinated with the worker service)
- **Trial management** -- Free trial creation and expiry handling via `/api/trial`

### AI (`/api/ai`, `/api/ai-agent`, `/api/seller/ai`)

- **Agent profile** -- Configure AI agent personality, tone, and behavior (`/api/seller/ai/profile`)
- **WhatsApp settings** -- Manage WhatsApp Business connection (`/api/seller/ai/whatsapp-settings`)
- **Knowledge base** -- Upload and manage RAG documents (`/api/seller/ai/knowledge-base`)
- **WhatsApp agent status** -- Monitor connection status (`/api/wa-agent/status`)

### Payments (`/api/payments`, `/api/checkout`)

- **Paystack integration** -- Initialize transactions, verify payments, process refunds
- **Checkout flow** -- Multi-step checkout with cart validation, address collection, and payment
- **Settlements** -- Track payment settlements and disbursements (`/api/settlements`)
- **Wallet** -- Merchant wallet balance and transaction history (`/api/wallet`)
- **Disputes** -- Payment dispute management (`/api/disputes`)

### WhatsApp (`/api/whatsapp`, `/api/wa-agent`)

- **Evolution API integration** -- Connect and manage WhatsApp Business sessions
- **Message handling** -- Receive inbound messages and send outbound responses
- **Agent status** -- Real-time connection status monitoring
- **QR code generation** -- Generate QR codes for WhatsApp session authentication

### Store (`/api/store`, `/api/storefront`, `/api/settings`)

- **Store profile** -- Business name, description, category, and operating hours
- **Domain management** -- Custom domain configuration and DNS verification (`/api/domains`)
- **SEO settings** -- Store-level SEO configuration
- **Templates** -- Store template selection and customization

### Analytics (`/api/analytics`, `/api/v1/analytics`)

- **Revenue reporting** -- Sales data aggregation with time-range filtering
- **Cohort analysis** -- Customer retention cohorts
- **A/B tests** -- Experiment management and results
- **ROAS** -- Return on ad spend calculations
- **Predictive analytics** -- AI-powered sales forecasting (`/api/v1/analytics/predictive`)
- **NPS** -- Net Promoter Score tracking (`/api/v1/analytics/nps`)
- **Industry dashboards** -- Vertical-specific metrics (`/api/v1/dashboard/[industry]`)

### Team (`/api/team`)

- **Member management** -- Invite, update, and remove team members
- **Role assignment** -- Assign owner, admin, or staff roles
- **Permission enforcement** -- Role-based access control on all API endpoints

## API Design Patterns

### Route Convention

All API routes follow the Next.js App Router convention:

```typescript
// Backend/core-api/src/app/api/customers/route.ts
export async function GET(request: Request) { /* list customers */ }
export async function POST(request: Request) { /* create customer */ }

// Backend/core-api/src/app/api/customers/[id]/route.ts
export async function GET(request: Request, { params }: { params: { id: string } }) { /* get customer */ }
export async function PATCH(request: Request, { params }: { params: { id: string } }) { /* update customer */ }
export async function DELETE(request: Request, { params }: { params: { id: string } }) { /* delete customer */ }
```

### Request Validation

- **Zod schemas** -- Request bodies and query parameters are validated using Zod schemas from `@vayva/schemas`
- **Type safety** -- Validated inputs are fully typed throughout the handler

### Response Format

Consistent JSON response structure across all endpoints:

```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 150
  }
}
```

Error responses:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Product title is required",
    "details": [ ... ]
  }
}
```

### Pagination

List endpoints support cursor-based or offset pagination:

- `?page=1&pageSize=20` -- Offset pagination
- `?cursor=abc123&limit=20` -- Cursor pagination for large datasets

## Authentication Flow

```
Client sends POST /api/auth/login with { email, password }
  --> Server validates credentials against database
  --> Server generates JWT access token (short-lived, ~15 min)
  --> Server generates refresh token (long-lived, ~7 days)
  --> Server returns { accessToken, refreshToken }

Subsequent requests:
  --> Client includes Authorization: Bearer <accessToken>
  --> Middleware validates token and extracts user/store context
  --> Handler executes with authenticated context

Token refresh:
  --> Client sends POST /api/auth/refresh with { refreshToken }
  --> Server validates refresh token
  --> Server issues new access + refresh token pair
  --> Old refresh token is invalidated
```

### Multi-Tenant Context

After authentication, the request context includes:

- **userId** -- The authenticated user's ID
- **storeId** -- The store the user is currently operating on
- **role** -- The user's role within the store (owner, admin, staff)

All data queries are automatically scoped to the authenticated store to enforce tenant isolation.

## Rate Limiting

The Core API implements rate limiting at the middleware level:

### Implementation

Two rate limiter implementations are available:

- **In-memory rate limiter** (`middleware/rate-limiter.ts`) -- Token bucket algorithm for development and single-instance deployments
- **Redis rate limiter** (`middleware/rate-limiter-redis.ts`) -- Distributed rate limiting for production multi-instance deployments

### Limits

| Endpoint Category | Rate Limit |
|-------------------|------------|
| Authentication | 10 requests / minute |
| General API | 100 requests / minute |
| File uploads | 20 requests / minute |
| Webhooks | 500 requests / minute |
| Health check | Unlimited |

### CDN Caching

The `middleware/cdn-caching.ts` middleware sets appropriate `Cache-Control` headers for static and semi-static content:

- **Storefront data** -- Cached at the edge with revalidation
- **Product images** -- Long-term cache with immutable content hashing
- **API responses** -- No-cache for authenticated endpoints, short cache for public data

## Error Handling

### Error Categories

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request body or parameters |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication token |
| `FORBIDDEN` | 403 | Insufficient permissions for the requested action |
| `NOT_FOUND` | 404 | Resource does not exist or is not accessible |
| `CONFLICT` | 409 | Resource state conflict (e.g., duplicate email) |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

### Error Reporting

- **Structured logging** -- All errors are logged with request ID, user context, and stack trace
- **Error tracking** -- Production errors are reported to the monitoring system
- **Request IDs** -- Every request receives a unique ID for tracing through logs

## WebSocket

The Core API includes a WebSocket server (`src/websocket/`) for real-time features:

- **Order notifications** -- Instant alerts when new orders arrive
- **AI conversation updates** -- Real-time conversation status changes
- **Dashboard live data** -- Live updating dashboard metrics via `/api/v1/live`

## Database

- **ORM** -- Prisma (`@vayva/db`) with PostgreSQL
- **Schema** -- Centralized in the `packages/prisma` package
- **Migrations** -- Managed via Prisma Migrate
- **Connection pooling** -- PgBouncer for production deployments
