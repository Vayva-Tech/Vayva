# Core-API to Fastify Migration - Phase 2 Plan

## 🎯 Phase 1 Status: COMPLETE ✅

**Completed Services (4/4 Dashboard):**
- ✅ dashboard.server.ts
- ✅ dashboard-actions.ts
- ✅ dashboard-alerts.ts
- ✅ dashboard-industry.server.ts

**Migration Progress: 80% Complete** (16/20 business logic services)

---

## 📊 Remaining Services Analysis

### Core-API Services Still Present (19 files/directories)

```
Backend/core-api/src/services/
├── DeletionService.ts          ← Already migrated to fastify-server
├── api.ts                       ← Next.js BFF utilities (KEEP temporarily)
├── auth.ts                      ← Next.js auth helpers (KEEP temporarily)
├── discount.service.ts          ← Already migrated (promotions/)
├── education/                   ← Industry-specific (verify migration)
├── email-automation.ts          ← Already migrated (communication/)
├── fashion/                     ← Industry-specific (verify migration)
├── inventory/                   ← Already migrated (inventory/)
├── inventory.service.ts         ← Already migrated (inventory/)
├── kyc.ts                       ← ⚠️ NEEDS MIGRATION (6.0KB)
├── meal-kit/                    ← Industry-specific (verify migration)
├── onboarding.client.ts         ← Next.js SSR (KEEP for now)
├── onboarding.server.ts         ← Next.js SSR (KEEP for now)
├── onboarding.service.ts        ← Next.js SSR (KEEP for now)
├── ops/                         ← Internal ops tools (verify)
├── order-state.service.ts       ← Already migrated (orders/)
├── payments.ts                  ← ⚠️ NEEDS MIGRATION (2.0KB)
├── paystack-webhook.ts          ← Already migrated (financial/)
├── pos/                         ← Already migrated (pos/)
├── product-core.service.ts      ← ⚠️ NEEDS MIGRATION (8.5KB)
├── referral.service.ts          ← ⚠️ NEEDS MIGRATION (4.8KB)
├── rentals/                     ← Industry-specific (verify migration)
├── security/                    ← Already migrated (security/)
├── subscriptions/               ← Already migrated (subscriptions/)
└── whatsapp/                    ← Communication (verify migration)
```

---

## 🎯 Phase 2 Priority Services

### P0 - Critical Business Logic (4 services)

| Service | Size | Priority | Reason |
|---------|------|----------|--------|
| `kyc.ts` | 6.0KB | **P0** | Compliance requirement, payment limits |
| `product-core.service.ts` | 8.5KB | **P0** | Core product management logic |
| `referral.service.ts` | 4.8KB | **P1** | Revenue-generating affiliate program |
| `payments.ts` | 2.0KB | **P1** | Payment processing utilities |

**Total Phase 2 Migration:** ~21.3KB of business logic

---

## 🏗️ Keep in Core-API (Temporary)

### Next.js-Specific Code (Not Migrating Yet)

| Service | Reason | Future Action |
|---------|--------|---------------|
| `auth.ts` | Next.js authentication helpers, SSR dependencies | Extract when separating BFF layer |
| `onboarding.*.ts` | Server-side rendering, template rendering | Migrate when onboarding flow refactored |
| `api.ts` | Next.js API utilities | Replace with fastify-server calls |

**These will be addressed in Phase 3 (BFF Layer Separation)**

---

## 📋 Phase 2 Execution Plan

### Task 2.1: Migrate KYC Service
**Source:** `Backend/core-api/src/services/kyc.ts`  
**Destination:** `Backend/fastify-server/src/services/compliance/kyc.service.ts` (enhanced)

**Steps:**
1. Read and analyze current KYC service functions
2. Create enhanced KYC service class with proper dependency injection
3. Implement KYC submission, verification, and status management
4. Add compliance reporting and admin review workflows
5. Create corresponding API routes
6. Test KYC flows end-to-end

**Acceptance Criteria:**
- ✅ All KYC operations functional (submit, verify, approve, reject)
- ✅ KYC levels and limits properly enforced
- ✅ Admin review workflow operational
- ✅ Encryption for sensitive data (NIN, BVN, CAC)
- ✅ Full audit trail maintained

---

### Task 2.2: Migrate Product Core Service
**Source:** `Backend/core-api/src/services/product-core.service.ts`  
**Destination:** `Backend/fastify-server/src/services/commerce/product-core.service.ts`

**Steps:**
1. Analyze product CRUD operations
2. Create product service class with validation
3. Implement product variants, inventory sync
4. Add bulk operations and import/export
5. Create API routes for product management
6. Test with frontend product pages

**Acceptance Criteria:**
- ✅ Product CRUD fully functional
- ✅ Variant management working
- ✅ Inventory synchronization operational
- ✅ Bulk operations supported
- ✅ Image upload and management working

---

### Task 2.3: Migrate Referral Service
**Source:** `Backend/core-api/src/services/referral.service.ts`  
**Destination:** `Backend/fastify-server/src/services/marketing/referral.service.ts`

**Steps:**
1. Extract referral code generation logic
2. Create referral tracking service
3. Implement reward calculation and distribution
4. Add affiliate dashboard and analytics
5. Create API routes for referral management
6. Test referral flows and payouts

**Acceptance Criteria:**
- ✅ Referral code generation working
- ✅ Referral tracking accurate
- ✅ Reward calculation correct
- ✅ Affiliate dashboard displays stats
- ✅ Payout integration functional

---

### Task 2.4: Migrate Payments Utilities
**Source:** `Backend/core-api/src/services/payments.ts`  
**Destination:** `Backend/fastify-server/src/services/financial/payment-utils.service.ts`

