# Merchant BFF Extraction Plan

**Status:** Ready for execution  
**Scope:** 81 routes with Prisma imports in Frontend/merchant/src/app/api/  
**Duration:** 1-2 days  

---

## Analysis Summary

### Current State
- **Total merchant routes:** 523
- **Routes with Prisma imports:** 81
- **Routes already using API client:** 442

### Pattern Identified
```typescript
// CURRENT (with Prisma)
import { prisma } from "@vayva/db";
const store = await prisma.store.findUnique({ where: { id: storeId } });

// TARGET (API client)
const response = await apiClient.get(`/api/v1/compliance/kyc/status`, { storeId });
```

---

## Routes to Extract (81 total)

### Category 1: KYC & Compliance (8 routes)
- `/api/kyc/status/route.ts` → Backend: `/api/v1/compliance/kyc/status`
- `/api/kyc/cac/submit/route.ts` → Backend: `/api/v1/compliance/kyc/submit`
- `/api/realestate/properties/route.ts` → Backend: `/api/v1/properties` (already exists)
- `/api/nonprofit/campaigns/route.ts` → Backend: `/api/v1/nonprofit/campaigns` (already exists)
- `/api/nonprofit/campaigns/[id]/route.ts` → Backend: `/api/v1/nonprofit/campaigns/:id`
- `/api/health/database/route.ts` → Backend: `/api/v1/admin/health/database`
- `/api/health/comprehensive/route.ts` → Backend: `/api/v1/admin/health/comprehensive`
- `/api/resources/list/route.ts` → Backend: `/api/v1/admin/resources`

### Category 2: Industry-Specific (25 routes)
- `/api/beauty/stylists/route.ts` → Backend: `/api/v1/beauty/stylists`
- `/api/beauty/stylists/availability/route.ts` → Backend: `/api/v1/beauty/stylists/availability`
- `/api/beauty/dashboard/route.ts` → Backend: `/api/v1/beauty/dashboard`
- `/api/beauty/dashboard/overview/route.ts` → Backend: `/api/v1/beauty/dashboard/overview`
- `/api/beauty/inventory/[id]/route.ts` → Backend: `/api/v1/beauty/inventory/:id`
- `/api/beauty/packages/route.ts` → Backend: `/api/v1/beauty/packages`
- `/api/beauty/services/performance/route.ts` → Backend: `/api/v1/beauty/services/performance`
- `/api/education/enrollments/route.ts` → Backend: `/api/v1/education/enrollments`
- `/api/education/students/route.ts` → Backend: `/api/v1/education/students`
- `/api/education/quizzes/route.ts` → Backend: `/api/v1/education/quizzes`
- `/api/fulfillment/shipments/route.ts` → Backend: `/api/v1/fulfillment/shipments` (already exists)
- `/api/fulfillment/shipments/[id]/retry/route.ts` → Backend: `/api/v1/fulfillment/shipments/:id/retry`
- `/api/marketplace/vendors/route.ts` → Backend: `/api/v1/marketplace/vendors`
- `/api/b2b/rfq/route.ts` → Backend: `/api/v1/b2b/rfq`
- ... (continue for all industry routes)

### Category 3: Platform Features (20 routes)
- `/api/rescue/incidents/[id]/route.ts` → Backend: `/api/v1/rescue/incidents/:id` (already exists)
- `/api/calendar-sync/[id]/route.ts` → Backend: `/api/v1/bookings/:id/calendar-sync`
- `/api/dashboard/sidebar-counts/route.ts` → Backend: `/api/v1/dashboard/sidebar-counts` (already exists)
- `/api/dashboard/industry-engine/route.ts` → Backend: `/api/v1/dashboard/industry-engine`
- ... (continue for platform routes)

### Category 4: Core Features (15 routes)
- `/api/team/invites/accept/route.ts` → Backend: `/api/v1/account/team/invites/accept`
- `/api/support/chat/route.ts` → Backend: `/api/v1/support/chat`
- `/api/support/conversations/route.ts` → Backend: `/api/v1/support/conversations`
- ... (continue for core features)

### Category 5: Beta/Waitlist (5 routes)
- `/api/beta/desktop-app-waitlist/route.ts` → Backend: `/api/v1/admin/waitlist/desktop-app`
- ... (waitlist routes)

### Category 6: Accounting (8 routes)
- `/api/accounting/ledger/route.ts` → Backend: `/api/v1/ledger` (already exists)
- `/api/accounting/expenses/route.ts` → Backend: `/api/v1/accounting/expenses`
- `/api/accounting/pl-report/route.ts` → Backend: `/api/v1/accounting/pl-report`
- ... (accounting routes)

---

## Extraction Process

### Step 1: Verify Backend Service Exists

For each route, check if backend service already covers it:

```bash
# Example: Check if beauty stylists service exists
ls Backend/fastify-server/src/services/industry/beauty.service.ts
# If exists: Just replace frontend with API call
# If not: Need to extend or create service
```

### Step 2: Migration Template

**BEFORE (Prisma):**
```typescript
import { prisma } from "@vayva/db";

export async function GET(request: NextRequest) {
  const auth = await buildBackendAuthHeaders(request);
  const storeId = auth.user.storeId;
  
  const result = await prisma.someModel.findMany({
    where: { storeId },
  });
  
  return NextResponse.json(result);
}
```

