# BFF Prisma Migration - Execution Plan

**Date:** March 27, 2026  
**Severity:** 🔴 CRITICAL - Security Risk  
**Scope:** 97 route files with direct Prisma access

---

## 📊 Problem Scale

### Discovery
- **316 instances** of `prisma.` usage
- **97 route files** need migration
- **All in ops-console** (admin/ops routes)
- Storefront: ✅ Clean (0 instances)

### Affected Routes by Category

#### High Priority - Core Operations (~25 files)
**Finance & Payments:**
- `/ops/payments/*` (5 files)
- `/ops/financials/*` (3 files)
- `/ops/refunds/*` (1 file)

**Security & Compliance:**
- `/ops/security/*` (4 files)
- `/ops/compliance/*` (1 file)
- `/ops/kyc/*` (2 files)
- `/ops/disputes/*` (4 files)

**Audit & Monitoring:**
- `/ops/audit/*` (5 files)
- `/ops/audit-logs/*` (1 file)

#### Medium Priority - Analytics (~15 files)
**Analytics:**
- `/ops/analytics/*` (4 files)
- `/ops/dashboard/stats/*` (1 file)
- `/revenue/*` (2 files)

**Growth & Marketing:**
- `/ops/growth/campaigns/*` (2 files)
- `/ops/marketing/analytics/*` (1 file)

#### Lower Priority - Misc (~57 files)
Various admin operations, alerts, communications, etc.

---

## 🎯 Migration Strategy

### Approach: Automated + Systematic

**Problem:** Manually migrating 97 files will take 20-30 hours  
**Solution:** Create reusable patterns + batch process

---

## Phase 1: Backend Service Creation (4-6 hours)

### Step 1.1: Audit Existing Services
Check which services already exist in Fastify:
```bash
ls Backend/fastify-server/src/services/platform/
ls Backend/fastify-server/src/services/admin/
ls Backend/fastify-server/src/services/financial/
ls Backend/fastify-server/src/services/security/
```

### Step 1.2: Create Missing Services
Priority order:
1. `audit-log.service.ts` - Platform
2. `kyc-ops.service.ts` - Compliance extension
3. `payment-ops.service.ts` - Financial extension
4. `security-ops.service.ts` - Security extension
5. `analytics-ops.service.ts` - Analytics extension
6. `feature-flags.service.ts` - Admin-system extension

### Step 1.3: Register All Routes
Create route files for each service in:
`Backend/fastify-server/src/routes/api/v1/`

---

## Phase 2: Frontend Migration Patterns (8-10 hours)

### Pattern 1: Simple Query Replacement

**Before:**
```typescript
const logs = await prisma.opsAuditEvent.findMany({
  where: { storeId },
  orderBy: { createdAt: 'desc' }
});
```

**After:**
```typescript
const response = await apiClient.get('/api/v1/platform/audit-logs', {
  storeId,
  orderBy: 'createdAt_desc'
});
return NextResponse.json(response.data);
```

### Pattern 2: Mutation Replacement

**Before:**
```typescript
const result = await prisma.paymentTransaction.update({
  where: { id },
  data: { status: 'RECONCILED' }
});
```

**After:**
```typescript
const response = await apiClient.post('/api/v1/financial/wallet-funding/reconcile', {
  transactionId: id,
  status: 'RECONCILED'
});
return NextResponse.json(response.data);
```

### Pattern 3: Complex Query with Relations

**Before:**
```typescript
const merchant = await prisma.store.findUnique({
  where: { id },
  include: {
    wallet: true,
    orders: { take: 10 },
    tenant: { include: { tenantMemberships: true } }
  }
});
```

**After:**
```typescript
const response = await apiClient.get(`/api/v1/admin/merchants/${id}/full`, {
  include: ['wallet', 'orders', 'tenant']
});
return NextResponse.json(response.data);
```

---

## Phase 3: Batch Migration Execution

### Batch 1: Finance & Payments (6 files) - 2 hours
Files:
- `/ops/payments/route.ts`
- `/ops/payments/wallet-funding/route.ts`
- `/ops/payments/wallet-funding/[id]/reconcile/route.ts`
- `/ops/payments/paystack-webhooks/route.ts`
- `/ops/payments/paystack-webhooks/[id]/reprocess/route.ts`
- `/ops/financials/payouts/route.ts`

Backend needed:
- Extend `payments.service.ts` with ops-specific methods
- Create `wallet-funding.routes.ts`

### Batch 2: Security & KYC (6 files) - 2 hours
Files:
- `/ops/security/sessions/route.ts`
- `/ops/security/sessions/[id]/revoke/route.ts`
- `/ops/security/logs/route.ts`
- `/ops/security/stats/route.ts`
- `/ops/kyc/route.ts`
- `/ops/kyc/assign/route.ts`

Backend needed:
- Extend `risk.service.ts` → rename to `security.service.ts`
- Extend `compliance.service.ts` with KYC ops

### Batch 3: Audit & Compliance (6 files) - 2 hours
Files:
- `/ops/audit-logs/route.ts`
- `/ops/audit/route.ts`
- `/ops/audit/[id]/route.ts`
- `/ops/audit/ledger/route.ts`
- `/ops/audit/aml/route.ts`
- `/ops/audit/overview/route.ts`

Backend needed:
- Create `audit-log.service.ts`
- Create `audit.routes.ts`