**Steps:**
1. Extract payment helper functions
2. Create payment utility service
3. Integrate with existing payment processing
4. Add transaction logging and reconciliation
5. Test payment flows

**Acceptance Criteria:**
- ✅ Payment utilities functional
- ✅ Transaction logging working
- ✅ Reconciliation accurate

---

## 🔌 New API Routes to Create

### KYC Routes
```typescript
POST   /api/v1/kyc/submit           - Submit KYC information
GET    /api/v1/kyc/status           - Get KYC status and level
GET    /api/v1/kyc/records          - Admin: View all submissions
POST   /api/v1/kyc/:id/approve      - Approve KYC submission
POST   /api/v1/kyc/:id/reject       - Reject KYC submission
PUT    /api/v1/kyc/:id/update       - Update KYC information
```

### Product Routes
```typescript
GET    /api/v1/products             - List products (with filters)
POST   /api/v1/products             - Create product
GET    /api/v1/products/:id         - Get product details
PUT    /api/v1/products/:id         - Update product
DELETE /api/v1/products/:id         - Delete product
POST   /api/v1/products/bulk        - Bulk create/update
POST   /api/v1/products/import      - Import from CSV
GET    /api/v1/products/:id/variants - Get variants
POST   /api/v1/products/:id/variants - Create variant
```

### Referral Routes
```typescript
GET    /api/v1/referrals/code       - Get referral code
GET    /api/v1/referrals/stats      - Get affiliate statistics
GET    /api/v1/referrals/referees   - List referred stores
GET    /api/v1/referrals/rewards    - Calculate pending rewards
POST   /api/v1/referrals/payout     - Request reward payout
```

### Payment Utils Routes
```typescript
GET    /api/v1/payments/transaction/:id - Get transaction details
POST   /api/v1/payments/reconcile   - Reconcile transactions
GET    /api/v1/payments/history     - Payment history
```

---

## 🧪 Testing Strategy

### Unit Tests
- Test each service method independently
- Mock Prisma client for isolated testing
- Cover edge cases and error scenarios

### Integration Tests
- Test API endpoints with actual database
- Verify authentication and authorization
- Test complete user workflows

### Frontend Integration
- Verify product pages still work
- Test KYC submission flow
- Check referral dashboard displays correctly
- Validate payment flows

---

## 📅 Timeline

| Day | Tasks | Deliverables |
|-----|-------|--------------|
| 1 | Migrate KYC service + routes | KYC API functional |
| 2 | Migrate Product Core service + routes | Product API functional |
| 3 | Migrate Referral service + routes | Referral API functional |
| 4 | Migrate Payments utils + routes | Payment utilities working |
| 5 | Testing and bug fixes | All tests passing |
| 6 | Documentation and cleanup | Phase 2 complete |

**Estimated Total Time:** 6 days (can compress to 4 with parallel work)

---

## ✅ Success Criteria

### Technical Criteria
- ✅ All 4 services migrated to fastify-server
- ✅ Zero functionality lost from core-api
- ✅ Enhanced architecture (class-based, DI, JSDoc)
- ✅ Full TypeScript type safety
- ✅ Proper error handling and logging
- ✅ Routes registered and accessible
- ✅ No broken imports in core-api

### Business Criteria
- ✅ KYC compliance operational
- ✅ Product management fully functional
- ✅ Referral program working
- ✅ Payment processing stable
- ✅ Performance equal or better than core-api

### Code Quality Criteria
- ✅ Comprehensive documentation created
- ✅ Clear API endpoint specifications
- ✅ Testing checklist provided
- ✅ Architecture improvements documented
- ✅ Migration reports generated

---

## 🚀 Expected Outcome After Phase 2

**Migration Progress: 95% Complete** (20/21 business logic services)

**Remaining in Core-API:**
- Next.js-specific code only (auth, onboarding, BFF utilities)
- Ready for Phase 3: BFF Layer Separation

**Fastify-Server Capabilities:**
- ✅ Complete e-commerce platform
- ✅ Full payment processing
- ✅ KYC compliance system
- ✅ Affiliate/referral program
- ✅ Advanced analytics
- ✅ Multi-industry support (32 verticals)
- ✅ Production-ready backend

---

## 📞 Reference Files

### Previous Migration Examples
- `/DASHBOARD_SERVICES_MIGRATION_COMPLETE.md` - Phase 1 completion report
- `/CORE_API_TO_FASTIFY_EXECUTION_SUMMARY.md` - Execution summary
- `/MIGRATION_QUICK_REFERENCE.md` - Quick commands

### Existing Service Patterns
- `Backend/fastify-server/src/services/platform/dashboard-industry.service.ts`
- `Backend/fastify-server/src/services/financial/paystack.service.ts`
- `Backend/fastify-server/src/services/inventory/inventory.service.ts`

---

## ⚠️ Risk Mitigation

### Risk 1: Lost Functionality
**Mitigation:** Create comprehensive function mapping before deletion, test every operation locally

### Risk 2: Frontend Breakage
**Mitigation:** Update one service at a time, test frontend after each migration, have rollback plan ready

### Risk 3: Data Corruption
**Mitigation:** Use same Prisma client and database connection, no schema changes during migration

---

## 🎯 Next Steps After Approval

Once you approve this Phase 2 plan:
1. Start with Task 2.1 (migrate KYC service)
2. Proceed sequentially through all tasks
3. Provide status updates after each service
4. Flag any issues encountered immediately

**Ready to begin Phase 2?**

---

*Generated: Saturday, March 28, 2026*  
*Phase 1 Status: Complete ✅*  
*Phase 2: Ready to Start*