**AFTER (API Client):**
```typescript
import { apiJson } from "@/lib/api-client-shared";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";

export async function GET(request: NextRequest) {
  const auth = await buildBackendAuthHeaders(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const result = await apiJson(
    `${process.env.BACKEND_API_URL}/api/v1/some-endpoint?storeId=${storeId}`,
    {
      headers: auth.headers,
    }
  );
  
  return NextResponse.json(result);
}
```

### Step 3: Batch Execution

**Batch 1: KYC & Compliance (8 routes)** - Priority: HIGH
```bash
# Files to migrate:
Frontend/merchant/src/app/api/kyc/status/route.ts
Frontend/merchant/src/app/api/kyc/cac/submit/route.ts
Frontend/merchant/src/app/api/realestate/properties/route.ts
Frontend/merchant/src/app/api/nonprofit/campaigns/route.ts
Frontend/merchant/src/app/api/nonprofit/campaigns/[id]/route.ts
Frontend/merchant/src/app/api/health/database/route.ts
Frontend/merchant/src/app/api/health/comprehensive/route.ts
Frontend/merchant/src/app/api/resources/list/route.ts
```

**Batch 2: Beauty Industry (6 routes)** - Priority: MEDIUM
```bash
# Files to migrate:
Frontend/merchant/src/app/api/beauty/stylists/route.ts
Frontend/merchant/src/app/api/beauty/stylists/availability/route.ts
Frontend/merchant/src/app/api/beauty/dashboard/route.ts
Frontend/merchant/src/app/api/beauty/dashboard/overview/route.ts
Frontend/merchant/src/app/api/beauty/inventory/[id]/route.ts
Frontend/merchant/src/app/api/beauty/packages/route.ts
```

**Batch 3: Education (3 routes)** - Priority: MEDIUM
```bash
# Files to migrate:
Frontend/merchant/src/app/api/education/enrollments/route.ts
Frontend/merchant/src/app/api/education/students/route.ts
Frontend/merchant/src/app/api/education/quizzes/route.ts
```

**Continue with remaining batches...**

---

## Backend Service Extensions Needed

### 1. Beauty Service Enhancement

**Current:** `Backend/fastify-server/src/services/industry/beauty.service.ts`

**Check coverage:**
```bash
grep -n "stylist\|Stylist" Backend/fastify-server/src/services/industry/beauty.service.ts
```

**If missing, add:**
```typescript
async getStylists(storeId: string) {
  const stylists = await this.db.beautyStylist.findMany({
    where: { storeId },
  });
  logger.info(`[Beauty] Retrieved ${stylists.length} stylists for store ${storeId}`);
  return stylists;
}

async getStylistAvailability(storeId: string, stylistId: string) {
  const availability = await this.db.beautyStylistAvailability.findMany({
    where: { storeId, stylistId },
  });
  return availability;
}
```

### 2. Education Service Enhancement

**Current:** `Backend/fastify-server/src/services/industry/education.service.ts`

**Add if missing:**
```typescript
async getEnrollments(storeId: string) {
  const enrollments = await this.db.courseEnrollment.findMany({
    where: { storeId },
    include: { course: true, student: true },
  });
  return enrollments;
}

async getStudents(storeId: string) {
  const students = await this.db.educationStudent.findMany({
    where: { storeId },
  });
  return students;
}
```

### 3. Marketplace Service

**May need new service:** `Backend/fastify-server/src/services/industry/marketplace.service.ts`

```typescript
export class MarketplaceService {
  constructor(private readonly db = prisma) {}

  async getVendors(storeId: string) {
    const vendors = await this.db.marketplaceVendor.findMany({
      where: { storeId },
    });
    return vendors;
  }
}
```

---

## Verification Checklist

After each batch:

- [ ] Zero Prisma imports in migrated files
- [ ] All API calls use correct backend endpoints
- [ ] Authentication headers properly passed
- [ ] Error handling consistent
- [ ] TypeScript types match
- [ ] No runtime errors

Final verification:

```bash
# Should return 0
find Frontend/merchant/src/app/api -name "route.ts" -exec grep -l "prisma\." {} \; | wc -l
```

---

## Execution Timeline

### Day 1: High Priority Batches
- **Morning:** Batch 1 (KYC & Compliance - 8 routes)
- **Afternoon:** Batch 2 (Beauty - 6 routes) + Batch 3 (Education - 3 routes)
- **Evening:** Testing & verification

### Day 2: Remaining Batches
- **Morning:** Batch 4-6 (Industry-specific)
- **Afternoon:** Batch 7-9 (Platform & Core)
- **Evening:** Final cleanup & testing

---

## Success Criteria

- [ ] 0 Prisma imports in Frontend/merchant/src/app/api/
- [ ] All 81 routes converted to API client pattern
- [ ] Zero runtime errors
- [ ] All functionality preserved
- [ ] Backend services cover all operations

---

## Notes

**Why This Matters:**
- Completes 100% frontend-backend separation
- Removes all @vayva/db from frontend packages
- Ensures clean architecture across entire codebase
- Enables independent deployment of frontend and backend

**Risk Level:** LOW
- Most backend services already exist
- Simple proxy pattern replacement
- Can be done incrementally by batch
- Easy rollback if needed
