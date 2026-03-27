# Frontend-Backend Separation - Implementation Status

**Last Updated**: Current Session
**Goal**: Complete architectural separation of Vayva platform into frontend-only (Vercel) and backend-only (VPS)

---

## ✅ COMPLETED WORK (Track 1 - Backend Foundation)

### Fastify Server Infrastructure - 100% COMPLETE

#### Files Created:

1. **`Backend/core-api/src/server-fastify.ts`**
   - Fastify server bootstrap with CORS, JWT authentication
   - Graceful shutdown handling
   - Authentication decorator

2. **`Backend/core-api/src/config/fastify.ts`**
   - Configuration for log level, allowed origins, port, host

3. **`Backend/core-api/src/routes/health.routes.ts`**
   - `/health` - Health check endpoint with database connectivity verification
   - `/ready` - Readiness probe for Kubernetes/load balancers

4. **`Backend/core-api/src/routes/api.v1.routes.ts`**
   - API v1 router aggregator
   - Ready to register all v1 endpoints

5. **`Backend/core-api/src/routes/api/v1/auth/auth.routes.ts`**
   - `POST /api/v1/auth/login` - User authentication
   - `GET /api/v1/auth/me` - Current user info (protected route)
   - Full Zod validation and OpenAPI schemas

6. **`Backend/core-api/src/lib/logger.ts`**
   - Pino structured logging configuration
   - ISO timestamps, formatted log levels

7. **`Backend/core-api/src/fastify-index.ts`**
   - Entry point for Fastify server
   - Startup script with error handling

8. **`Backend/core-api/tsconfig.fastify.json`**
   - TypeScript configuration for Fastify build
   - Excludes Next.js specific code

9. **`Backend/core-api/package.json`** (UPDATED)
   - Added Fastify dependencies:
     - `fastify@4.28.1`
     - `@fastify/cors@9.0.1`
     - `@fastify/jwt@8.0.1`
     - `@fastify/swagger@8.15.0`
     - `pino@9.4.0`
   - Added scripts:
     - `dev:fastify` - Development mode
     - `build:fastify` - Production build
     - `start:fastify` - Run production server
     - `test:e2e` - End-to-end tests

### Database Services - COMPLETE

1. **`Backend/core-api/src/services/onboarding.service.ts`**
   - Complete onboarding state management
   - Methods:
     - `getOnboardingState(storeId)` - Get full onboarding state
     - `updateOnboardingStep(storeId, step, data)` - Update specific step
     - `updateKycStatus(storeId, kycStatus)` - Update KYC status
     - `isOnboardingComplete(storeId)` - Check completion status
   - Extracted from `Frontend/merchant/src/lib/onboarding-sync.ts`

2. **`Backend/core-api/src/services/dashboard.service.ts`**
   - Dashboard metrics aggregation
   - Methods:
     - `getOverview(storeId, period)` - Overview metrics (revenue, orders, customers, growth)
     - `getRevenueChartData(storeId, period)` - Daily revenue chart data
     - `getRecentOrders(storeId, limit)` - Recent orders with customer info
     - `getTopProducts(storeId, limit)` - Top selling products

---

## 📋 REMAINING WORK

### Track 2: Industry Services Migration (2 developers)

#### Phase 2.1: Audit Results - PENDING

**Commands to run:**
```bash
# Find all @vayva/db imports in industry packages
grep -r "from ['\"]@vayva/db['\"]" packages/industry-*/src/ --include="*.ts" | grep -v "node_modules"

# Count violations per package
for pkg in packages/industry-*/; do 
  count=$(grep -r "from ['\"]@vayva/db['\"]" $pkg/src/ --include="*.ts" | wc -l)
  echo "$pkg: $count violations"
done
```

**Known Violations (from plan):**
- `@vayva/industry-meal-kit`: 5 files
- `@vayva/industry-education`: 5 files  
- `@vayva/industry-creative`: 4 files
- Other industries: ~15 more packages to audit

#### Phase 2.2: Migration Steps Per Industry

For EACH industry package with violations:

**Step A: Create Backend Service** (Example: meal-kit)
```typescript
// Backend/core-api/src/services/meal-kit/recipe.service.ts
import { prisma } from '@vayva/db';
import type { Recipe } from '@vayva/industry-meal-kit/types';

export class MealKitRecipeService {
  async calculateRecipeCost(recipeId: string) {
    // Implementation from plan
  }
}
```

**Step B: Create Fastify Route**
```typescript
// Backend/core-api/src/routes/api/v1/meal-kit/recipes.routes.ts
export async function mealKitRecipesRoute(server: FastifyInstance) {
  server.get('/', { handler: async () => {} });
}
```

