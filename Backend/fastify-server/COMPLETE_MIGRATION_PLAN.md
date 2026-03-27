# 🚀 Complete API Migration Plan - 1,058 Routes

**Target**: Migrate ALL routes to `Backend/fastify-server`  
**Status**: IN PROGRESS  
**Started**: 2026-03-27

---

## 📊 MIGRATION SCOPE

| Source | Routes | Priority | Status |
|--------|--------|----------|--------|
| Backend/core-api | 825 routes (114 categories) | P0 | ⏳ In Progress |
| Frontend/ops-console | 155 routes | P1 | ⏳ Pending |
| Frontend/storefront | 59 routes | P1 | ⏳ Pending |
| apps/ | 19 routes | P2 | ⏳ Pending |
| **TOTAL** | **1,058 routes** | | |

---

## 🎯 MIGRATION PHASES

### ✅ Phase 1: Core Services (COMPLETE - 13 services)
- [x] Authentication
- [x] Inventory
- [x] Orders
- [x] Products
- [x] Customers
- [x] POS System
- [x] Rentals
- [x] Meal Kit
- [x] Fashion
- [x] Education

**Routes Migrated**: ~65 endpoints  
**Progress**: 6% complete

---

### ⏳ Phase 2: Commerce & Payments (NEXT - 8 services)
- [ ] Payments - Payment processing, webhooks, refunds
- [ ] Cart - Shopping cart management
- [ ] Checkout - Checkout flow
- [ ] Coupons - Discount codes and rules
- [ ] Collections - Product collections
- [ ] Bookings - Appointments and reservations
- [ ] Fulfillment - Order fulfillment
- [ ] Shipping - Shipping integration

**Estimated Routes**: ~80 endpoints  
**Estimated Time**: 3-4 days

---

### ⏳ Phase 3: Financial Services (10 services)
- [ ] Billing - Invoicing and billing
- [ ] Finance - Financial management
- [ ] Ledger - Accounting ledger
- [ ] Invoices - Invoice management
- [ ] Subscriptions - Subscription boxes
- [ ] Credits - Credit system
- [ ] Grants - Grant management
- [ ] Donations - Donation processing
- [ ] Payouts - Merchant payouts
- [ ] Settlements - Payment settlements

**Estimated Routes**: ~100 endpoints  
**Estimated Time**: 4-5 days

---

### ⏳ Phase 4: Industry Services Part 1 (15 services)
- [ ] Grocery - Grocery delivery
- [ ] Healthcare - Health services
- [ ] Beauty - Beauty services
- [ ] Events - Event management
- [ ] Campaigns - Marketing campaigns
- [ ] Creative - Creative agency
- [ ] Nonprofit - Nonprofit management
- [ ] Nightlife - Nightlife services
- [ ] Restaurant - Restaurant management
- [ ] Retail - Retail operations
- [ ] Wholesale - Wholesale management
- [ ] Kitchen - Kitchen management
- [ ] Menu Items - Restaurant menus
- [ ] Fashion (expand) - Additional features
- [ ] Education (expand) - Additional features

**Estimated Routes**: ~150 endpoints  
**Estimated Time**: 5-7 days

---

### ⏳ Phase 5: Platform Services (12 services)
- [ ] Dashboard - Dashboard data and widgets
- [ ] Analytics - Analytics and reporting
- [ ] Notifications - Notification system
- [ ] Marketing - Marketing tools
- [ ] Integrations - Third-party integrations
- [ ] Compliance - Compliance management
- [ ] KYC - Know Your Customer
- [ ] Disputes - Dispute resolution
- [ ] Appeals - Appeal process
- [ ] Legal - Legal documents
- [ ] Domains - Domain management
- [ ] Blog - Blog/content management

**Estimated Routes**: ~120 endpoints  
**Estimated Time**: 5-7 days

---

### ⏳ Phase 6: Infrastructure & Ops (15 services)
- [ ] Account - Account management
- [ ] Merchant - Merchant operations
- [ ] Onboarding - User onboarding
- [ ] AI - AI services
- [ ] AI-Agent - AI agent management
- [ ] Automation - Automation workflows
- [ ] Control-Center - Admin control center
- [ ] Designer - Design tools
- [ ] Jobs - Job board
- [ ] Leads - Lead generation
- [ ] Calendar-Sync - Calendar synchronization
- [ ] Internal - Internal tools
- [ ] Me - User profile
- [ ] Auth (expand) - MFA, sessions
- [ ] Security - Security features

**Estimated Routes**: ~150 endpoints  
**Estimated Time**: 5-7 days

---

### ⏳ Phase 7: Frontend Apps (3 sources)
- [ ] Frontend/ops-console - 155 admin routes
- [ ] Frontend/storefront - 59 storefront routes
- [ ] apps/ - 19 additional routes

**Estimated Routes**: 233 endpoints  
**Estimated Time**: 7-10 days

---

## 🔄 MIGRATION WORKFLOW

For each API category:

### Step 1: Analyze Existing Code
```bash
cd Backend/core-api/src/app/api/[category]
ls -la
cat route.ts  # Main route file
cat **/route.ts  # Nested routes
```

