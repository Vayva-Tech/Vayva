# Backend API Migration Status & Remaining Work Plan

**Generated:** 2026-03-27  
**Target:** Complete Fastify backend restructuring before VPS deployment

---

## Executive Summary

### Current Progress ✅
- **40 services migrated** to clean Fastify architecture
- **~327 endpoints** restructured and operational
- **100% coverage** of core commerce, checkout, financial, and major industry verticals
- **Clean separation:** Frontend (Vercel) → Backend (Fastify on VPS)

### Remaining Scope 📊
- **~525 legacy routes** in Backend/core-api/src/app/api (824 total - 327 migrated = ~497 remaining)
- **154 routes** in Frontend/ops-console (BFF layer - needs extraction)
- **55 routes** in Frontend/storefront (BFF layer - needs extraction)
- **19 routes** in apps/ directory
- **Total remaining:** ~725 routes to migrate/restructure

---

## Current Fastify Structure ✅

```
Backend/fastify-server/src/
├── services/
│   ├── auth.ts
│   ├── inventory.ts
│   ├── subscriptions.ts
│   ├── security.ts
│   ├── commerce/          # cart, checkout
│   ├── core/              # account, billing, customers, orders, products, settings
│   ├── education/         # courses
│   ├── fashion/           # style-quiz
│   ├── financial/         # payments, wallet
│   ├── industry/          # beauty, events, grocery, healthcare, nightlife, restaurant, retail, wholesale
│   ├── meal-kit/          # recipes
│   ├── platform/          # analytics, blog, campaigns, compliance, creative, dashboard, domains, integrations, marketing, notifications, nonprofit
│   ├── pos/
│   └── rentals/
└── routes/api/v1/
    ├── auth/
    ├── commerce/
    ├── core/
    ├── education/
    ├── fashion/
    ├── financial/
    ├── industry/
    ├── inventory/
    ├── meal-kit/
    ├── platform/
    ├── pos/
    └── rentals/
```

### Registered Routes in index.ts (40 services)
✅ Auth, Inventory, Orders, Products, Customers  
✅ Cart, Checkout  
✅ Payments, Wallet  
✅ POS, Rentals, Meal Kit, Fashion, Education  
✅ Restaurant, Grocery, Healthcare, Beauty, Events, Nightlife, Retail, Wholesale  
✅ Campaigns, Creative, Nonprofit, Dashboard, Analytics, Notifications  
✅ Marketing, Integrations, Compliance, Domains, Blog  
✅ Account, Billing, Settings, Subscriptions  

---

## Remaining API Categories to Migrate

### Priority 1: Critical Business Functions 🔴
Directories with high-traffic or business-critical APIs:

