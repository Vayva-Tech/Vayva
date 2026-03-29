# BFF Extraction & Consolidation Plan

**Duration:** 4-7 days total  
**Priority:** CRITICAL - Required for production deployment  
**Created:** 2026-03-27

---

## Overview

### Current State
- ✅ **72 Fastify services** migrated and operational in backend
- ⚠️ **209 BFF routes** still exist in frontend packages with Prisma imports
- ⚠️ **Duplicate functionality** between some migrated services

### Goals
1. Extract all business logic from frontend to backend
2. Consolidate overlapping/redundant services
3. Achieve clean frontend-backend separation
4. Remove `@vayva/db` dependency from frontend packages

---

## Part 1: BFF Layer Extraction (3-5 days)

### Branch Structure for Parallel Extraction

#### **Branch A: Ops-Console BFF Extraction** (2-3 days)
**Scope:** 154 routes in `Frontend/ops-console/src/app/api/`

**Process:**
```bash
# 1. Identify all BFF routes
find Frontend/ops-console/src/app/api -name "route.ts" | wc -l
# Expected: 154 routes

# 2. Categorize by domain
ls -la Frontend/ops-console/src/app/api/
```

**Expected Categories:**
- `/api/bookings/**` → Extract to `booking.service.ts` (already exists, may need extension)
- `/api/invoices/**` → Already in backend, remove from frontend
- `/api/fulfillment/**` → Already in backend, remove from frontend
- `/api/analytics/**` → Extend existing analytics service if needed
- `/api/reports/**` → Create new reporting service or extend analytics

**Action Steps:**

For each BFF route directory:

1. **Read the route file:**
   ```typescript
   // Frontend/ops-console/src/app/api/some-endpoint/route.ts
   import { prisma } from '@vayva/db';
   
   export async function POST(req) {
     const data = await prisma.someModel.create({...});
     return NextResponse.json({ success: true, data });
   }
   ```

2. **Check if service exists in backend:**
   ```bash
   # Check if already migrated
   ls Backend/fastify-server/src/services/*/some-endpoint.service.ts
   ```

3. **If exists:** Simply replace with API client call
   ```typescript
   // AFTER (in ops-console)
   import { apiClient } from '@/lib/api-client';
   
   export async function POST(req) {
     const response = await apiClient.post('/api/v1/some-endpoint', req.body);
     return NextResponse.json(response);
   }
   ```

4. **If doesn't exist:** 
   - Create service in backend
   - Create routes in backend
   - Register in index.ts
   - Replace frontend with API client

**API Client Pattern:**
```typescript
// Frontend/ops-console/src/lib/api-client.ts
export const apiClient = {
  async post(endpoint: string, body: any) {
    const token = getAuthToken(); // From cookies/storage
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Request failed');
    }
    
    return res.json();
  },
  
  async get(endpoint: string, params?: Record<string, string>) {
    const token = getAuthToken();
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}${queryString}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Request failed');
    }
    
    return res.json();
  },
};
```

**Success Criteria:**
- [ ] Zero Prisma imports in ops-console
- [ ] All 154 routes converted to API client calls
- [ ] `@vayva/db` removed from ops-console package.json dependencies
- [ ] All routes functional with backend API

---

#### **Branch B: Storefront BFF Extraction** (1-2 days)
**Scope:** 55 routes in `Frontend/storefront/src/app/api/`

**Process:** Same as Branch A but simpler (fewer routes)

**Expected Routes:**
- `/api/cart/**` → Should use `/api/v1/carts` backend
- `/api/checkout/**` → Should use `/api/v1/checkouts` backend
- `/api/products/**` → Should use `/api/v1/products` backend
- `/api/customers/**` → Should use `/api/v1/customers` backend
- `/api/orders/**` → Should use `/api/v1/orders` backend

**Special Considerations:**
- Storefront may have public (non-authenticated) routes
- Ensure CORS configured for storefront domain
- May need different auth strategy (session vs JWT)

