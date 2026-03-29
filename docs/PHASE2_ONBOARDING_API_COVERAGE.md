# Phase 2: Onboarding Flow Refactor - API Coverage Tracking

## Backend Endpoints Status

### ✅ Completed Endpoints (Fastify Server)

All endpoints are registered at `/api/v1/onboarding` prefix in the Fastify backend.

#### Core Endpoints
- [x] `GET /api/v1/onboarding/state` - Get current onboarding state
  - **Schema**: Returns `{ success: boolean, data: OnboardingData, currentStepKey: string, status: string }`
  - **Auth**: Required (storeId from JWT)
  - **Status**: ✅ IMPLEMENTED
  
- [x] `PUT /api/v1/onboarding/state` - Update onboarding state (save progress)
  - **Schema**: Body `{ data?: object, step?: string, isComplete?: boolean, status?: string }`
  - **Validation**: Zod schema
  - **Status**: ✅ IMPLEMENTED

- [x] `POST /api/v1/onboarding/complete` - Mark onboarding as complete
  - **Schema**: Body `{ data: OnboardingData }`
  - **Validation**: Requires KYC verification
  - **Status**: ✅ IMPLEMENTED

#### Advanced Endpoints
- [x] `POST /api/v1/onboarding/skip` - Skip optional steps (Pro/Pro+ only)
  - **Schema**: Body `{ stepId?: string, reason?: string }`
  - **Validation**: Checks subscription tier (TODO: enforce in production)
  - **Status**: ✅ IMPLEMENTED

- [x] `GET /api/v1/onboarding/industry-presets/:slug` - Get industry-specific configuration
  - **Schema**: Params `{ slug: string }`
  - **Returns**: Industry-specific tools, policies, KPIs
  - **Status**: ✅ IMPLEMENTED

- [x] `PATCH /api/v1/onboarding/:step` - Complete specific onboarding step
  - **Schema**: Params `{ step: string }`, Body `{ data?: object }`
  - **Status**: ✅ IMPLEMENTED

---

## Frontend API Client Integration

### Current Endpoint Mappings

The frontend currently calls these endpoints (from `OnboardingContext.tsx`):

| Frontend Call | Backend Endpoint | Status |
|--------------|------------------|--------|
| `GET /api/onboarding/state` | `GET /api/v1/onboarding/state` | ⚠️ PATH MISMATCH |
| `PUT /api/onboarding/state` | `PUT /api/v1/onboarding/state` | ⚠️ PATH MISMATCH |
| `POST /api/merchant/onboarding/complete` | `POST /api/v1/onboarding/complete` | ⚠️ PATH MISMATCH |

### Required Frontend Updates

**CRITICAL**: The frontend API client needs to be updated to use the correct paths with `/api/v1/` prefix.

Update required in:
- `Frontend/merchant/src/components/onboarding/OnboardingContext.tsx`
- `Frontend/merchant/src/services/onboarding.ts`

---

## Backend Service Methods

### OnboardingService (`Backend/fastify-server/src/services/platform/onboarding.service.ts`)

- [x] `getState(storeId: string)` - Fetch complete onboarding state
- [x] `updateState(storeId, data, step, isComplete, status)` - Update progress
- [x] `completeOnboarding(storeId, data)` - Finalize onboarding with KYC check
- [x] `skipStep(storeId, stepId, reason)` - Handle step skipping
- [x] `getIndustryPresets(slug: string)` - Return industry config
- [x] `completeStep(storeId, step, data)` - Mark individual step complete

---

## Testing Checklist

### Backend Verification (TODO)
- [ ] Test `GET /api/v1/onboarding/state` with valid auth token
- [ ] Test `PUT /api/v1/onboarding/state` with sample data
- [ ] Test `POST /api/v1/onboarding/complete` with KYC data
- [ ] Test `POST /api/v1/onboarding/skip` with different subscription tiers
- [ ] Test `GET /api/v1/onboarding/industry-presets/retail`
- [ ] Test `PATCH /api/v1/onboarding/identity` with identity data
- [ ] Verify rate limiting on all endpoints
- [ ] Verify input validation with invalid data
- [ ] Check error responses match frontend expectations

### Frontend Integration (TODO)
- [ ] Update API paths to include `/v1/` prefix
- [ ] Test full onboarding flow (welcome → review)
- [ ] Verify state persistence across page reloads
- [ ] Test step validation logic
- [ ] Verify industry preset loading
- [ ] Test skip functionality for Pro users
- [ ] Test completion with KYC data
- [ ] Verify analytics events fire correctly

---

## Data Models

### MerchantOnboarding Table Schema

```prisma
model MerchantOnboarding {
  id             String   @id @default(cuid())
  storeId        String   @unique
  status         String   @default("IN_PROGRESS") // NOT_STARTED, IN_PROGRESS, COMPLETE, TRIAL_MODE
  currentStepKey String   @default("welcome")
  completedSteps String[]
  data           Json     // Stores all step data
  schemaVersion  Int      @default(1)
  industrySlug   String?
  kycStatus      String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  completedAt    DateTime?
  
  store          Store    @relation(fields: [storeId], references: [id])
}
```

### OnboardingData Interface

```typescript
interface OnboardingData {
  identity?: {
    fullName?: string;
    phone?: string;
    email?: string;
  };
  business?: {
    storeName?: string;
    country?: string;
    storeSlug?: string;
  };
  industrySlug?: string;
  tools?: string[];
  finance?: {
    bankName?: string;
    accountNumber?: string;
  };
  kyc?: {
    nin?: string;
    bvn?: string;
  };
  socials?: {
    instagram?: string;
    whatsapp?: string;
  };
  [key: string]: any;
}
```

---

## Next Steps

1. **Update Frontend API Paths** - Change all `/api/onboarding/*` to `/api/v1/onboarding/*`
2. **Test Backend Endpoints** - Use curl or Postman to verify each endpoint
3. **Create Frontend Hooks** - Extract onboarding logic into reusable hooks
4. **Refactor Step Components** - Break down monolithic step components
5. **Implement Industry Presets UI** - Show industry-specific recommendations

---

## Blockers

None at this time. Backend endpoints are ready for testing.

---

**Last Updated**: 2026-03-27
**Status**: Backend Implementation Complete ✅, Frontend Integration Pending ⏳