### Step 2: Extract Business Logic
- Identify all database operations
- Extract validation schemas
- Document API endpoints
- Note authentication requirements

### Step 3: Create Service Class
```typescript
// Backend/fastify-server/src/services/[category]/[service].service.ts
import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class [Category]Service {
  constructor(private readonly db = prisma) {}
  
  // Business logic methods
}
```

### Step 4: Create Fastify Routes
```typescript
// Backend/fastify-server/src/routes/api/v1/[category]/[service].routes.ts
import { FastifyPluginAsync } from 'fastify';
import { [Category]Service } from '../../../services/[category]/[service].service';

const service = new [Category]Service();

export const [category]Routes: FastifyPluginAsync = async (server) => {
  server.get('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      // Handler implementation
    },
  });
};
```

### Step 5: Register in Main Server
```typescript
// Backend/fastify-server/src/index.ts
await server.register([category]Routes, { prefix: '/api/v1/[category]' });
```

### Step 6: Test Endpoints
- Test with curl/Postman
- Verify authentication
- Check request/response formats
- Validate error handling

### Step 7: Update Documentation
- Add to API inventory
- Update progress tracker
- Document any breaking changes

---

## 📊 PROGRESS TRACKING

### Week 1 (Mar 27 - Apr 2)
- ✅ Phase 1 Core Services: 13 services, ~65 endpoints
- ⏳ Phase 2 Commerce: Starting

**Cumulative**: 6% complete

### Week 2 (Apr 3 - Apr 9)
- Target: Complete Phase 2 (Commerce & Payments)
- Target: Start Phase 3 (Financial)

**Target Cumulative**: 20% complete

### Week 3 (Apr 10 - Apr 16)
- Target: Complete Phase 3 (Financial)
- Target: Start Phase 4 (Industry Part 1)

**Target Cumulative**: 35% complete

### Week 4 (Apr 17 - Apr 23)
- Target: Complete Phase 4 (Industry Part 1)

**Target Cumulative**: 50% complete

### Week 5 (Apr 24 - Apr 30)
- Target: Complete Phase 5 (Platform)
- Target: Start Phase 6 (Infrastructure)

**Target Cumulative**: 70% complete

### Week 6 (May 1 - May 7)
- Target: Complete Phase 6 (Infrastructure)

**Target Cumulative**: 85% complete

### Week 7-8 (May 8 - May 21)
- Target: Complete Phase 7 (Frontend Apps)
- Target: Final testing and cleanup

**Target Cumulative**: 100% complete

---

## 🎯 CURRENT FOCUS - Phase 2

### Payments Service
**Source**: `Backend/core-api/src/app/api/payments/`
**Files to analyze**:
- route.ts (main payment routes)
- webhooks/route.ts
- refunds/route.ts
- transactions/route.ts

**Expected endpoints**:
- POST /payments/initialize
- POST /payments/verify
- POST /payments/webhook
- GET /payments/transactions
- POST /payments/refund

### Cart Service
**Source**: `Backend/core-api/src/app/api/carts/`
**Expected endpoints**:
- GET /carts
- POST /carts/items
- PUT /carts/items/:id
- DELETE /carts/items/:id
- POST /carts/checkout

---

## 📞 DEVELOPER NOTES

### Migration Tips
1. **Preserve existing behavior** - Don't change API contracts unless necessary
2. **Add proper validation** - Use Zod schemas for all inputs
3. **Include error handling** - Standard error responses
4. **Document thoroughly** - JSDoc comments on all methods
5. **Test as you go** - Don't batch testing until the end

### Common Patterns
```typescript
// Service pattern
export class Service {
  constructor(private readonly db = prisma) {}
  
  async getAll(storeId: string, filters: any) {
    return await this.db.model.findMany({ where: { storeId } });
  }
  
  async getById(id: string, storeId: string) {
    return await this.db.model.findFirst({ where: { id, storeId } });
  }
  
  async create(data: any) {
    return await this.db.model.create({ data });
  }
  
  async update(id: string, data: any) {
    return await this.db.model.update({ where: { id }, data });
  }
  
  async delete(id: string) {
    await this.db.model.delete({ where: { id } });
    return { success: true };
  }
}
```

---

## ✅ COMPLETED SO FAR

### Phase 1: Core Services ✅
1. **auth.service.ts** - Authentication & JWT
2. **inventory.service.ts** - Stock management (9 endpoints)
3. **orders.service.ts** - Order processing (8 endpoints)
4. **products.service.ts** - Product catalog (9 endpoints)
5. **customers.service.ts** - Customer management (8 endpoints)
6. **pos-sync.service.ts** - POS device sync (6 endpoints)
7. **cash-management.service.ts** - POS cash drawers
8. **rental.service.ts** - Rental bookings (6 endpoints)
9. **recipe.service.ts** - Meal kit recipes (4 endpoints)
10. **style-quiz.service.ts** - Fashion quizzes (4 endpoints)
11. **courses.service.ts** - Education courses (5 endpoints)

**Total**: 11 services created  
**Routes**: ~65 API endpoints  
**Files Created**: 22 (11 services + 11 routes)

---

**Last Updated**: 2026-03-27  
**Next Task**: Implement Payments Service  
**ETA Full Completion**: 8 weeks (May 21)