**Success Criteria:**
- [ ] Zero Prisma imports in storefront
- [ ] All 55 routes converted to API client calls
- [ ] `@vayva/db` removed from storefront package.json
- [ ] Public routes working without authentication

---

### BFF Extraction Workflow Template

**For Each Route:**

```markdown
## Route: [directory name]

### Current Location:
- Frontend/ops-console/src/app/api/[dir]/route.ts

### Business Logic Analysis:
- [ ] Uses Prisma: YES/NO
- [ ] Database operations: CREATE/READ/UPDATE/DELETE
- [ ] External APIs: YES/NO (which ones?)
- [ ] Complex business logic: YES/NO

### Backend Status:
- [ ] Service already exists: [service name]
- [ ] Needs new service: YES/NO
- [ ] Partial overlap: [describe]

### Action Required:
- [ ] Extend existing service
- [ ] Create new service + routes
- [ ] Simple API client replacement

### Migration Steps:
1. [ ] Read and understand current logic
2. [ ] Create/extend backend service
3. [ ] Create/extend backend routes
4. [ ] Register in index.ts
5. [ ] Replace frontend with API client
6. [ ] Test endpoint
7. [ ] Mark complete

### Notes:
[Any special considerations]
```

---

## Part 2: Service Consolidation (1-2 days)

### Identified Overlaps

#### 1. **menu-items → restaurant** 
**Current State:**
- `Backend/fastify-server/src/services/industry/restaurant.service.ts` ✅ EXISTS
- `Backend/core-api/src/app/api/menu-items/` ⚠️ STILL IN LEGACY

**Action:** 
```typescript
// 1. Read menu-items legacy routes
cat Backend/core-api/src/app/api/menu-items/route.ts

// 2. Check if restaurant service covers menu items
grep -n "menu" Backend/fastify-server/src/services/industry/restaurant.service.ts

// 3. If NOT covered, extend restaurant service:
export class RestaurantService {
  // ... existing methods
  
  async createMenuItem(storeId: string, menuItemData: any) {
    const item = await this.db.menuItem.create({
      data: { ...menuItemData, storeId },
    });
    logger.info(`[Restaurant] Created menu item ${item.id}`);
    return item;
  }
  
  async getMenuItems(storeId: string, filters: any) {
    const items = await this.db.menuItem.findMany({
      where: { storeId, ...filters },
    });
    return items;
  }
}

// 4. Add to restaurant.routes.ts
server.post('/menu-items', { ... });
server.get('/menu-items', { ... });

// 5. Delete legacy menu-items directory
rm -rf Backend/core-api/src/app/api/menu-items/
```

**Status:** ⏳ PENDING

---

#### 2. **box-subscriptions → subscriptions**
**Current State:**
- `Backend/fastify-server/src/services/core/subscriptions.service.ts` ✅ EXISTS
- `Backend/core-api/src/app/api/box-subscriptions/` ⚠️ STILL IN LEGACY

**Action:**
```typescript
// 1. Analyze box-subscriptions logic
cat Backend/core-api/src/app/api/box-subscriptions/route.ts

// 2. Likely just a subscription type - verify coverage
// Box subscriptions are probably just subscriptions with:
// - planKey: 'BOX_*'
// - metadata: { boxType: '...', frequency: '...' }

// 3. If special logic needed, extend subscriptions service:
export class SubscriptionsService {
  // ... existing methods
  
  async createBoxSubscription(storeId: string, boxData: any) {
    const subscription = await this.db.subscription.create({
      data: {
        ...boxData,
        storeId,
        planKey: `BOX_${boxData.boxType}`,
        metadata: {
          frequency: boxData.frequency,
          nextDeliveryDate: boxData.nextDelivery,
        },
      },
    });
    return subscription;
  }
}

// 4. Add route or keep generic /api/v1/subscriptions
// No new route needed if generic endpoint handles it

// 5. Delete legacy
rm -rf Backend/core-api/src/app/api/box-subscriptions/
```

**Status:** ⏳ PENDING

---

