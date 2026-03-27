# Architecture Decision Record: Frontend-Backend Separation

**ADR-001** | **Date**: 2026-03-27  
**Status**: ✅ Approved & In Progress  
**Driver**: @fredrick  
**Contributors**: Development Team

---

## Context

### Problem Statement

The Vayva platform had architectural issues where frontend packages were directly importing `@vayva/db` and using PrismaClient to access the database. This violated separation of concerns and created several problems:

1. **Security Risk**: Frontend code running on Vercel had direct database access patterns
2. **Tight Coupling**: Frontend and backend couldn't be deployed independently
3. **Code Quality**: Mixed concerns made testing, maintenance, and scaling difficult
4. **Deployment Constraints**: Every database change required full-stack deployment

### Current State (BEFORE)

```
Frontend (Next.js on Vercel)
├── Direct @vayva/db imports ❌
├── PrismaClient usage ❌
└── Database queries in components ❌

Backend (VPS)
├── Some API endpoints
└── Shared database access with frontend
```

### Desired State (AFTER)

```
Frontend (Next.js on Vercel)
├── ZERO database imports ✅
├── API calls only via apiJson() ✅
└── Pure presentation layer ✅

Backend (Fastify on VPS)
├── All database operations ✅
├── RESTful API endpoints ✅
└── Business logic services ✅
```

---

## Decision

We will implement a **complete architectural separation** with these principles:

### 1. Backend Service Layer (Fastify)

**Technology Choice**: Fastify v4.x

**Rationale**:
- 2x faster than Express in benchmarks
- Built-in TypeScript support
- Plugin architecture for modularity
- Schema-based validation (OpenAPI compatible)
- Lower memory footprint
- Better performance under load

**Location**: `Backend/core-api/src/`

**Structure**:
```
Backend/core-api/src/
├── server-fastify.ts          # Fastify bootstrap
├── config/
│   └── fastify.ts             # Configuration
├── routes/
│   ├── health.routes.ts       # Health checks
│   └── api.v1.routes.ts       # API v1 aggregator
│       └── auth/auth.routes.ts
│       └── store/store.routes.ts (future)
│       └── dashboard/dashboard.routes.ts (future)
├── services/
│   ├── onboarding.service.ts  # Onboarding business logic
│   └── dashboard.service.ts   # Dashboard aggregation
└── lib/
    └── logger.ts              # Structured logging
```

### 2. Frontend API Client Layer

**Technology Choice**: Existing `@vayva/api-client` package

**Rationale**:
- Already well-architected
- Type-safe API calls
- Timeout handling built-in
- Error handling with proper types
- No need to reinvent the wheel

**Usage Pattern**:
```typescript
// Frontend API Route Handler
import { apiJson } from '@/lib/api-client-shared';
import { buildBackendAuthHeaders } from '@/lib/backend-proxy';

export async function GET(request: NextRequest) {
  const auth = await buildBackendAuthHeaders(request);
  return apiJson(`${process.env.BACKEND_API_URL}/api/v1/endpoint`, {
    headers: auth.headers,
  });
}
```

### 3. Package Ownership Rules

#### ❌ FRONTEND Packages (PROHIBITED)

**Packages**:
- `Frontend/merchant/`
- `Frontend/storefront/`
- `Frontend/ops-console/`
- `Frontend/marketing/`
- `packages/industry-*/` (non-service files)

**Prohibited Imports**:
```typescript
// ❌ NOT ALLOWED
import { prisma } from "@vayva/db";
import { PrismaClient } from "@vayva/db";
import prisma from "@vayva/db";
```

**Allowed Imports**:
```typescript
// ✅ ALLOWED
import { apiJson } from "@/lib/api-client-shared";
import { ApiClient } from "@vayva/api-client";
import type { Recipe } from "@vayva/industry-meal-kit/types"; // Types only
```

#### ✅ BACKEND Packages (ONLY PLACE FOR @vayva/db)

**Packages**:
- `Backend/core-api/`
- `Backend/worker/`
- `Backend/workflow/`
- `packages/db/` (exports PrismaClient)
- `packages/industry-*/src/services/` (business logic only)

**Pattern**:
```typescript
// Backend service - OK to use Prisma
import { prisma } from '@vayva/db';

export class MenuService {
  async getMenuItems(storeId: string) {
    return prisma.menuItem.findMany({ /* ... */ });
  }
}
```

### 4. Migration Strategy

**Approach**: Gradual migration with parallel operation

**Phases**:

1. **Phase 1 - Foundation** (✅ COMPLETE)
   - Setup Fastify infrastructure
   - Create core services (onboarding, dashboard)
   - Build authentication APIs
   - Add ESLint enforcement

2. **Phase 2 - Industry Services** (IN PROGRESS)
   - Migrate meal-kit industry services
   - Migrate education industry services
   - Migrate creative industry services
   - Continue for all ~20 industries

3. **Phase 3 - Frontend Migration** (PENDING)
   - Migrate merchant dashboard DB calls
   - Migrate ops-console DB calls
   - Remove all @vayva/db from frontend

4. **Phase 4 - Testing & Hardening** (PENDING)
   - E2E tests for all endpoints
   - Contract tests between frontend/backend
   - Monitoring and alerting
   - Performance optimization

### 5. Deployment Architecture

**Production (VPS: 163.245.209.203)**:

