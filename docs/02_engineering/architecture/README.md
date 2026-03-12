# System Architecture

**Owner:** Nyamsi Fredrick, Founder  
**Last Updated:** March 2026

---

## Overview

Vayva is built as a modern, scalable multi-tenant platform using a micro-frontend and service-oriented architecture. This document describes the high-level system design and component interactions.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Marketing   │  │   Merchant   │  │    Store     │  │     Ops      │    │
│  │    Site      │  │    Admin     │  │   (Public)   │  │   Console    │    │
│  │  (Next.js)   │  │   (Next.js)  │  │   (Next.js)  │  │   (Next.js)  │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                 │                 │                 │             │
│         └─────────────────┴─────────────────┴─────────────────┘             │
│                                    │                                        │
│                              Shared UI Package                              │
│                           (@vayva/ui components)                            │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                              API Gateway
                                     │
┌────────────────────────────────────┼────────────────────────────────────────┐
│                         SERVICE LAYER (Backend)                              │
├────────────────────────────────────┼────────────────────────────────────────┤
│                                    │                                        │
│  ┌─────────────────────────────────┼─────────────────────────────────────┐  │
│  │                           Core API (Fastify)                          │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │  │
│  │  │  Auth    │ │ Merchant │ │  Order   │ │ Product  │ │ Payment  │   │  │
│  │  │ Service  │ │ Service  │ │ Service  │ │ Service  │ │ Service  │   │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘   │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│  ┌─────────────────────────────────┼─────────────────────────────────────┐  │
│  │                          Worker (BullMQ)                              │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │  │
│  │  │  Email   │ │ WhatsApp │ │ Payment  │ │ Delivery │ │  Rescue  │   │  │
│  │  │  Queue   │ │  Queue   │ │  Queue   │ │  Queue   │ │  Queue   │   │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘   │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
┌────────────────────────────────────┼────────────────────────────────────────┐
│                         DATA & INFRASTRUCTURE LAYER                          │
├────────────────────────────────────┼────────────────────────────────────────┤
│                                    │                                        │
│  ┌─────────────────────────────────┼─────────────────────────────────────┐  │
│  │                        Database (PostgreSQL)                          │  │
│  │                     ┌────────────┴────────────┐                       │  │
│  │                     │      Prisma ORM         │                       │  │
│  │                     └─────────────────────────┘                       │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│  ┌─────────────────────────────────┼─────────────────────────────────────┐  │
│  │                          Cache (Redis)                                │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                 │  │
│  │  │ Sessions │ │  Cache   │ │  Queue   │ │ Real-time│                 │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘                 │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
┌────────────────────────────────────┼────────────────────────────────────────┐
│                         EXTERNAL INTEGRATIONS                                │
├────────────────────────────────────┼────────────────────────────────────────┤
│                                    │                                        │
│  ┌──────────┐  ┌──────────┐  ┌─────┴──────┐  ┌──────────┐  ┌──────────┐    │
│  │ Paystack │  │  Kwik    │  │ Evolution  │  │   Groq   │  │ YouVerify│    │
│  │ Payments │  │ Delivery │  │  WhatsApp  │  │    AI    │  │   KYC    │    │
│  └──────────┘  └──────────┘  └────────────┘  └──────────┘  └──────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Multi-App Structure

Vayva uses a monorepo with multiple Next.js applications:

```
Frontend/
├── marketing/          # Public marketing website
├── merchant-admin/     # Merchant dashboard
├── storefront/         # Customer-facing stores (multi-tenant)
└── ops-console/        # Internal operations platform
```

### Shared Packages

```
packages/
├── ui/                 # Shared UI components
├── shared/             # Shared utilities and types
├── api-client/         # API client library
├── db/                 # Database schema and client
├── schemas/            # Validation schemas
└── theme/              # Design system and tokens
```

### Key Frontend Technologies

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI + custom components
- **State Management:** Zustand
- **Forms:** React Hook Form + Zod
- **Animations:** Framer Motion

## Backend Architecture

### Core API (Fastify)

Located in `Backend/core-api/`

**Responsibilities:**
- REST API endpoints
- Authentication (Better Auth)
- Business logic
- Database access

**Key Services:**

| Service | Description |
|---------|-------------|
| Auth Service | User authentication, sessions, permissions |
| Merchant Service | Merchant management, onboarding |
| Product Service | Product catalog, inventory |
| Order Service | Order processing, lifecycle |
| Payment Service | Payment processing, webhooks |
| Customer Service | Customer management, CRM |
| Analytics Service | Reporting, insights |

### Worker (BullMQ)

Located in `Backend/worker/`

**Queue Types:**

| Queue | Purpose |
|-------|---------|
| `email` | Send transactional emails |
| `whatsapp` | Send WhatsApp messages |
| `payment` | Process payment webhooks |
| `delivery` | Track delivery status |
| `rescue` | Vayva Rescue automation |
| `notification` | Push notifications |

## Database Architecture

### PostgreSQL

Primary database for all persistent data.

**Schema Design:**
- Multi-tenant with `merchantId` isolation
- Prisma ORM for type-safe queries
- Migration-based schema management

### Redis

Used for:
- Session storage
- Caching
- Job queues (BullMQ)
- Real-time features

## External Integrations

### Payment: Paystack

- Card payments
- Bank transfers
- USSD
- Mobile money

### Delivery: Kwik Delivery

- Same-day delivery
- Real-time tracking
- Proof of delivery

### Communication: Evolution API

- WhatsApp Business integration
- AI-powered conversations
- Automated responses

### AI: Groq

- LLM for order capture
- Intent classification
- Response generation

### KYC: YouVerify

- Identity verification
- Business verification
- Compliance checks

## Deployment Architecture

### Production

```
┌─────────────────────────────────────────┐
│              Vercel Edge                │
│         (Frontend Applications)         │
└─────────────────────────────────────────┘
                   │
┌─────────────────────────────────────────┐
│              VPS (Hetzner)              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │ Core API │ │  Worker  │ │Evolution ││
│  │          │ │          │ │  WhatsApp││
│  └──────────┘ └──────────┘ └──────────┘│
└─────────────────────────────────────────┘
                   │
┌─────────────────────────────────────────┐
│         Neon PostgreSQL                 │
│         Upstash Redis                   │
└─────────────────────────────────────────┘
```

### Environments

| Environment | URL | Purpose |
|-------------|-----|---------|
| Production | vayva.ng | Live customer traffic |
| Staging | staging.vayva.ng | Pre-production testing |
| Local | localhost | Development |

## Security Architecture

### Authentication

- Better Auth for session management
- JWT tokens for API access
- OAuth for third-party integrations

### Authorization

- Role-based access control (RBAC)
- Permission-based actions
- Resource-level access checks

### Data Protection

- Encryption at rest (database)
- Encryption in transit (TLS)
- PII redaction in logs
- Secure secret management

## Scalability

### Horizontal Scaling

- Stateless API servers
- Queue-based job processing
- Database read replicas
- CDN for static assets

### Performance Optimizations

- Redis caching
- Database indexing
- Image optimization
- Code splitting

## Monitoring

### Tools

- Vercel Analytics (frontend)
- Logtail (logging)
- Custom health checks

### Key Metrics

- API response times
- Error rates
- Queue depths
- Database performance

---

**Questions?** Contact engineering@vayva.ng