**Step C: Remove Prisma from Industry Package**
```typescript
// packages/industry-meal-kit/src/services/recipe.service.ts (AFTER)
// ❌ REMOVE: import { PrismaClient } from '@vayva/db';
// ✅ Keep pure business logic only
```

**Step D: Update Frontend to Call API**
```typescript
// Frontend/merchant/src/app/api/meal-kit/recipes/route.ts (NEW)
import { apiJson } from '@/lib/api-client-shared';

export async function GET() {
  return apiJson(`${process.env.BACKEND_API_URL}/api/v1/meal-kit/recipes`);
}
```

---

### Track 3: Frontend API Client (1 developer)

#### Phase 3.1: Enhance @vayva/api-client - PENDING

**File to Create/Enhance:**
```typescript
// packages/api-client/src/index.ts
export class ApiClient {
  async get<T>(path: string): Promise<ApiResponse<T>>;
  async post<T>(path: string, data: unknown): Promise<ApiResponse<T>>;
  async put<T>(path: string, data: unknown): Promise<ApiResponse<T>>;
  async patch<T>(path: string, data: unknown): Promise<ApiResponse<T>>;
  async delete<T>(path: string): Promise<ApiResponse<T>>;
}
```

**Files to Update:**
- `Frontend/merchant/src/lib/api-client-shared.ts` - Enhanced typing
- `Frontend/merchant/src/lib/backend-proxy.ts` - Better auth headers
- `Frontend/storefront/src/lib/api-client-shared.ts` - Same enhancements
- `Frontend/ops-console/src/lib/api-client-shared.ts` - Same enhancements

#### Phase 3.2: Migrate Frontend DB Calls - PENDING

**Priority Order:**

**Week 1: Merchant Dashboard (HIGH PRIORITY)**
Files to migrate:
1. `Frontend/merchant/src/lib/onboarding-sync.ts` → Move to backend service
2. `Frontend/merchant/src/services/MenuService.ts`
3. `Frontend/merchant/src/services/referral.ts`
4. `Frontend/merchant/src/services/route-optimizer.ts`
5. `Frontend/merchant/src/services/recipe-cost.ts`

**Migration Pattern:**
```typescript
// BEFORE (Frontend/merchant/src/services/MenuService.ts)
import { PrismaClient } from "@vayva/db";

export class MenuService {
  private prisma = new PrismaClient();
  
  async getMenuItems(storeId: string) {
    return this.prisma.menuItem.findMany({ /* ... */ });
  }
}

// AFTER - Split into:

// 1. Backend service (Backend/core-api/src/services/menu.service.ts)
import { prisma } from '@vayva/db';

export class MenuService {
  async getMenuItems(storeId: string) {
    return prisma.menuItem.findMany({ /* ... */ });
  }
}

// 2. Frontend proxy (Frontend/merchant/src/app/api/menu/items/route.ts)
import { apiJson } from '@/lib/api-client-shared';

export async function GET(request: NextRequest) {
  const auth = await buildBackendAuthHeaders(request);
  return apiJson(`${process.env.BACKEND_API_URL}/api/v1/menu/items`, {
    headers: auth.headers,
  });
}
```

**Week 2: Ops Console (MEDIUM PRIORITY)**
Files to migrate:
- All 25+ API routes in `Frontend/ops-console/src/app/api/ops/`
- Each requires corresponding backend endpoint

---

### Track 4: Testing & Quality (1 developer)

#### Phase 4.1: Test Infrastructure - PENDING

**Files to Create:**

1. **E2E Tests**
```typescript
// Backend/core-api/src/__tests__/e2e/auth.test.ts
import { buildServer } from '../../server-fastify';

describe('Auth API E2E', () => {
  it('should return JWT token for valid credentials', async () => {
    const server = await buildServer();
    await server.ready();
    
    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'test@example.com', password: 'password123' },
    });
    
    expect(response.statusCode).toBe(200);
  });
});
```

2. **Contract Tests**
```typescript
// tests/contract/frontend-backend-contract.test.ts
describe('API Contract Tests', () => {
  it('login response should have expected shape', async () => {
    // Verify API response matches frontend expectations
  });
});
```

#### Phase 4.2: ESLint Enforcement - PENDING

**Files to Update:**

1. **`.eslintrc.json`** (root)
```json
{
  "overrides": [
    {
      "files": ["Frontend/**/*.ts", "Frontend/**/*.tsx"],
      "rules": {
        "no-restricted-imports": [
          "error",
          {
            "patterns": [
              {
                "group": ["@vayva/db"],
                "message": "❌ Frontend cannot import @vayva/db. Use API calls instead."
              }
            ]
          }
        ]
      }
    }
  ]
}
```