#### 3. **realestate → properties**
**Current State:**
- `Backend/fastify-server/src/services/industry/properties.service.ts` ✅ EXISTS
- `Backend/core-api/src/app/api/realestate/` ⚠️ STILL IN LEGACY (large directory)

**Action:**
```bash
# 1. Assess realestate scope
find Backend/core-api/src/app/api/realestate -name "route.ts" | wc -l
# Count how many endpoints

# 2. Read key endpoints
cat Backend/core-api/src/app/api/realestate/properties/route.ts
cat Backend/core-api/src/app/api/realestate/leads/route.ts
cat Backend/core-api/src/app/api/realestate/transactions/route.ts

# 3. Determine if properties.service.ts covers:
# - Property listings ✅ (likely covered)
# - Real estate leads ❓ (may need extension)
# - Transactions ❓ (may need extension)
# - Showings ❓ (may need extension)

# 4. If extensions needed:
export class PropertiesService {
  // ... existing methods
  
  async createRealEstateLead(storeId: string, leadData: any) {
    const lead = await this.db.realEstateLead.create({
      data: { ...leadData, storeId },
    });
    return lead;
  }
  
  async createTransaction(storeId: string, transactionData: any) {
    const tx = await this.db.realEstateTransaction.create({
      data: { ...transactionData, storeId },
    });
    return tx;
  }
}

// 5. Add routes to properties.routes.ts
server.post('/realestate/leads', { ... });
server.post('/realestate/transactions', { ... });

// 6. Delete legacy
rm -rf Backend/core-api/src/app/api/realestate/
```

**Status:** ⏳ PENDING - Requires careful analysis

---

#### 4. **calendar-sync → bookings** (if exists)
**Current State:**
- `Backend/fastify-server/src/services/core/bookings.service.ts` ✅ EXISTS
- `Backend/core-api/src/app/api/calendar-sync/` ⚠️ STILL IN LEGACY

**Action:**
```typescript
// Calendar sync is likely just a booking feature
// Extend bookings service with calendar integration:

export class BookingsService {
  // ... existing methods
  
  async syncWithCalendar(storeId: string, bookingId: string, calendarProvider: 'GOOGLE' | 'OUTLOOK') {
    const booking = await this.db.booking.findUnique({
      where: { id: bookingId },
    });
    
    if (!booking || booking.storeId !== storeId) {
      throw new Error('Booking not found');
    }
    
    // Call Google Calendar API or Outlook API
    // Update booking with calendar event ID
    
    const updated = await this.db.booking.update({
      where: { id: bookingId },
      data: {
        calendarEventId: event.id,
        calendarProvider,
      },
    });
    
    return updated;
  }
}
```

**Status:** ⏳ PENDING

---

#### 5. **grants → nonprofit**
**Current State:**
- `Backend/fastify-server/src/services/platform/nonprofit.service.ts` ✅ EXISTS
- `Backend/core-api/src/app/api/grants/` ⚠️ STILL IN LEGACY

**Action:**
```typescript
// Grants are part of nonprofit management
// Extend nonprofit service:

export class NonprofitService {
  // ... existing methods (donors, donations, campaigns)
  
  async createGrant(storeId: string, grantData: any) {
    const grant = await this.db.grant.create({
      data: { ...grantData, storeId },
    });
    return grant;
  }
  
  async getGrants(storeId: string, filters: any) {
    const grants = await this.db.grant.findMany({
      where: { storeId, ...filters },
    });
    return grants;
  }
}

// Add to nonprofit.routes.ts
server.post('/grants', { ... });
server.get('/grants', { ... });

// Delete legacy
rm -rf Backend/core-api/src/app/api/grants/
```

**Status:** ⏳ PENDING

---

#### 6. **legal + kyc + disputes + appeals → compliance**
**Current State:**
- `Backend/fastify-server/src/services/platform/compliance.service.ts` ✅ EXISTS
- `Backend/core-api/src/app/api/legal/` ⚠️ STILL IN LEGACY
- `Backend/core-api/src/app/api/kyc/` ⚠️ STILL IN LEGACY
- `Backend/core-api/src/app/api/disputes/` ⚠️ STILL IN LEGACY
- `Backend/core-api/src/app/api/appeals/` ⚠️ STILL IN LEGACY