### Batch 4: Analytics & Dashboard (7 files) - 3 hours
Files:
- `/ops/analytics/comprehensive/route.ts`
- `/ops/analytics/platform/route.ts`
- `/ops/analytics/timeseries/route.ts`
- `/ops/analytics/csat/route.ts`
- `/ops/dashboard/stats/route.ts`
- `/revenue/historical/route.ts`
- `/revenue/summary/route.ts`

Backend needed:
- Extend `analytics.service.ts` with ops queries
- Create `revenue.routes.ts`

### Batch 5: Disputes & Refunds (5 files) - 2 hours
Files:
- `/ops/disputes/[id]/approve-refund/route.ts`
- `/ops/disputes/[id]/escalate/route.ts`
- `/ops/disputes/[id]/evidence/route.ts`
- `/ops/disputes/[id]/reject/route.ts`
- `/ops/refunds/route.ts`

Backend needed:
- Extend `refunds.service.ts` with ops operations
- Create `disputes.routes.ts`

### Batch 6: Merchants & Orders (10 files) - 4 hours
Files:
- `/ops/merchants/[id]/route.ts`
- `/ops/merchants/[id]/ai/route.ts`
- `/ops/merchants/[id]/wallet/lock/route.ts`
- `/ops/merchants/activity/route.ts`
- `/ops/merchants/batch/route.ts`
- `/ops/merchants/bulk/route.ts`
- `/ops/orders/route.ts`
- `/ops/orders/[id]/route.ts`
- Plus 2 more action routes

Backend needed:
- Extend `merchants.service.ts` with ops views
- Extend `orders.service.ts` with ops queries

### Batch 7: Remaining Routes (57 files) - 8-10 hours
Process systematically by category:
- Alerts, communications, compliance
- Config, deliveries, developers
- Growth, health, impersonate
- Industries, invitations, jobs
- Logistics, marketplace, notifications
- Onboarding, partners, rescue
- Risk, search, subscriptions
- Support, tools, users
- Webhooks

---

## Phase 4: Verification & Testing (2 hours)

### Step 4.1: Automated Checks
```bash
# Verify zero Prisma in frontend
grep -r "prisma\." Frontend/*/src/app/api --include="*.ts" | wc -l
# Expected: 0

# Verify zero @vayva/db imports in app code
grep -r "from '@vayva/db'" Frontend/*/src/app/api --include="*.ts" | wc -l
# Expected: 0
```

### Step 4.2: Test Critical Paths
- Payment operations
- Security session management
- KYC assignments
- Audit log queries
- Analytics dashboards

### Step 4.3: Integration Tests
Run existing test suite to ensure no regressions

---

## ⏱️ Total Time Estimate

| Phase | Hours | Notes |
|-------|-------|-------|
| Backend services | 4-6 | Create 6-8 new services |
| Batch 1-2 | 4 | Finance + Security |
| Batch 3-4 | 5 | Audit + Analytics |
| Batch 5-6 | 6 | Disputes + Merchants |
| Batch 7 | 8-10 | Remaining 57 files |
| Verification | 2 | Testing & checks |
| **TOTAL** | **29-33 hours** | ~4-5 full working days |

---

## 🚀 Acceleration Strategies

### Option 1: AI-Assisted Migration (Recommended)
Use AI to generate 80% of boilerplate:
- Generate backend service methods from Prisma queries
- Generate frontend API client calls
- Manual review for remaining 20%

**Time reduction:** 40-50% → **15-18 hours**

### Option 2: Parallel Processing
Split batches across multiple developers:
- Developer A: Finance + Security (4 hrs)
- Developer B: Audit + Analytics (5 hrs)
- Developer C: Merchants + Orders (6 hrs)
- Together: Remaining (4 hrs)

**Time reduction:** 60% → **12-15 hours**

### Option 3: Phased Rollout
Migrate in priority order over multiple sessions:
- Session 1: High priority (10 files, 4 hrs)
- Session 2: Medium priority (15 files, 6 hrs)
- Session 3: Lower priority (72 files, 12 hrs)

**Benefit:** Spread work, reduce risk

---

## 📋 Immediate Next Steps

### Right Now - Starting Batch 1 (Finance/Payments)

1. **Read all 6 payment-related route files** (15 min)
2. **Identify common patterns** (10 min)
3. **Extend payments.service.ts** with missing methods (30 min)
4. **Create wallet-funding.routes.ts** (20 min)
5. **Migrate first file as template** (30 min)
6. **Batch migrate remaining 5 files** (1 hour)
7. **Test payment flows** (15 min)

**Total for Batch 1:** ~2.5 hours

---

## 🎯 Success Metrics

- [ ] Zero `prisma.` in frontend app code
- [ ] Zero `@vayva/db` imports in routes
- [ ] All 97 routes migrated to API client
- [ ] All backend services created
- [ ] All routes registered in Fastify
- [ ] Tests passing
- [ ] Production deployment ready

---

## ⚠️ Risks & Mitigation

### Risk 1: Breaking Changes
**Mitigation:** Keep Prisma logic identical, only change data access layer

### Risk 2: Performance Regression
**Mitigation:** Add proper caching, pagination, query optimization

### Risk 3: Incomplete Migration
**Mitigation:** Automated checks, comprehensive testing

### Risk 4: Scope Creep
**Mitigation:** Stick to migration only, no refactoring unless critical

---

**Status:** Ready to begin Batch 1  
**Priority:** CRITICAL (security risk)  
**Recommendation:** Start with AI-assisted approach  

---

**File Location:** `/Users/fredrick/Documents/Vayva-Tech/vayva/BFF_PRISMA_MIGRATION_PLAN.md`
