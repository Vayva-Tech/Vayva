# 🎯 REMAINING FILES MIGRATION PLAN

**Date:** 2026-03-28  
**Status:** ⏳ PENDING - 34 Files Identified  
**Priority:** HIGH - Complete Frontend Separation  

---

## 📊 CURRENT STATUS

### Completed Work (Session 1-3):
✅ **13 services fully migrated** to backend API  
✅ **Zero Prisma imports** in those 13 files  
✅ **-547 lines of code** removed (41% reduction)  

### Remaining Work:
⏳ **34 files** still using `@vayva/db`  
⏳ Mix of test files, type definitions, and actual services  

---

## 📋 COMPLETE FILE LIST (34 Files)

### 🔴 CRITICAL - Active Services (15 files)

These are actively used services that need immediate migration:

| # | File | Type | Priority | Estimated Time |
|---|------|------|----------|----------------|
| 1 | `services/kyc.ts` | Service | 🔴 HIGH | 30 min |
| 2 | `services/BookingService.ts` | Service | 🔴 HIGH | 30 min |
| 3 | `services/MenuService.ts` | Service | 🔴 HIGH | 30 min |
| 4 | `services/onboarding.service.ts` | Service | 🔴 HIGH | 45 min |
| 5 | `services/inventory.service.ts` | Service | 🔴 HIGH | 30 min |
| 6 | `services/pricing.service.ts` | Service | 🟡 MEDIUM | 30 min |
| 7 | `services/discount.service.ts` | Service | 🟡 MEDIUM | 30 min |
| 8 | `services/segmentation.service.ts` | Service | 🟡 MEDIUM | 30 min |
| 9 | `services/loyalty.service.ts` | Service | 🟡 MEDIUM | 30 min |
| 10 | `services/education.ts` | Service | 🟡 MEDIUM | 30 min |
| 11 | `services/forecasting.service.ts` | Service | 🟡 MEDIUM | 30 min |
| 12 | `services/return.service.ts` | Service | 🟡 MEDIUM | 30 min |
| 13 | `services/real-estate.ts` | Service | 🟢 LOW | 30 min |
| 14 | `services/ops/handlers.ts` | Service | 🟢 LOW | 30 min |
| 15 | `lib/templates/templateService.ts` | Service | 🟢 LOW | 30 min |

**Subtotal:** ~6 hours for all critical services

---

### 🟡 MEDIUM - Support Services & Libs (7 files)

| # | File | Type | Priority | Estimated Time |
|---|------|------|----------|----------------|
| 16 | `lib/ai/ai-usage.service.ts` | AI Service | 🟡 MEDIUM | 30 min |
| 17 | `lib/ai/conversion.service.ts` | AI Service | 🟡 MEDIUM | 30 min |
| 18 | `lib/ai/openrouter-client.ts` | AI Service | 🟡 MEDIUM | 30 min |
| 19 | `lib/support/merchant-support-bot.service.ts` | Support | 🟡 MEDIUM | 30 min |
| 20 | `lib/support/support-context.service.ts` | Support | 🟡 MEDIUM | 30 min |
| 21 | `lib/partners/attribution.ts` | Analytics | 🟢 LOW | 30 min |
| 22 | `lib/security/apiKeys.ts` | Security | 🟢 LOW | 30 min |

**Subtotal:** ~3.5 hours for support services

---

### 🟢 LOW - Tests & Config (12 files)

#### Test Files (5 files):
| # | File | Type | Action |
|---|------|------|--------|
| 23 | `app/api/__tests__/comprehensive.test.ts` | Test | Update mocks |
| 24 | `app/api/account/account.test.ts` | Test | Update mocks |
| 25 | `app/api/socials/instagram/callback/callback.test.ts` | Test | Update mocks |
| 26 | `app/api/support/conversations/conversations.test.ts` | Test | Update mocks |
| 27 | `app/api/templates/apply/route.test.ts` | Test | Update mocks |

**Action:** These tests import types only or can use API mocks instead

#### Type Definitions (2 files):
| # | File | Type | Action |
|---|------|------|--------|
| 28 | `types/education-db.ts` | Types | Keep types, remove prisma |
| 29 | `types/reports.ts` | Types | Keep types only |

**Action:** Pure type definitions - safe to keep or migrate types only

#### Infrastructure (5 files):
| # | File | Type | Action |
|---|------|------|--------|
| 30 | `lib/prisma.ts` | Export | ⚠️ DELETE or re-export API client |
| 31 | `lib/security.ts` | Config | Already commented out |
| 32 | `lib/ops-auth.ts` | Config | Already commented out |
| 33 | `lib/events/eventBus.ts` | Event Bus | Keep, remove prisma |
| 34 | `providers/store-provider.tsx` | Context | Keep types, remove prisma |

**Note:** Files 31-33 already have prisma imports commented out!

---

## 🎯 MIGRATION STRATEGY

### Phase 1: Critical Services (Today)
**Goal:** Migrate top 5 most-used services

1. ✅ **kyc.ts** - Already partially migrated, finish it
2. ✅ **BookingService.ts** - High user impact
3. ✅ **MenuService.ts** - Core restaurant feature
4. ✅ **onboarding.service.ts** - Critical for new users
5. ✅ **inventory.service.ts** - Daily operations