**Analysis:** These were partially consolidated but may need extension

**Action:**
```bash
# 1. Check what's already in compliance.service.ts
grep -n "legal\|kyc\|dispute\|appeal" Backend/fastify-server/src/services/platform/compliance.service.ts

# 2. Read legacy directories to see if anything missing
ls -la Backend/core-api/src/app/api/legal/
ls -la Backend/core-api/src/app/api/kyc/
ls -la Backend/core-api/src/app/api/disputes/
ls -la Backend/core-api/src/app/api/appeals/

# 3. Extend compliance service if needed
export class ComplianceService {
  // ... existing methods
  
  // Legal case management
  async createLegalCase(storeId: string, caseData: any) {
    const legalCase = await this.db.legalCase.create({
      data: { ...caseData, storeId },
    });
    return legalCase;
  }
  
  // Additional KYC methods if needed
  async reviewKycSubmission(kycId: string, reviewerId: string, decision: 'APPROVE' | 'REJECT') {
    // Review logic
  }
}

// 4. Clean up duplicates
```

**Status:** ⏳ PENDING - May already be complete, needs verification

---

#### 7. **onboarding → account or separate service**
**Current State:**
- `Backend/fastify-server/src/services/core/account.service.ts` ✅ EXISTS
- `Backend/core-api/src/app/api/onboarding/` ⚠️ STILL IN LEGACY

**Decision Point:**
Should onboarding be:
- Option A: Part of account service (simpler)
- Option B: Separate onboarding service (if very complex)

**Recommendation:** Start with Option A

```typescript
// Extend account.service.ts
export class AccountService {
  // ... existing methods
  
  async completeOnboardingStep(userId: string, storeId: string, step: string, data: any) {
    const onboarding = await this.db.onboarding.findFirst({
      where: { userId, storeId },
    });
    
    if (!onboarding) {
      // Create initial onboarding record
    }
    
    // Mark step as complete
    const updated = await this.db.onboarding.update({
      where: { id: onboarding.id },
      data: {
        completedSteps: {
          push: step,
        },
        [`${step}CompletedAt`]: new Date(),
      },
    });
    
    return updated;
  }
  
  async getOnboardingProgress(userId: string, storeId: string) {
    const onboarding = await this.db.onboarding.findFirst({
      where: { userId, storeId },
    });
    
    return onboarding || { completedSteps: [], progressPercent: 0 };
  }
}
```

**Status:** ⏳ PENDING

---

## Execution Timeline

### Day 1-2: BFF Extraction - Ops-Console
- [ ] Audit all 154 ops-console routes
- [ ] Categorize by domain
- [ ] Create extraction plan per category
- [ ] Begin extraction (target: 50-75 routes)

### Day 3: BFF Extraction - Storefront
- [ ] Audit all 55 storefront routes
- [ ] Extract to backend (most should already exist)
- [ ] Replace with API client calls
- [ ] Test public/authenticated routes

### Day 4: BFF Completion + Testing
- [ ] Finish remaining ops-console routes
- [ ] Test all extracted routes
- [ ] Remove `@vayva/db` from frontend packages
- [ ] Verify no Prisma imports remain

### Day 5: Service Consolidation
- [ ] menu-items → restaurant
- [ ] box-subscriptions → subscriptions
- [ ] realestate → properties (with extensions)
- [ ] grants → nonprofit
- [ ] legal/kyc/disputes/appeals → compliance (verify)
- [ ] onboarding → account
- [ ] Delete all legacy directories

### Day 6-7: Buffer + Final Testing
- [ ] Comprehensive testing
- [ ] Fix any issues discovered
- [ ] Documentation updates
- [ ] Prepare for deployment

---

## Success Criteria

### BFF Extraction Complete ✅
- [ ] 0 Prisma imports in `Frontend/ops-console/`
- [ ] 0 Prisma imports in `Frontend/storefront/`
- [ ] `@vayva/db` removed from frontend package.json
- [ ] All 209 routes using API client pattern
- [ ] All routes functional and tested