1. **bookings/** - Appointment/scheduling systems
2. **calendar-sync/** - Calendar integrations
3. **fulfillment/** - Order fulfillment logic
4. **invoices/** - Invoice generation
5. **ledger/** - Financial ledger
6. **refunds/** - Refund processing
7. **returns/** - Return management
8. **settlements/** - Merchant settlements
9. **telemetry/** - System monitoring
10. **workflows/** - Business process automation

### Priority 2: Customer-Facing Features 🟡
11. **collections/** - Product collections
12. **coupons/** - Coupon management
13. **credits/** - Store credit system
14. **discount-rules/** - Dynamic pricing
15. **grants/** - Grant management (partially done in nonprofit)
16. **leads/** - Lead generation
17. **loyalty/** - Loyalty programs (partially in retail)
18. **menu-items/** - Restaurant menus
19. **portfolio/** - Portfolio management
20. **properties/** - Property listings
21. **quotes/** - Price quotes
22. **referrals/** - Referral tracking
23. **reviews/** - Product reviews
24. **services/** - Service catalog
25. **templates/** - Email/document templates

### Priority 3: Specialized Industry Verticals 🟢
26. **ai/** - AI services
27. **ai-agent/** - AI agent orchestration
28. **automation/** - Marketing automation
29. **box-subscriptions/** - Subscription boxes
30. **control-center/** - Admin controls
31. **designer/** - Design tools
32. **kitchen/** - Kitchen management
33. **kyc/** - KYC verification (partially in compliance)
34. **legal/** - Legal case management (partially in compliance)
35. **onboarding/** - Merchant onboarding
36. **performance/** - Performance analytics
37. **professional/** - Professional services
38. **professional-services/** - Consulting
39. **projects/** - Project management
40. **realestate/** - Real estate APIs
41. **rescue/** - Emergency operations
42. **resources/** - Resource management
43. **saas/** - SaaS management
44. **seller/** - Seller tools
45. **sites/** - Multi-site management
46. **socials/** - Social media integration
47. **storage/** - File storage
48. **support/** - Customer support
49. **travel/** - Travel booking
50. **vehicles/** - Vehicle management
51. **wa-agent/** - WhatsApp agent
52. **wellness/** - Wellness services
53. **whatsapp/** - WhatsApp Business

### Priority 4: Infrastructure & System ⚪
54. **appeals/** - Dispute appeals (partially in compliance)
55. **disputes/** - Dispute management (partially in compliance)
56. **domains/** - Domain management (DONE)
57. **internal/** - Internal tools
58. **me/** - User profile endpoints
59. **merchant/** - Merchant management
60. **payment-methods/** - Payment storage
61. **paymenttransaction/** - Transaction processing
62. **security/** - Security policies (DONE)
63. **system/** - System configurations
64. **uploads/** - File upload handling
65. **v1/** - Legacy v1 endpoints
66. **webhooks/** - Webhook management (partially in integrations)
67. **websocket/** - WebSocket handlers
68. **webstudio/** - Web builder

### Already Completed ✅
- ~~account~~ → DONE (in core/account)
- ~~analytics~~ → DONE (in platform/analytics)
- ~~auth~~ → DONE
- ~~beauty~~ → DONE
- ~~billing~~ → DONE (in core/billing)
- ~~blog~~ → DONE (in platform/blog)
- ~~campaigns~~ → DONE (in platform/campaigns)
- ~~carts~~ → DONE (in commerce/cart)
- ~~checkout~~ → DONE (in commerce/checkout)
- ~~compliance~~ → DONE (in platform/compliance)
- ~~creative~~ → DONE (in platform/creative)
- ~~customers~~ → DONE (in core/customers)
- ~~dashboard~~ → DONE (in platform/dashboard)
- ~~donations~~ → DONE (in platform/nonprofit)
- ~~education~~ → DONE
- ~~events~~ → DONE (in industry/events)
- ~~fashion~~ → DONE
- ~~finance~~ → DONE (in financial/payments, wallet)
- ~~grocery~~ → DONE (in industry/grocery)
- ~~healthcare~~ → DONE (in industry/healthcare)
- ~~integrations~~ → DONE (in platform/integrations)
- ~~inventory~~ → DONE
- ~~marketing~~ → DONE (in platform/marketing)
- ~~nightlife~~ → DONE (in industry/nightlife)
- ~~nonprofit~~ → DONE (in platform/nonprofit)
- ~~notifications~~ → DONE (in platform/notifications)
- ~~orders~~ → DONE (in core/orders)
- ~~payments~~ → DONE (in financial/payments)
- ~~pos~~ → DONE
- ~~products~~ → DONE (in core/products)
- ~~rentals~~ → DONE
- ~~restaurant~~ → DONE (in industry/restaurant)
- ~~retail~~ → DONE (in industry/retail)
- ~~settings~~ → DONE (in core/settings)
- ~~subscriptions~~ → DONE (in core/subscriptions)
- ~~wallet~~ → DONE (in financial/wallet)
- ~~wholesale~~ → DONE (in industry/wholesale)

---

## BFF Layer Extraction Required

### Frontend/ops-console (154 routes)
**Issue:** Contains API routes that should be in backend  
**Action Required:**
1. Identify all `/api/` routes in ops-console
2. Extract business logic to Fastify services
3. Convert frontend routes to API client calls
4. Remove Prisma dependencies from frontend

### Frontend/storefront (55 routes)
**Issue:** Contains API routes that should be in backend  
**Action Required:**
1. Identify all `/api/` routes in storefront
2. Extract business logic to Fastify services
3. Convert to API client pattern
4. Ensure clean separation

### apps/ Directory (19 routes)
**Issue:** May contain specialized APIs  
**Action Required:**
1. Audit each app's API usage
2. Consolidate common patterns into main backend
3. Keep app-specific logic if truly isolated

---

## Migration Strategy

### Phase 1: Critical Business Functions (Week 1-2)
**Goal:** Complete all revenue-impacting and operational APIs

**Services to Create:**
1. `booking.service.ts` + `bookings.routes.ts` (10-15 endpoints)
2. `fulfillment.service.ts` + `fulfillment.routes.ts` (15-20 endpoints)
3. `invoice.service.ts` + `invoices.routes.ts` (8-12 endpoints)
4. `ledger.service.ts` + `ledger.routes.ts` (10-15 endpoints)
5. `refund.service.ts` + `refunds.routes.ts` (6-10 endpoints)
6. `return.service.ts` + `returns.routes.ts` (6-10 endpoints)
7. `settlement.service.ts` + `settlements.routes.ts` (8-12 endpoints)

**Estimated Effort:** 70-95 endpoints

### Phase 2: Customer Experience (Week 2-3)
**Goal:** Complete customer-facing features

**Services to Create:**
1. `coupon.service.ts` + `coupons.routes.ts`
2. `credit.service.ts` + `credits.routes.ts`
3. `discountRules.service.ts` + `discount-rules.routes.ts`
4. `lead.service.ts` + `leads.routes.ts`
5. `review.service.ts` + `reviews.routes.ts`
6. `service-catalog.service.ts` + `services.routes.ts`
7. `template.service.ts` + `templates.routes.ts`
8. `collection.service.ts` + `collections.routes.ts`

**Estimated Effort:** 60-80 endpoints

### Phase 3: Specialized Services (Week 3-4)
**Goal:** Migrate industry-specific and advanced features

**Focus Areas:**
- AI/AI-Agent services
- Automation workflows
- Real estate APIs
- Professional services
- Travel/vehicle management
- WhatsApp integration

**Estimated Effort:** 100-150 endpoints

### Phase 4: BFF Extraction (Week 4-5)
**Goal:** Extract APIs from frontend packages

**Steps:**
1. Audit ops-console APIs (154 routes)
2. Audit storefront APIs (55 routes)
3. Create corresponding Fastify services
4. Update frontend to use API client pattern
5. Remove Prisma from frontend completely

**Estimated Effort:** 200+ endpoints extracted

### Phase 5: Infrastructure & Cleanup (Week 5-6)
**Goal:** System APIs and final cleanup

**Tasks:**
1. Migrate infrastructure APIs (uploads, webhooks, etc.)
2. Consolidate duplicate functionality
3. Remove all legacy Next.js API routes
4. Final testing and documentation
5. Prepare for VPS deployment

---

## Technical Debt Items

### Immediate Fixes Required
1. **Duplicate functionality:** Some features exist in both backend and frontend
2. **Inconsistent patterns:** Early migrations may need refactoring
3. **Missing tests:** Need comprehensive test suite
4. **API documentation:** OpenAPI/Swagger specs needed
5. **Rate limiting:** Implement across all endpoints
6. **Request validation:** Add Zod schemas consistently

### Code Quality Improvements
1. Standardize error response formats
2. Add request/response logging middleware
3. Implement circuit breakers for external services
4. Add caching layer (Redis) for frequently accessed data
5. Optimize database queries with proper indexing

---

## Deployment Readiness Checklist

### Before VPS Deployment
- [ ] All critical APIs migrated (Priority 1 & 2)
- [ ] BFF layer extracted from frontend
- [ ] Comprehensive test coverage (>80%)
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Monitoring/alerting configured
- [ ] Database migrations documented
- [ ] Rollback plan prepared
- [ ] Performance benchmarks established
- [ ] Documentation complete

---

## File Organization Standards

### Service Layer Pattern
```typescript
// src/services/domain/entity.service.ts
export class EntityService {
  constructor(private readonly db = prisma) {}

  async create(storeId: string, data: any) {
    // Business logic + Prisma operations
  }
}
```

### Route Handler Pattern
```typescript
// src/routes/api/v1/domain/entity.routes.ts
export const entityRoutes: FastifyPluginAsync = async (server) => {
  server.get('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      // Route logic only
    },
  });
};
```

### Registration Pattern
```typescript
// src/index.ts
import { entityRoutes } from './routes/api/v1/domain/entity.routes';
await server.register(entityRoutes, { prefix: '/api/v1/entity' });
```

---

## Success Metrics

### Migration Completeness
- ✅ 40/114 categories complete (35%)
- 🎯 Target: 100/114 categories (88%) by end of Phase 3
- 🎯 Target: All BFF extraction complete by end of Phase 4

### Code Quality
- Zero Prisma imports in frontend packages
- 100% TypeScript strict mode compliance
- Consistent error handling across all endpoints
- Unified logging format

### Performance Targets
- API response time < 100ms (p95)
- Database query time < 50ms (p95)
- Zero N+1 query patterns
- Proper connection pooling

---

## Next Immediate Actions

1. **Start Phase 1** - Begin with bookings/fulfillment/invoices
2. **Audit BFF layers** - Create detailed inventory of ops-console and storefront APIs
3. **Create migration templates** - Standardize the service/route creation process
4. **Set up monitoring** - Track migration progress systematically

---

**Conclusion:** Core architecture is solid with 327 endpoints successfully migrated. Remaining work focuses on specialized services, BFF extraction, and achieving complete frontend-backend separation. Estimated 4-6 weeks to full completion with systematic execution.
