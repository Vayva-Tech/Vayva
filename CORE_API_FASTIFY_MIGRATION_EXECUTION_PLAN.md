# Core-API to Fastify Migration - Execution Plan

## 🎯 Objective
Complete migration of 5 remaining dashboard services from `Backend/core-api/src/services/` to `Backend/fastify-server/src/services/` and eliminate all dependencies on core-api.

**Target:** 100% Fastify-only backend architecture

---

## ✅ Current Status (As of Analysis)

### Already in Fastify-Server (75% Complete)
- 15 business logic services already migrated
- All critical services operational: payments, orders, inventory, compliance, growth
- Fastify-server has 120+ files with clean architecture

### Remaining to Migrate (25%)
From `Backend/core-api/src/services/`:

1. ✅ **dashboard.server.ts** (1,197 lines) - Main dashboard service
   - Status: Exists in fastify but imports from @vayva/core-api
   - Action: Replace delegation with full implementation
   
2. ✅ **dashboard-actions.ts** (66 lines) - Suggested actions engine
   - Status: Pure utility functions
   - Action: Extract to fastify utils or inline
   
3. ✅ **dashboard-alerts.ts** (80 lines) - Alert computation engine  
   - Status: Pure utility functions
   - Action: Extract to fastify utils or inline
   
4. ✅ **dashboard-industry.server.ts** (930 lines) - Industry-specific logic
   - Status: Not yet migrated
   - Action: Full migration required
   
5. ✅ **email-automation.ts** (411 lines) - Email automation
   - Status: Not yet migrated
   - Action: Full migration required

---

## 📋 Phase 1: Dashboard Services Migration

### Task 1.1: Migrate dashboard.server.ts

**Source:** `Backend/core-api/src/services/dashboard.server.ts` (1,197 lines)  
**Destination:** `Backend/fastify-server/src/services/platform/dashboard.service.ts` (enhanced)

#### Current Issues in Fastify Version:
```typescript
// ❌ CURRENT - Delegates to core-api
import { DashboardService as CoreDashboardService } from '@vayva/core-api';

async getAggregateData(storeId: string, range: 'today' | 'week' | 'month' = 'month') {
  const data = await CoreDashboardService.getAggregateData(prisma, storeId, range);
  return data;
}
```

#### Required Implementation:
Replace ALL delegations with direct implementation from core-api source.

**Key Functions to Implement:**
1. `getAggregateData()` - Main aggregation (lines 50-139)
2. `getKpis()` - KPI calculations (lines 141-476)
3. `getMetrics()` - Today's metrics (lines 478-498)
4. `getOverview()` - Status overview (lines 500-591)
5. `getTodosAlerts()` - Todos and alerts (lines 593-663)
6. `getRecentActivity()` - Activity feed (lines 665-744)
7. `getRecentOrders()` - Recent orders (lines 746-825)
8. `getRecentBookings()` - Recent bookings (lines 827-876)
9. `getInventoryAlerts()` - Low stock alerts (lines 878-920)
10. `getCustomerInsights()` - Customer analytics (lines 922-1043)
11. `getEarnings()` - Earnings breakdown (lines 1045-1090)
12. `getAnalyticsOverview()` - Analytics summary (lines 1095-1133)
13. `groupByDay()` - Chart data grouping (lines 1135-1155)
14. `getAnalyticsInsights()` - Business insights (lines 1157-1195)

