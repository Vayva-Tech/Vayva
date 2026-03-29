# Legacy Backend Cleanup Action Plan

**Date:** March 27, 2026  
**Status:** In Progress  
**Progress:** 49/104 directories cleaned (47%)

---

## Summary

- ✅ **COMPLETED:** Deleted 49 migrated legacy directories
- ⚠️ **REMAINING:** 55 directories to audit and clean up
- 📊 **Total Reduction:** From 743 route files to ~300 route files

---

## Remaining Directories Breakdown (55 total)

### Category 1: Missing Service Files (23 directories)
These have mappings but service files need to be created/extended:

#### High Priority - Core Functionality (8)
1. **auth** → `Backend/fastify-server/src/auth.ts` (needs verification)
2. **billing** → `financial/billing.service.ts`
3. **collections** → `commerce/collections.service.ts`
4. **coupons** → `commerce/coupons.service.ts`
5. **discount-rules** → `commerce/discount-rules.service.ts`
6. **integrations** → `platform/integrations.service.ts`
7. **leads** → `marketing/leads.service.ts`
8. **merchant** → `admin/merchants.service.ts`

#### Medium Priority - Platform Features (10)
9. **credits** → `platform/credits.service.ts`
10. **payment-methods** → `financial/payment-methods.service.ts`
11. **pos** → `pos/pos.service.ts`
12. **properties** → `industry/properties.service.ts`
13. **quotes** → `industry/quotes.service.ts`
14. **referrals** → `platform/referrals.service.ts`
15. **rentals** → `rentals/rentals.service.ts`
16. **reviews** → `commerce/reviews.service.ts`
17. **security** → `security/risk.service.ts`
18. **services** → `commerce/services.service.ts`

#### Low Priority - Extended Features (5)
19. **sites** → `platform/sites.service.ts`
20. **socials** → `platform/socials.service.ts`
21. **templates** → `platform/templates.service.ts`
22. **vehicles** → `industry/vehicles.service.ts`
23. **webhooks** → `platform/webhooks.service.ts`

---

### Category 2: Needs Manual Audit (32 directories)
These don't have predefined mappings:

#### Likely Duplicates/Obsolete (15)
Directories that appear to be duplicates or can be merged:
1. **finance** → Probably duplicate of financial services
2. **health** → Probably duplicate of healthcare
3. **me** → User profile (merge into account)
4. **merchant** → Already in admin/merchants
5. **performance** → Merge into analytics
6. **professional** → Duplicate of professional-services
7. **public** → Public API endpoints (review structure)
8. **reports** → Merge into analytics/dashboard
9. **resources** → Static resources (review usage)
10. **saas** → Subscription features (merge into subscriptions)
11. **seller** → Marketplace seller tools (review)
12. **store** → Duplicate of core/store service
13. **storefront** → Frontend BFF (should be extracted)
14. **team** → Team management (merge into account)
15. **v1** → Versioned API (review structure)

#### Industry-Specific (8)
Should map to industry services:
16. **donations** → nonprofit.service.ts
17. **jobs** → May need new service or merge
18. **kitchen** → restaurant.service.ts
19. **portfolio** → portfolio.service.ts (already exists)
20. **projects** → May need project management service
21. **stays** → travel.service.ts or rentals
22. **travel** → travel.service.ts (already exists)
23. **wellness** → wellness.service.ts (already exists)

#### Integration/Infrastructure (9)
24. **control-center** → Admin functionality?
25. **designer** → Creative tool (merge into creative.service.ts)
26. **internal** → Internal APIs (audit first)
27. **paymenttransaction** → payments.service.ts
28. **social-connections** → socials.service.ts
29. **telemetry** → analytics.service.ts
30. **trial** → subscriptions.service.ts
31. **uploads** → storage.service.ts
32. **wa-agent** → ai/wa-agent.service.ts
33. **whatsapp** → Evolution API integration

---

## Action Plan

### Phase 1: Create Missing Service Files (Days 1-2)
**Priority:** High priority core functionality (8 services)

For each directory:
1. Read legacy route files
2. Check existing Fastify service methods
3. Add missing methods to service
4. Verify routes are registered in Fastify
5. Delete legacy directory

**Target Services:**
- [ ] billing.service.ts
- [ ] collections.service.ts
- [ ] coupons.service.ts
- [ ] discount-rules.service.ts
- [ ] integrations.service.ts
- [ ] leads.service.ts
- [ ] merchants.service.ts (extend existing)
- [ ] pos.service.ts

### Phase 2: Map Unmapped Directories (Day 3)
**Priority:** Clear duplicates and merges

For each directory:
1. Read main route file
2. Identify functionality
3. Map to existing service or create new
4. Document decision
5. Delete or migrate

**Quick Wins:**
- finance → Merge into financial services
- health → Merge into healthcare
- me → Merge into account
- performance → Merge into analytics
- reports → Merge into dashboard/analytics

### Phase 3: Industry Verticals (Day 4)
Map industry-specific directories to services:
- donations → nonprofit.service.ts
- kitchen → restaurant.service.ts
- stays → travel.service.ts
- travel → verify travel.service.ts coverage
- wellness → verify wellness.service.ts coverage

### Phase 4: Infrastructure & Integrations (Day 5)
Handle infrastructure-related directories:
- control-center → Audit and assign
- designer → Merge into creative
- internal → Security review
- uploads → storage.service.ts
- wa-agent → ai service
- whatsapp → Evolution API routes

### Phase 5: Final Cleanup (Day 6)
- Delete all migrated directories
- Run tests to verify functionality
- Update documentation
- Create final cleanup report

---

## Immediate Next Steps

### TODAY: Start with High-Priority Services

1. **Verify auth.ts exists**
   ```bash
   ls -la Backend/fastify-server/src/auth.ts
   ```

2. **Create billing.service.ts**
   - Read: `Backend/core-api/src/app/api/billing/route.ts`
   - Create: `Backend/fastify-server/src/services/financial/billing.service.ts`
   - Register routes

3. **Extend merchant-admin.service.ts**
   - Check what's missing
   - Add missing methods
   - Delete legacy merchant directory

---

## Success Metrics

- [ ] Zero Prisma usage in frontend (✅ COMPLETE)
- [ ] Zero BFF routes in frontend (⚠️ PENDING - separate task)
- [ ] All critical services implemented in Fastify
- [ ] Legacy backend reduced to < 10 directories
- [ ] All routes properly authenticated
- [ ] Tests passing for all services

---

## Backup Location
All deleted directories backed up to: `/tmp/legacy-backup-YYYYMMDD-HHMMSS/`

---

**File:** `/Users/fredrick/Documents/Vayva-Tech/vayva/docs/LEGACY_CLEANUP_PLAN.md`
