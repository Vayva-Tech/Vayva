# 🎯 Complete API Inventory & Restructuring Plan

**Total Route Files**: 1,596  
**Backend/core-api Routes**: 825  
**Frontend Routes**: 233 (storefront + ops-console + apps)

---

## 📊 Current API Categories (Backend/core-api)

### Core Business Services (Priority 1)
```
✅ auth/              - Authentication & authorization
✅ inventory/         - Inventory management  
✅ orders/            - Order processing
✅ customers/         - Customer management
✅ payments/          - Payment processing
✅ products/          - Product catalog
```

### Industry-Specific (Priority 2)
```
✅ fashion/           - Fashion & style
✅ education/         - E-learning
✅ grocery/           - Grocery delivery
✅ healthcare/        - Health services
✅ beauty/            - Beauty services
✅ kitchen/           - Meal kit / recipes
✅ events/            - Event management
✅ campaigns/         - Marketing campaigns
✅ donations/         - Nonprofit/donations
✅ creative/          - Creative agency
✅ nonprofit/         - Nonprofit management
```

### Advanced Features (Priority 3)
```
⏳ bookings/          - Appointments & bookings
⏳ subscriptions/     - Subscription boxes
⏳ billing/           - Billing & invoicing
⏳ finance/           - Financial management
⏳ ledger/            - Accounting ledger
⏳ invoices/          - Invoice management
⏳ coupons/           - Discount coupons
⏳ discount-rules/    - Discount rules engine
⏳ collections/       - Product collections
⏳ carts/             - Shopping cart
⏳ checkout/          - Checkout process
⏳ fulfillment/       - Order fulfillment
⏳ shipping/          - Shipping integration
⏳ menu-items/        - Restaurant menus
⏳ grants/            - Grant management
⏳ leads/             - Lead generation
```

### Platform Services (Priority 4)
```
⏳ dashboard/         - Dashboard data
⏳ analytics/         - Analytics & reporting
⏳ notifications/     - Notifications system
⏳ integrations/      - Third-party integrations
⏳ compliance/        - Compliance & legal
⏳ kyc/               - Know Your Customer
⏳ disputes/          - Dispute resolution
⏳ appeals/           - Appeal process
⏳ domains/           - Domain management
⏳ blog/              - Blog/content
⏳ jobs/              - Job board
```

### Infrastructure & Ops (Priority 5)
```
⏳ account/           - Account management
⏳ merchant/          - Merchant operations
⏳ onboarding/        - User onboarding
⏳ credits/           - Credit system
⏳ ai/                - AI services
⏳ ai-agent/          - AI agents
⏳ automation/        - Automation workflows
⏳ marketing/         - Marketing tools
⏳ calendar-sync/     - Calendar synchronization
⏳ designer/          - Design tools
 disputes/           - Dispute management
```

---

## 🎯 RESTRUCTURING PLAN

### Phase 1: Core Services (DONE ✅)
- [x] Authentication
- [x] Inventory
- [x] POS System
- [x] Rentals
- [x] Meal Kit
- [x] Fashion
- [x] Education

### Phase 2: Commerce Services (TODO)
- [ ] Orders Service
- [ ] Products Service
- [ ] Customers Service
- [ ] Payments Service
- [ ] Cart Service
- [ ] Checkout Service

### Phase 3: Industry Services (TODO)
- [ ] Grocery Service
- [ ] Healthcare Service
- [ ] Beauty Service
- [ ] Events Service
- [ ] Campaigns Service
- [ ] Creative Service

### Phase 4: Financial Services (TODO)
- [ ] Billing Service
- [ ] Finance Service
- [ ] Ledger Service
- [ ] Invoices Service
- [ ] Subscriptions Service

### Phase 5: Platform Services (TODO)
- [ ] Dashboard Service
- [ ] Analytics Service
- [ ] Notifications Service
- [ ] Bookings Service
- [ ] Fulfillment Service

### Phase 6: Infrastructure (TODO)
- [ ] Account Service
- [ ] Merchant Service
- [ ] Onboarding Service
- [ ] Credits Service
- [ ] AI/AI-Agent Services

---

## 📁 Target Structure

```
Backend/fastify-server/src/
├── services/
│   ├── core/
│   │   ├── auth.service.ts
│   │   ├── inventory.service.ts
│   │   ├── orders.service.ts
│   │   ├── products.service.ts
│   │   ├── customers.service.ts
│   │   └── payments.service.ts
│   ├── commerce/
│   │   ├── cart.service.ts
│   │   ├── checkout.service.ts
│   │   ├── coupons.service.ts
│   │   └── collections.service.ts
│   ├── industry/
│   │   ├── fashion.service.ts
│   │   ├── education.service.ts
│   │   ├── grocery.service.ts
│   │   ├── healthcare.service.ts
│   │   ├── beauty.service.ts
│   │   ├── meal-kit.service.ts
│   │   ├── events.service.ts
│   │   └── campaigns.service.ts
│   ├── financial/
│   │   ├── billing.service.ts
│   │   ├── finance.service.ts
│   │   ├── ledger.service.ts
│   │   ├── invoices.service.ts
│   │   └── subscriptions.service.ts
│   ├── platform/
│   │   ├── dashboard.service.ts
│   │   ├── analytics.service.ts
│   │   ├── notifications.service.ts
│   │   ├── bookings.service.ts
│   │   └── fulfillment.service.ts
│   └── infrastructure/
│       ├── account.service.ts
│       ├── merchant.service.ts
│       ├── onboarding.service.ts
│       ├── credits.service.ts
│       └── ai.service.ts
└── routes/api/v1/
    ├── core/
    ├── commerce/
    ├── industry/
    ├── financial/
    ├── platform/
    └── infrastructure/
```

---

## 🔄 Migration Strategy

For each API group:

1. **Analyze existing routes** in `Backend/core-api/src/app/api/[service]/`
2. **Extract business logic** from Next.js route handlers
3. **Create service class** in `fastify-server/src/services/[category]/`
4. **Create Fastify routes** in `fastify-server/src/routes/api/v1/[category]/`
5. **Test endpoints** match existing behavior
6. **Update frontend** to call new backend endpoints
7. **Deprecate old routes** in core-api

---

## 📊 Priority Matrix

| Priority | Category | APIs | Effort | Impact |
|----------|----------|------|--------|--------|
| P0 | Core | 6 | Low | Critical |
| P1 | Commerce | 6 | Medium | High |
| P2 | Industry | 9 | High | High |
| P3 | Financial | 5 | Medium | Medium |
| P4 | Platform | 5 | Medium | Medium |
| P5 | Infrastructure | 5 | Low | Low |

**Total Services to Create**: ~36  
**Estimated Time**: 2-3 weeks for full migration

---

## ✅ Next Steps

1. **Complete Phase 2** - Commerce services (orders, products, customers, payments)
2. **Test thoroughly** - Ensure all endpoints work
3. **Update frontend calls** - Point to new backend
4. **Continue with Phase 3-6** - Systematic migration

---

**Status**: Inventory Complete  
**Ready**: Phase 2 Implementation  
**Last Updated**: 2026-03-27