### Consolidation Complete ✅
- [ ] menu-items merged into restaurant service
- [ ] box-subscriptions merged into subscriptions
- [ ] realestate merged into properties (with extensions)
- [ ] grants merged into nonprofit
- [ ] legal/kyc/disputes/appeals verified in compliance
- [ ] onboarding merged into account
- [ ] All legacy directories deleted
- [ ] No duplicate functionality

### Code Quality ✅
- [ ] Consistent patterns across all services
- [ ] No circular dependencies
- [ ] Proper error handling
- [ ] Comprehensive logging
- [ ] TypeScript strict mode compliant

---

## Risk Mitigation

### Risk 1: Breaking Changes During Extraction
**Mitigation:**
- Keep both old and new endpoints running in parallel during migration
- Use feature flags if needed
- Test each route immediately after extraction
- Rollback plan: Revert git commit if critical issue found

### Risk 2: Missing Business Logic
**Mitigation:**
- Carefully read each BFF route before extraction
- Document any complex logic
- Test edge cases thoroughly
- Have domain experts review critical extractions

### Risk 3: Authentication Issues
**Mitigation:**
- Ensure JWT tokens properly passed from frontend
- Test both authenticated and public routes
- Verify CORS configuration
- Check token refresh scenarios

---

## Tools & Scripts

### Helper Script: Find Prisma Imports
```bash
#!/bin/bash
# find-prisma-imports.sh
echo "Searching for Prisma imports in frontend packages..."
grep -r "from '@vayva/db'" Frontend/ops-console/src/
grep -r "from '@vayva/db'" Frontend/storefront/src/
echo "Done!"
```

### Helper Script: Count BFF Routes
```bash
#!/bin/bash
# count-bff-routes.sh
echo "Ops-console BFF routes:"
find Frontend/ops-console/src/app/api -name "route.ts" | wc -l

echo "Storefront BFF routes:"
find Frontend/storefront/src/app/api -name "route.ts" | wc -l

echo "Total BFF routes:"
total=$(($(find Frontend/ops-console/src/app/api -name "route.ts" | wc -l) + $(find Frontend/storefront/src/app/api -name "route.ts" | wc -l)))
echo $total
```

### Helper Script: Check Service Coverage
```bash
#!/bin/bash
# check-service-coverage.sh
echo "Checking if legacy directories have corresponding services..."

for dir in Backend/core-api/src/app/api/*/; do
  dirname=$(basename "$dir")
  if [ -f "Backend/fastify-server/src/services/*/${dirname%.service}.ts" ]; then
    echo "✅ $dirname - Service exists"
  else
    echo "⚠️  $dirname - Service MISSING"
  fi
done
```

---

## Communication Protocol

### Daily Updates
Each branch should report:
```
**BFF Extraction Branch [A/B] Progress - Day [X]**

Completed Today:
- Extracted [N] routes from [category]
- Created/extended [service name]
- Tested [endpoints]

Pending:
- [N] routes remaining in [category]

Blockers:
- [Any issues]

Tomorrow's Plan:
- [What's next]
```

### Return to Main Chat When:
- Each BFF branch completes their allocation
- Consolidation complete
- Ready for final verification

---

## File Templates

### API Client Template
```typescript
// src/lib/api-client.ts
import { getAuthToken } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function request<T>(endpoint: string, options: RequestInit): Promise<T> {
  const token = getAuthToken();
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  };
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

export const apiClient = {
  get<T>(endpoint: string, params?: Record<string, string>) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return request<T>(`${endpoint}${queryString}`, { method: 'GET' });
  },
  
  post<T>(endpoint: string, body: any) {
    return request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
  
  put<T>(endpoint: string, body: any) {
    return request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },
  
  delete<T>(endpoint: string) {
    return request<T>(endpoint, { method: 'DELETE' });
  },
};
```

---

**Ready to execute! Let me know which branch you want to start with.** 🚀