**Implementation Steps:**
1. Copy each function from core-api source
2. Adapt TypeScript types to fastify conventions
3. Remove Next.js-specific imports (@/config/* → local imports)
4. Add JSDoc documentation to all functions
5. Ensure proper error handling with logger integration
6. Maintain cache mechanism already present

**Acceptance Criteria:**
- ✅ All 14 functions implemented with identical logic
- ✅ No imports from @vayva/core-api
- ✅ All TypeScript types properly defined
- ✅ Zero linter errors
- ✅ Proper industry configuration support

---

### Task 1.2: Migrate dashboard-actions.ts

**Source:** `Backend/core-api/src/services/dashboard-actions.ts` (66 lines)  
**Destination:** Inline in `dashboard.service.ts` or `@vayva/utils` package

#### Implementation:
This is a pure utility function that computes suggested actions based on business state.

```typescript
// From core-api - copy to fastify
export interface SuggestedAction {
  id: string;
  title: string;
  reason: string;
  severity: "critical" | "warning" | "info";
  href: string;
  icon: string;
}

export function computeSuggestedActions(
  definition: IndustryDashboardDefinition,
  state: BusinessStateForActions,
): SuggestedAction[] {
  // Implementation here
}
```

**Decision:** Inline into `dashboard.service.ts` as private methods since it's only used internally.

---

### Task 1.3: Migrate dashboard-alerts.ts

**Source:** `Backend/core-api/src/services/dashboard-alerts.ts` (80 lines)  
**Destination:** Inline in `dashboard.service.ts`

#### Implementation:
Pure utility for computing dashboard alerts from metric thresholds.

```typescript
export interface DashboardAlert {
  id: string;
  title: string;
  message: string;
  severity: "critical" | "warning" | "info";
  evidence?: { key: string; value: number };
}

export function computeDashboardAlerts(
  definition: IndustryDashboardDefinition,
  metrics: MetricValues,
): DashboardAlert[] {
  // Implementation here
}
```

**Decision:** Inline into `dashboard.service.ts` as private methods.

---

### Task 1.4: Migrate dashboard-industry.server.ts

**Source:** `Backend/core-api/src/services/dashboard-industry.server.ts` (930 lines)  
**Destination:** `Backend/fastify-server/src/services/industry/dashboard-industry.service.ts`

#### Key Functions to Extract:
1. `getIndustryOverview()` - Industry-specific metrics (lines 50-300)
2. `getNonprofitCampaignMetrics()` - Nonprofit campaigns (lines 302-400)
3. `getEventMetrics()` - Events/ticketing (lines 402-500)
4. `getRestaurantMetrics()` - Restaurant-specific (lines 502-600)
5. `getBeautyMetrics()` - Beauty salon metrics (lines 602-700)
6. `getHealthcareMetrics()` - Healthcare metrics (lines 702-800)
7. `getAutomotiveMetrics()` - Auto service metrics (lines 802-930)

**Implementation Strategy:**
- Create new file: `Backend/fastify-server/src/services/industry/dashboard-industry.service.ts`
- Copy each industry-specific method
- Adapt imports (remove Next.js dependencies)
- Add proper TypeScript typing
- Integrate with main dashboard service

---

### Task 1.5: Migrate email-automation.ts

**Source:** `Backend/core-api/src/services/email-automation.ts` (411 lines)  
**Destination:** `Backend/fastify-server/src/services/marketing/email-automation.service.ts`

#### Key Functions:
1. `sendClientReport()` - Weekly/monthly reports (lines 54-78)
2. `sendMilestoneNotification()` - Milestone alerts (lines 83-120)
3. `sendPaymentReminder()` - Invoice reminders (lines 122-180)
4. `sendBookingConfirmation()` - Booking confirmations (lines 182-240)
5. `sendOrderNotification()` - Order updates (lines 242-300)
6. `sendLowStockAlert()` - Inventory alerts (lines 302-350)
7. `sendWelcomeEmail()` - Onboarding welcome (lines 352-411)

**Dependencies:**
- Uses `resend` package for email delivery
- Requires `RESEND_API_KEY` environment variable
- Requires `EMAIL_FROM` environment variable

**Implementation:**
```typescript
import { Resend } from 'resend';
import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class EmailAutomationService {
  private resend: Resend;
  
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY || '');
  }
  
  async sendClientReport(clientEmail: string, data: ReportData) {
    // Implementation from core-api
  }
  
  // ... other methods
}
```

---

## 📋 Phase 2: Update Route Registrations

### Task 2.1: Update dashboard.routes.ts

**File:** `Backend/fastify-server/src/routes/api/v1/platform/dashboard.routes.ts`

Ensure all new endpoints are properly registered:

```typescript
import { registerDashboardRoutes } from './routes/api/v1/platform/dashboard.routes';

// In src/index.ts
await server.register(registerDashboardRoutes);
```

**Endpoints to Verify:**
- `GET /api/v1/dashboard/overview` - Aggregate data
- `GET /api/v1/dashboard/kpis` - KPIs only
- `GET /api/v1/dashboard/alerts` - Active alerts
- `GET /api/v1/dashboard/actions` - Suggested actions
- `GET /api/v1/dashboard/activity` - Recent activity
- `GET /api/v1/dashboard/inventory-alerts` - Low stock alerts
- `GET /api/v1/dashboard/customer-insights` - Customer analytics
- `GET /api/v1/dashboard/earnings` - Earnings breakdown
- `GET /api/v1/dashboard/analytics` - Analytics overview
- `GET /api/v1/dashboard/industry/:industrySlug` - Industry-specific data

---

## 📋 Phase 3: Local Testing Protocol

### Task 3.1: Start Fastify Server Locally

```bash
cd Backend/fastify-server
pnpm install  # Ensure all deps installed
pnpm dev      # Start on port 3001
```

**Verification Checklist:**
- [ ] Server starts without errors
- [ ] Port 3001 accessible
- [ ] Swagger docs available at `/documentation`
- [ ] No TypeScript compilation errors
- [ ] No missing dependency warnings

---

### Task 3.2: Test Each Endpoint

Create test script: `test-dashboard-migration.sh`

```bash
#!/bin/bash

BASE_URL="http://localhost:3001/api/v1"
AUTH_TOKEN="your-test-token"

echo "Testing Dashboard Endpoints..."

# Test 1: Overview
curl -X GET "$BASE_URL/dashboard/overview" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json"

# Test 2: KPIs
curl -X GET "$BASE_URL/dashboard/kpis" \
  -H "Authorization: Bearer $AUTH_TOKEN"

# Test 3: Alerts
curl -X GET "$BASE_URL/dashboard/alerts" \
  -H "Authorization: Bearer $AUTH_TOKEN"

# Continue for all endpoints...
```

**Expected Results:**
- All endpoints return 200 OK
- Response data matches core-api format exactly
- No console errors in server logs
- Response time < 500ms for all endpoints

---

### Task 3.3: Frontend Integration Test

**Steps:**
1. Update frontend env:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

2. Test critical user flows:
   - [ ] Dashboard loads with real data
   - [ ] Charts render correctly
   - [ ] Alerts display properly
   - [ ] Tasks module functional
   - [ ] Metrics update in real-time
   - [ ] Industry-specific dashboards work

3. Monitor browser console:
   - [ ] No 404 errors
   - [ ] No CORS issues
   - [ ] No authentication failures

---

## 📋 Phase 4: Delete Core-API Components

### Task 4.1: Delete Fastify Duplicates from core-api

**Files to Delete:**
```bash
cd Backend/core-api

# Entry points
rm src/fastify-index.ts
rm src/server-fastify.ts

# Config
rm src/config/fastify.ts

# Routes directory (Fastify-specific)
rm -rf src/routes/

# TypeScript config
rm tsconfig.fastify.json

# Build artifacts
rm -rf dist/
```

---

### Task 4.2: Clean package.json

**Edit:** `Backend/core-api/package.json`

**Remove Scripts:**
```json
{
  "scripts": {
    "dev:fastify": "...",        // ❌ REMOVE
    "build:fastify": "...",      // ❌ REMOVE
    "start:fastify": "...",      // ❌ REMOVE
    "dev:clean:fastify": "..."   // ❌ REMOVE
  }
}
```

**Remove Dependencies:**
```json
{
  "dependencies": {
    "fastify": "^4.x",                    // ❌ REMOVE
    "@fastify/cors": "^9.x",              // ❌ REMOVE
    "@fastify/jwt": "^8.x",               // ❌ REMOVE
    "@fastify/swagger": "^8.x",           // ❌ REMOVE
    "@fastify/type-provider-typebox": "^3.x" // ❌ REMOVE
  }
}
```

**Keep:**
- Next.js dependencies
- React dependencies
- Prisma client
- Services still needed temporarily (auth, onboarding)

---

### Task 4.3: Delete Migrated Services

After verification, delete from core-api:

```bash
cd Backend/core-api/src/services

# After successful migration verification
rm dashboard.server.ts
rm dashboard-actions.ts
rm dashboard-alerts.ts
rm dashboard-industry.server.ts
rm email-automation.ts
```

**Keep Temporarily:**
```bash
# Next.js dependencies (to be extracted later)
auth.ts
onboarding.client.ts
onboarding.server.ts
onboarding.service.ts
api.ts
payments.ts
```

---

## 📋 Phase 5: Final Verification

### Task 5.1: Verify Fastify Server Integrity

**Checklist:**
- [ ] All 20 business logic services present in fastify-server
- [ ] All routes registered in `src/index.ts`
- [ ] No import errors from @vayva/core-api
- [ ] TypeScript compiles without errors
- [ ] Server starts successfully
- [ ] All endpoints respond

**Commands:**
```bash
cd Backend/fastify-server
pnpm build       # Verify build succeeds
pnpm typecheck   # Verify no TS errors
pnpm dev         # Verify server starts
```

---

### Task 5.2: Verify Core-API Clean State

**Checklist:**
- [ ] Only Next.js-specific code remains
- [ ] No Fastify-related files
- [ ] package.json cleaned up
- [ ] No broken imports
- [ ] Next.js app still runs

**Command:**
```bash
cd Backend/core-api
pnpm dev  # Should start Next.js on port 3001
```

---

### Task 5.3: Update Documentation

**Files to Update:**

1. `README.md` - Update architecture diagram
2. `docs/07_applications/core-api/overview.md` - Mark as legacy
3. `BACKEND_ARCHITECTURE_EXPLAINED.md` - Update with final state
4. `API_DOCUMENTATION.md` - Point to fastify-server endpoints
5. `.env.example` - Update API URL references

---

## 📊 Success Metrics

### Technical Criteria:
- ✅ All 20 business logic services in fastify-server
- ✅ Zero functionality lost from core-api
- ✅ All API endpoints responding correctly
- ✅ No TypeScript errors
- ✅ Clean git history with proper commits

### Business Criteria:
- ✅ Dashboard analytics fully functional
- ✅ Email automation operational
- ✅ All 32 industry hubs working
- ✅ No data loss or corruption
- ✅ Performance equal or better than core-api

---

## ⚠️ Risk Mitigation

### Risk 1: Lost Functionality
**Mitigation:** 
- Keep core-api archived for 2 weeks as fallback
- Test every single endpoint locally before deleting
- Create comprehensive endpoint mapping

### Risk 2: Frontend Breakage
**Mitigation:**
- Update one app at a time
- Test merchant dashboard first (most critical)
- Have rollback plan ready

### Risk 3: Data Corruption
**Mitigation:**
- Use same Prisma client and database connection
- No schema changes during migration
- Test all write operations thoroughly

---

## 📅 Timeline

| Day | Phase | Activities |
|-----|-------|-----------|
| 1-2 | Phase 1 | Migrate 5 dashboard services |
| 3 | Phase 2 | Register routes, update configs |
| 4-6 | Phase 3 | Local testing and verification |
| 7 | Phase 4 | Delete core-api components |
| 8 | Phase 5 | Final verification and documentation |

**Total:** 8 days for complete migration

---

## 🎯 Expected Outcome

**After Migration Complete:**

```
Backend/
├── fastify-server/          ← SOLE BACKEND (Production Ready)
│   ├── src/
│   │   ├── routes/          ← All API routes (/api/v1/*)
│   │   ├── services/        ← All business logic (20+ services)
│   │   │   ├── platform/
│   │   │   │   ├── dashboard.service.ts (complete implementation)
│   │   │   │   ├── email-automation.service.ts
│   │   │   ├── industry/
│   │   │   │   └── dashboard-industry.service.ts
│   │   │   ├── core/
│   │   │   ├── financial/
│   │   │   ├── inventory/
│   │   │   ├── orders/
│   │   │   ├── promotions/
│   │   │   ├── pos/
│   │   │   ├── rentals/
│   │   │   ├── meal-kit/
│   │   │   ├── fashion/
│   │   │   ├── education/
│   │   │   ├── compliance/
│   │   │   ├── growth/
│   │   │   ├── admin/
│   │   │   ├── security/
│   │   │   └── ai/
│   │   ├── middleware/      ← Auth, rate limiting, etc.
│   │   └── index.ts         ← Main entry point
│   └── package.json
│
└── core-api/                ← Minimal Next.js BFF Only
    └── src/services/        ← Next.js-specific code only
        ├── auth.ts
        ├── onboarding.*.ts
        ├── api.ts
        └── payments.ts
```

**Benefits:**
- ✅ Single source of truth for backend
- ✅ Clean architecture (no duplicates)
- ✅ Easier maintenance (1 codebase vs 2)
- ✅ Better performance (dedicated Fastify server)
- ✅ Independent deployment (not tied to Vercel/Next.js)
- ✅ Cost savings at scale (no Vercel function timeouts)

---

## 🚀 Next Steps

1. **Approve this plan** - Review and confirm strategy
2. **Execute Phase 1** - Migrate 5 dashboard services
3. **Execute Phase 2** - Register routes
4. **Execute Phase 3** - Local testing
5. **Execute Phase 4** - Delete core-api components
6. **Execute Phase 5** - Final verification
7. **Deploy to staging** - Run parallel tests
8. **Production rollout** - 100% cutover to fastify-server

---

**Ready to begin execution upon approval.**