**Estimated Time:** 2.5 hours  
**Impact:** 80% of daily operations covered

---

### Phase 2: Remaining Services (Tomorrow)
**Goal:** Complete all 15 critical services

6-15. Migrate remaining 10 services from critical list

**Estimated Time:** 4 hours  
**Impact:** All core business logic migrated

---

### Phase 3: Support Services (Day 3)
**Goal:** Migrate AI and support services

16-22. Migrate 7 support services

**Estimated Time:** 3.5 hours  
**Impact:** Full platform capabilities

---

### Phase 4: Cleanup & Tests (Day 4)
**Goal:** Final cleanup and test updates

23-34. Update tests, remove old exports, finalize

**Estimated Time:** 2 hours  
**Impact:** 100% complete separation

---

## 📊 PRIORITY BREAKDOWN

### Do Today (Phase 1):
```bash
# Top 5 priority files
Frontend/merchant/src/services/kyc.ts
Frontend/merchant/src/services/BookingService.ts
Frontend/merchant/src/services/MenuService.ts
Frontend/merchant/src/services/onboarding.service.ts
Frontend/merchant/src/services/inventory.service.ts
```

### Do Tomorrow (Phase 2):
```bash
# Remaining critical services
Frontend/merchant/src/services/pricing.service.ts
Frontend/merchant/src/services/discount.service.ts
Frontend/merchant/src/services/segmentation.service.ts
Frontend/merchant/src/services/loyalty.service.ts
Frontend/merchant/src/services/education.ts
Frontend/merchant/src/services/forecasting.service.ts
Frontend/merchant/src/services/return.service.ts
Frontend/merchant/src/services/real-estate.ts
Frontend/merchant/src/services/ops/handlers.ts
Frontend/merchant/src/lib/templates/templateService.ts
```

### Do Day 3 (Phase 3):
```bash
# Support services
Frontend/merchant/src/lib/ai/ai-usage.service.ts
Frontend/merchant/src/lib/ai/conversion.service.ts
Frontend/merchant/src/lib/ai/openrouter-client.ts
Frontend/merchant/src/lib/support/merchant-support-bot.service.ts
Frontend/merchant/src/lib/support/support-context.service.ts
Frontend/merchant/src/lib/partners/attribution.ts
Frontend/merchant/src/lib/security/apiKeys.ts
```

### Do Day 4 (Phase 4):
```bash
# Tests and cleanup
# Update test mocks
# Remove lib/prisma.ts export
# Clean up type-only imports
```

---

## 🔧 MIGRATION PATTERN (Reminder)

### Before:
```typescript
import { prisma } from "@vayva/db";

export class MyService {
  static async getData(id: string) {
    return await prisma.model.findUnique({ where: { id } });
  }
}
```

### After:
```typescript
import { api } from '@/lib/api-client';

export class MyService {
  static async getData(id: string) {
    const response = await api.get(`/model/${id}`);
    return response.data;
  }
}
```

---

## ✅ SUCCESS METRICS

### Current State:
- ✅ 13 services migrated (from original list)
- ❌ 34 files still importing @vayva/db
- ⏳ 15 active services need migration

### Target State (After 4 Days):
- ✅ 28+ services migrated total
- ✅ 0 files with direct Prisma usage
- ✅ 100% API-based architecture
- ✅ Complete frontend-backend separation

---

## 🚨 IMPORTANT NOTES

### Files Already Commented Out:
These files already have prisma imports commented out - just need final cleanup:
- `lib/security.ts` ✅
- `lib/ops-auth.ts` ✅
- `lib/events/eventBus.ts` ✅

### Type-Only Imports:
Some files may only import types (which is acceptable):
- `types/education-db.ts` - Can stay as type definitions
- `types/reports.ts` - Can stay as type definitions
- `lib/security/apiKeys.ts` - May be type-only

### Test Files:
Test files should mock the API client instead of mocking Prisma:
```typescript
// Old way (mocking Prisma)
vi.mock('@vayva/db', () => ({
  prisma: { findUnique: vi.fn() }
}));

// New way (mocking API)
vi.mock('@/lib/api-client', () => ({
  api: { get: vi.fn(), post: vi.fn() }
}));
```

---

## 🎯 NEXT IMMEDIATE ACTION

**Start with Phase 1 - Top 5 Critical Services:**

1. Open `services/kyc.ts`
2. Replace prisma imports with API calls
3. Test the changes
4. Repeat for next 4 files

**Estimated completion time:** 2-3 hours  
**Business impact:** High - affects daily operations

---

## 📈 PROGRESS TRACKING

```
Phase 1 (Critical Top 5):   ░░░░░░░░░░ 0% (0/5)
Phase 2 (Remaining 10):     ░░░░░░░░░░ 0% (0/10)
Phase 3 (Support 7):        ░░░░░░░░░░ 0% (0/7)
Phase 4 (Cleanup):          ░░░░░░░░░░ 0% (0/12)

Overall:                    ░░░░░░░░░░ 0% (0/34 files)
```

---

**Ready to start Phase 1?** 🚀

Let me know if you want me to begin migrating these files now!
