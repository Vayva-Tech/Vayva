# Vayva Platform 🚀

[![CI](https://github.com/Vayva-Tech/Vayva/actions/workflows/ci.yml/badge.svg)](https://github.com/Vayva-Tech/Vayva/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Multi-tenant e-commerce and commerce-operations platform** built for emerging markets, enabling merchants to launch, operate, and scale online businesses across web, mobile, and conversational channels with native payments, logistics, and AI-powered customer engagement.

---

## 🎯 Core Capabilities

### Multi-Tenant Commerce Engine
Secure, isolated merchant environments with shared infrastructure and centralized governance.

### Merchant Dashboard
Unified interface for product management, orders, customers, analytics, marketing campaigns, and payouts.

### AI-Powered WhatsApp Commerce
Conversational storefronts that handle customer inquiries, product discovery, and order placement directly on WhatsApp.

### Native Payments Integration
First-class integration with Paystack for cards, bank transfers, and local payment flows.

### Logistics & Fulfillment Automation
Order routing, delivery coordination, and fulfillment status tracking.

### Operations Console (Internal)
Administrative tools for onboarding merchants, auditing transactions, resolving disputes, and platform oversight.

### Append-Only Financial Ledger
Immutable transaction records designed for audits, reconciliation, and regulatory clarity.

---

## 🏗 System Architecture

Vayva is implemented as a **high-performance monorepo** using **TurboRepo**, optimized for independent scaling of applications and services while maintaining strong type safety and shared standards.

### Infrastructure Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │   Mobile    │  │ Merchant    │  │    Ops      │  │Marketing│ │
│  │ Application │  │   Admin     │  │  Console    │  │  Site   │ │
│  │   (React    │  │  Dashboard  │  │ (Internal)  │  │(Public) │ │
│  │  Native)    │  │             │  │             │  │         │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                    HTTPS/WSS │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY & SERVICES                        │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Vercel Edge                              │ │
│  │               (Frontend Applications)                       │ │
│  │               - Auto-scaling                                │ │
│  │               - Global CDN                                  │ │
│  │               - Edge functions                              │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                      VPS Infrastructure                     │ │
│  │  ┌──────────┐ ┌──────────┐ ┌────────────┐ ┌──────────────┐ │ │
│  │  │ Core API │ │  Worker  │ │ Evolution  │ │   Nginx      │ │ │
│  │  │ (Port    │ │ (BullMQ) │ │  WhatsApp  │ │ Proxy Manager│ │ │
│  │  │  3001)   │ │          │ │   (8080)   │ │   (80/443)   │ │ │
│  │  │ - Docker │ │ - Docker │ │ - Docker   │ │              │ │ │
│  │  │ - PM2    │ │ - Systemd│ │            │ │              │ │ │
│  │  └──────────┘ └──────────┘ └────────────┘ └──────────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Data Layer                               │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │ │
│  │  │   VPS 2      │  │    Redis     │  │     MinIO        │  │ │
│  │  │  PostgreSQL  │  │   (Cache)    │  │  (Object Store)  │  │ │
│  │  │   (5432)     │  │   (6379)     │  │   (9000/9001)    │  │ │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Repository Layout

#### `apps/`
End-user and internal applications:
- **`merchant-admin`** — Next.js merchant dashboard application
- **`ops-console`** — Internal admin and support tooling
- **`marketing`** — Public marketing website
- **`www`** — Main landing page
- **`worker`** — Background job processor

#### `Backend/`
Server-side applications and services:
- **`core-api`** — Central API layer (Next.js API routes)
- **`worker`** — Background job processing
- **`workflow`** — Business workflow engine

#### `Frontend/`
Client-side applications:
- **`merchant-admin`** — Merchant dashboard frontend
- **`ops-console`** — Operations console frontend
- **`marketing`** — Marketing site frontend
- **`storefront`** — Customer-facing storefront
- **`mobile`** — React Native mobile application

#### `packages/`
Shared foundations across the platform (72 industry packages):
- **`ui`** — Premium design system and components
- **`schemas`** — Shared Zod schemas for validation
- **`shared`** — Common utilities and types
- **`api-client`** — Typed API clients
- **`templates`** — Industry-specific template implementations
- **Industry packages** — 72 specialized industry implementations

#### `platform/`
Platform infrastructure and core services:
- **`infra/db`** — Database schema and Prisma configuration
- **`scripts`** — Deployment and operational scripts
- **`testing`** — End-to-end and integration tests

#### `templates/`
Industry-specific template implementations (72 templates):
- Fashion, Retail, Restaurant, Healthcare, Legal, Real Estate, Travel, Education, and more

---

## 🛠 Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.9+
- **Styling**: Tailwind CSS 4.2+
- **Components**: React 19 + Lucide Icons
- **State Management**: React Context API + SWR
- **Animations**: Framer Motion

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Next.js 15 API Routes
- **Database**: PostgreSQL 16 with Prisma ORM
- **Caching**: Redis 7
- **Queue Processing**: BullMQ
- **Object Storage**: MinIO

### Infrastructure
- **Hosting**: Vercel (Frontend) + Hetzner VPS (Backend)
- **Containerization**: Docker Compose
- **Process Management**: PM2/Systemd
- **Proxy**: Nginx Proxy Manager
- **Monitoring**: Sentry + Custom health checks

### Development Tools
- **Monorepo**: TurboRepo 2.8+
- **Package Manager**: pnpm 10.3+
- **Testing**: Playwright + Vitest
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 10
- Docker (for PostgreSQL and Redis)
- Git

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/Vayva-Tech/Vayva.git
cd Vayva

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
```

### Local Development

```bash
# Start all services in development mode
pnpm dev

# Individual service commands:
pnpm --filter merchant-admin dev    # Merchant dashboard
pnpm --filter core-api dev          # Backend API
pnpm --filter worker dev            # Background worker
```

### Database Setup

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Seed initial data (optional)
pnpm db:seed
```

### Running Tests

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# Unit tests
pnpm test

# End-to-end tests
pnpm test:e2e

# All validation checks
pnpm validate:ship
```

---

## ☁️ Production Deployment

### VPS Infrastructure

Vayva uses a two-server VPS architecture for optimal performance and security:

#### VPS 1 (App Server): 163.245.209.202
- Docker containers: Evolution API, Redis, MinIO, Nginx Proxy Manager
- System services: Worker process (BullMQ)
- Reverse proxy for all backend services

#### VPS 2 (Database Server): 163.245.209.203
- PostgreSQL 16 database
- Shared Redis instance
- Secured with firewall rules

### Deployment Process

```bash
# 1. Deploy database server
ssh root@163.245.209.203
./scripts/deploy/setup-db-server.sh 163.245.209.202

# 2. Deploy app server
ssh root@163.245.209.202
./scripts/deploy/setup-core-api.sh
./scripts/deploy/setup-worker.sh

# 3. Deploy frontend to Vercel
pnpm build
# Then deploy via Vercel dashboard or CLI
```

### Environment Configuration

Production environment variables are managed through:
- Vercel dashboard for frontend applications
- `/opt/vayva/` directory on VPS for backend services
- Docker secrets for containerized services

---

## 🧪 Quality Assurance

### Automated Testing

- **Unit Tests**: Component and service unit tests with Vitest
- **Integration Tests**: API and database integration tests
- **End-to-End Tests**: Full user journey testing with Playwright
- **Type Safety**: Strict TypeScript checking across all packages

### Code Quality

- **Linting**: ESLint with custom rules
- **Formatting**: Prettier for consistent code style
- **Dead Code Detection**: Knip for unused code identification
- **Security Scanning**: Automated dependency vulnerability checks

### CI/CD Pipeline

GitHub Actions workflows handle:
- Code quality checks on every PR
- Automated testing and type checking
- Security scanning and dependency updates
- Performance monitoring and bundle analysis

---

## 📚 Documentation

### Development Guides
- [Getting Started Guide](docs/00_start-here/README.md)
- [Development Workflows](docs/03_development/workflows/README.md)
- [Testing Guidelines](docs/03_development/testing/README.md)

### Architecture
- [System Architecture](docs/02_engineering/architecture-overview.md)
- [API Design Principles](docs/02_engineering/api-design/README.md)
- [Data Model Documentation](docs/02_engineering/data-model/README.md)

### Deployment
- [VPS Deployment Guide](docs/04_deployment/README.md)
- [Infrastructure Setup](docs/infrastructure-setup-guide.md)
- [Production Runbooks](docs/04_deployment/procedures/README.md)

### Industry Templates
- [Template Gallery](template-gallery/)
- [Industry Package Documentation](docs/01_product/features/template-gallery.md)

---

## 🤝 Contributing

We welcome contributions from the community! Please see our [Contributing Guidelines](docs/CONTRIBUTING.md) for details on:

- Code style and conventions
- Pull request process
- Issue reporting
- Development workflow

### Branch Strategy
- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - New features
- `fix/*` - Bug fixes
- `hotfix/*` - Critical production fixes

---

## 🔐 Security

Vayva takes security seriously. Please review our [Security Policy](SECURITY.md) for:

- Reporting security vulnerabilities
- Security practices and guidelines
- Dependency security management
- Data protection measures

---

## 📞 Support

For questions, issues, or support:

- **Documentation**: Check our comprehensive docs in `/docs/`
- **Issues**: [GitHub Issues](https://github.com/Vayva-Tech/Vayva/issues)
- **Community**: Join our developer community
- **Contact**: security@vayva.ng for security concerns

---

## 📈 Roadmap

### Current Focus (Phase 6)
- **Architecture Cleanup**: Component consolidation and code hygiene
- **Performance Optimization**: Bundle size reduction and loading improvements
- **Security Compliance**: Enhanced security measures and audit preparation

### Upcoming Features
- **Enhanced AI Capabilities**: Advanced conversational commerce features
- **Marketplace Expansion**: Centralized merchant discovery
- **Mobile App**: Native iOS/Android applications
- **Advanced Analytics**: Cross-channel attribution and insights

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Vayva is designed as long-term commerce infrastructure for emerging markets—modular, auditable, and automation-first.**

Built with ❤️ for African entrepreneurs and businesses.