2. **`.husky/pre-commit`**
```bash
#!/bin/sh
set -e

# Check for forbidden imports in frontend
if grep -r "from ['\"]@vayva/db['\"]" Frontend/ --include="*.ts" --include="*.tsx"; then
  echo "❌ ERROR: Found @vayva/db imports in frontend!"
  exit 1
fi
```

#### Phase 4.3: Monitoring - PENDING

**Files to Create:**

1. **Metrics Plugin**
```typescript
// Backend/core-api/src/plugins/metrics.plugin.ts
import { StatsD } from 'node-statsd';

export async function metricsPlugin(server: FastifyInstance) {
  server.addHook('onResponse', (request, reply, done) => {
    const duration = Date.now() - (request as any).startTime;
    statsd.timing('request.duration', duration);
    done();
  });
}
```

2. **Request Logger**
```typescript
// Backend/core-api/src/plugins/request-logger.plugin.ts
export async function requestLogger(server: FastifyInstance) {
  server.addHook('onRequest', (request, reply, done) => {
    request.log.info({ method: request.method, url: request.url }, 'Request started');
    done();
  });
}
```

---

## 🚀 HOW TO RUN THE FASTIFY SERVER

### Development

```bash
cd Backend/core-api

# Install new dependencies
pnpm install

# Run Fastify dev server (watch mode)
pnpm dev:fastify

# Server will start on http://localhost:3000
```

### Test Endpoints

```bash
# Health check
curl http://localhost:3000/health

# Login (mock implementation)
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get current user (requires JWT token from login)
curl http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Production Build

```bash
# Build Fastify server
pnpm build:fastify

# Run production server
pnpm start:fastify
```

---

## 📊 PROGRESS SUMMARY

### Track 1: Backend Foundation - ✅ 100% COMPLETE
- [x] Fastify server structure
- [x] CORS & JWT configuration
- [x] Health check endpoints
- [x] Authentication APIs
- [x] Onboarding service
- [x] Dashboard service

### Track 2: Industry Services - ⏳ 0% STARTED
- [ ] Audit all industry packages
- [ ] Migrate meal-kit services
- [ ] Migrate education services
- [ ] Migrate creative services
- [ ] Migrate remaining industries

### Track 3: Frontend API Client - ⏳ 0% STARTED
- [ ] Enhance @vayva/api-client
- [ ] Migrate merchant DB calls
- [ ] Migrate ops-console DB calls
- [ ] Migrate storefront (if any)

### Track 4: Testing & Quality - ⏳ 0% STARTED
- [ ] E2E test infrastructure
- [ ] Contract tests
- [ ] ESLint enforcement
- [ ] Monitoring plugins

---

## 🎯 NEXT STEPS FOR TEAM

### For Developer 1 (Industry Services):
1. Run audit commands to find all `@vayva/db` imports in industry packages
2. Start with `@vayva/industry-meal-kit` (5 violations)
3. Follow migration pattern: Backend Service → Fastify Route → Remove Prisma → Update Frontend

### For Developer 2 (Industry Services):
1. Start with `@vayva/industry-education` (5 violations)
2. Then `@vayva/industry-creative` (4 violations)
3. Follow same migration pattern

### For Developer 3 (Frontend API Client):
1. Enhance `packages/api-client/src/index.ts` with ApiClient class
2. Update `Frontend/merchant/src/lib/backend-proxy.ts` with better auth headers
3. Start migrating merchant services (MenuService, referral.ts, etc.)

### For Developer 4 (Testing & Quality):
1. Create E2E test infrastructure
2. Write first contract tests for auth endpoints
3. Add ESLint rules to prevent regressions
4. Create monitoring plugins

---

## 📝 KEY ARCHITECTURE DECISIONS

1. **@vayva/db stays as-is** - Only backend services import it
2. **Fastify for backend** - Better performance, TypeScript support, plugin architecture
3. **Next.js remains frontend** - No changes to frontend framework
4. **API-first design** - All database operations via REST APIs
5. **Gradual migration** - Can run old and new systems in parallel during transition

---

## 🔗 RELATED DOCUMENTATION

- Full implementation plan: `/Users/fredrick/Library/Application Support/Qoder/SharedClientCache/cache/plans/Frontend-Backend_Separation_Plan_1703419d.md`
- Architecture diagram: See section 2 of plan document
- Migration checklist: See section 3.2 of plan document

---

**Questions? Reach out in `#frontend-backend-split` Slack channel**