```yaml
services:
  fastify-core-api:
    image: vayva/fastify-core-api:latest
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=...
      - JWT_SECRET=...
    replicas: 3
    
  nextjs-frontend:
    # Deployed to Vercel (not on VPS)
    
  nginx:
    # Reverse proxy
    # Routes /api/* to fastify-core-api
    # Routes /* to nextjs-frontend (Vercel)
```

**Development**:
```bash
# Terminal 1 - Fastify Backend
cd Backend/core-api
pnpm dev:fastify  # Port 3000

# Terminal 2 - Next.js Frontend
cd Frontend/merchant
pnpm dev  # Port 3001
```

---

## Consequences

### Positive

1. **Clear Separation of Concerns**
   - Frontend: Presentation, UX, client-side logic
   - Backend: Business logic, data access, security

2. **Independent Deployment**
   - Frontend can deploy to Vercel without touching backend
   - Backend can deploy to VPS without affecting frontend
   - Faster CI/CD pipelines

3. **Better Security**
   - Database credentials only in backend
   - API-level authentication and authorization
   - Rate limiting at backend gateway

4. **Improved Testing**
   - Backend services testable in isolation
   - Frontend components testable with mocked APIs
   - Contract tests ensure compatibility

5. **Scalability**
   - Backend can scale independently based on API load
   - Frontend scales separately based on user traffic
   - Different instance types for different workloads

### Challenges

1. **Migration Effort**
   - Requires updating 50+ files across the monorepo
   - Industry packages need careful refactoring
   - Temporary dual operation during transition

2. **Network Latency**
   - Frontend → Backend API calls add ~50ms
   - Mitigation: CDN caching, request batching, SWR

3. **Complexity**
   - Two separate applications to manage
   - Need for API versioning strategy
   - Additional monitoring requirements

4. **Learning Curve**
   - Team needs to learn Fastify framework
   - New patterns for API development
   - Updated development workflow

---

## Compliance

### Verification Methods

1. **ESLint Enforcement** (✅ IMPLEMENTED)
   ```json
   {
     "no-restricted-imports": ["error", {
       "patterns": [{
         "group": ["@vayva/db"],
         "message": "Frontend cannot import @vayva/db"
       }]
     }]
   }
   ```

2. **Pre-commit Hook** (TODO)
   ```bash
   # .husky/pre-commit
   if grep -r "from ['\"]@vayva/db['\"]" Frontend/; then
     echo "❌ Found @vayva/db in frontend!"
     exit 1
   fi
   ```

3. **CI/CD Checks** (TODO)
   - Run ESLint on all PRs
   - Fail if @vayva/db found in frontend packages
   - Run contract tests

4. **Architecture Tests** (TODO)
   ```typescript
   // tests/architecture/package-boundaries.test.ts
   describe('Package Boundaries', () => {
     it('frontend should not import @vayva/db', () => {
       // Verify via dependency graph analysis
     });
   });
   ```

---

## References

### Related Documents

1. **Implementation Plan**: `Frontend-Backend_Separation_Plan_1703419d.md`
2. **Status Tracking**: `FRONTEND_BACKEND_SEPARATION_STATUS.md`
3. **Quick Start**: `IMPLEMENTATION_SUMMARY.md`

### Technical References

1. **Fastify Documentation**: https://www.fastify.io/docs/latest/
2. **Fastify Best Practices**: https://www.fastify.io/docs/latest/Guides/Best-Practices/
3. **Node.js Microservices**: https://www.oreilly.com/library/view/building-microservices-with/9781491956298/

### Similar Implementations

1. **Shopify**: Separated frontend (React) from backend (Ruby/GraphQL)
2. **Vercel Commerce**: Next.js frontend + headless backend
3. **GitLab**: Gradual migration from monolith to microservices

---

## Appendix A: File Templates

### Backend Service Template

```typescript
// Backend/core-api/src/services/example.service.ts
import { prisma } from '@vayva/db';
import { logger } from '../lib/logger';

export class ExampleService {
  constructor(private readonly db = prisma) {}

  async exampleMethod(storeId: string, data: any) {
    try {
      logger.info('[ExampleService.exampleMethod]', { storeId, data });
      
      const result = await this.db.exampleModel.findMany({
        where: { storeId },
      });

      return result;
    } catch (error) {
      logger.error('[ExampleService.exampleMethod]', { storeId, error });
      throw error;
    }
  }
}
```

### Fastify Route Template

```typescript
// Backend/core-api/src/routes/api/v1/example/example.routes.ts
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ExampleService } from '../../../../services/example.service';

export async function exampleRoutes(server: FastifyInstance) {
  const service = new ExampleService();

  // GET /api/v1/example
  server.get('/', {
    preHandler: [server.authenticate],
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array' }
          }
        }
      }
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const storeId = (request.user as any).storeId;
      const result = await service.exampleMethod(storeId, {});
      return reply.send({ success: true, data: result });
    }
  });
}
```

### Frontend Proxy Template

```typescript
// Frontend/merchant/src/app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { buildBackendAuthHeaders } from '@/lib/backend-proxy';
import { apiJson } from '@/lib/api-client-shared';

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await apiJson<{
      success: boolean;
      data?: any[];
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/v1/example`, {
      headers: auth.headers,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
```

---

## Approval

**Approved By**: Development Team  
**Approval Date**: 2026-03-27  
**Review Date**: 2026-04-03 (1 week post-implementation)  
**Next Review**: 2026-04-27 (1 month post-implementation)

---

**This ADR is active and should be followed for all new development.**
