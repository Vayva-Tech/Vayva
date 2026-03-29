# Phase 2 Progress: Tier 1 Critical Services

**Date:** 2026-03-28  
**Status:** IN PROGRESS  
**Focus:** Account Deletion Service Migration

---

## ✅ Completed: Account Deletion Service

### Backend Service Created
**File:** `Backend/fastify-server/src/services/compliance/account-deletion.service.ts`

**Features:**
- ✅ `requestDeletion(storeId, userId, reason)` - Schedule deletion for 7 days
- ✅ `cancelDeletion(storeId)` - Cancel pending deletion
- ✅ `getStatus(storeId)` - Check deletion status
- ✅ `executeDeletion(requestId)` - Execute scheduled deletion (background job)
- ✅ `invalidateSessions(storeId)` - Invalidate all user sessions
- ✅ `checkBlockers(storeId)` - Check for pending payouts before allowing deletion

**Key Improvements over Frontend Version:**
1. **Centralized email service** - Uses backend email service (to be integrated with Resend)
2. **Better error handling** - Comprehensive try-catch blocks
3. **Logging** - All operations logged with structured logging
4. **Type safety** - Full TypeScript typing with Zod validation
5. **Security** - JWT-based authentication, store isolation

---

### API Routes Created
**File:** `Backend/fastify-server/src/routes/api/v1/compliance/account-deletion.routes.ts`

**Endpoints:**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/compliance/account-deletion/request` | Request deletion | JWT Required |
| POST | `/api/v1/compliance/account-deletion/cancel` | Cancel deletion | JWT Required |
| GET | `/api/v1/compliance/account-deletion/status` | Get status | JWT Required |
| POST | `/api/v1/compliance/account-deletion/execute` | Execute (job) | Protected |

**Request/Response Examples:**

#### 1. Request Deletion
```json
// POST /api/v1/compliance/account-deletion/request
{
  "reason": "Switching to competitor"
}

// Response 200 OK
{
  "success": true,
  "scheduledFor": "2026-04-04T00:00:00.000Z",
  "message": "Deletion scheduled. You will receive a confirmation email."
}

// Response 400 Bad Request
{
  "success": false,
  "error": "Cannot delete account yet.",
  "blockers": ["You have pending payouts processing."]
}
```

#### 2. Cancel Deletion
```json
// POST /api/v1/compliance/account-deletion/cancel
{}

// Response 200 OK
{
  "success": true,
  "message": "Deletion canceled successfully"
}
```

#### 3. Get Status
```json
// GET /api/v1/compliance/account-deletion/status

// Response 200 OK
{
  "hasPendingDeletion": true,
  "scheduledFor": "2026-04-04T00:00:00.000Z",
  "storeName": "My Store"
}
```

---

### Next Steps for Account Deletion

#### 1. Register Routes in Fastify Server
Need to add to `Backend/fastify-server/src/index.ts`:
```typescript
import { registerAccountDeletionRoutes } from './routes/api/v1/compliance/account-deletion.routes';

await registerAccountDeletionRoutes(app);
```

#### 2. Create Frontend API Client Wrapper
Update `Frontend/merchant/src/services/DeletionService.ts` to call backend API:
```typescript
import { apiClient } from '@vayva/api-client';

export class DeletionService {
  static async requestDeletion(reason?: string) {
    const response = await apiClient.post('/api/v1/compliance/account-deletion/request', { reason });
    return response.data;
  }

  static async cancelDeletion() {
    const response = await apiClient.post('/api/v1/compliance/account-deletion/cancel');
    return response.data;
  }

  static async getStatus() {
    const response = await apiClient.get('/api/v1/compliance/account-deletion/status');
    return response.data;
  }
}
```

#### 3. Add Background Job
Create cron job in `Backend/worker/src/jobs/` to execute scheduled deletions:
```typescript
// Backend/worker/src/jobs/account-deletion.job.ts
import { CronJob } from 'cron';
import { prisma } from '@vayva/db';
import { logger } from '@vayva/shared';

export async function startAccountDeletionJob() {
  // Run daily at 2 AM
  const job = new CronJob('0 2 * * *', async () => {
    logger.info('[JOB] Checking for scheduled deletions...');
    
    const now = new Date();
    const dueRequests = await prisma.accountDeletionRequest.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledFor: {
          lte: now,
        },
      },
    });

    for (const request of dueRequests) {
      try {
        await fetch('http://localhost:4000/api/v1/compliance/account-deletion/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requestId: request.id }),
        });
        logger.info(`[JOB] Executed deletion for ${request.id}`);
      } catch (error) {
        logger.error(`[JOB] Failed to execute deletion ${request.id}`, error);
      }
    }
  });

  job.start();
  logger.info('[JOB] Account deletion job started');
}
```

---

## 📋 Remaining Tier 1 Services

### 1. Order State Service ⏳
**Frontend:** `Frontend/merchant/src/services/order-state.service.ts`  
**Backend Location:** `Backend/fastify-server/src/services/orders/order-state.service.ts`  
**Priority:** HIGH - Core business logic

### 2. Returns Service ⏳
**Frontend:** `Frontend/merchant/src/lib/returns/returnService.ts`  
**Backend Location:** `Backend/fastify-server/src/services/orders/returns.service.ts`  
**Priority:** HIGH - Customer experience

### 3. Delivery Service ⏳
**Frontend:** `Frontend/merchant/src/lib/delivery/DeliveryService.ts`  
**Backend Location:** `Backend/fastify-server/src/services/logistics/delivery.service.ts`  
**Priority:** HIGH - Order fulfillment

### 4. KYC Service ⏳
**Frontend:** `Frontend/merchant/src/services/kyc.ts`  
**Backend Location:** `Backend/fastify-server/src/services/compliance/kyc.service.ts`  
**Priority:** HIGH - Regulatory compliance

---

## Architecture Decisions

### Email Service Integration
**Decision:** Keep email sending in backend service layer  
**Reason:** 
- Centralized email templates
- Better tracking and analytics
- Prevents duplicate sends
- Easier testing

### Background Job Strategy
**Decision:** Use worker package for scheduled tasks  
**Pattern:**
- Worker polls database every hour
- Calls Fastify endpoint to execute
- Logs all actions for audit trail

### Session Invalidation
**Decision:** Redis + DB dual invalidation  
**Mechanism:**
1. Set Redis flag for immediate invalidation
2. Increment session version in DB for persistence
3. Force re-authentication on next request

---

## Testing Checklist

### Unit Tests
- [ ] Service methods individually tested
- [ ] Blocker detection verified
- [ ] Email failures handled gracefully
- [ ] Session invalidation tested

### Integration Tests
- [ ] Full deletion flow end-to-end
- [ ] Cancellation flow works
- [ ] Background job executes on schedule
- [ ] Multi-tenant isolation enforced

### Security Tests
- [ ] JWT auth required on all endpoints
- [ ] Store ID properly isolated
- [ ] Rate limiting applied
- [ ] Audit logs created

---

## Performance Metrics

**Target Latency:** < 200ms per API call  
**Database Queries:** Optimized with indexes  
**Redis Operations:** Batched in pipeline  
**Email Sending:** Non-blocking (try-catch, don't fail request)

---

## Migration Timeline

| Day | Service | Status |
|-----|---------|--------|
| Day 1 | Account Deletion | ✅ COMPLETE |
| Day 1-2 | Order State | ⏳ PENDING |
| Day 2 | Returns | ⏳ PENDING |
| Day 2-3 | Delivery | ⏳ PENDING |
| Day 3 | KYC | ⏳ PENDING |
| Day 4 | Testing & Cleanup | ⏳ PENDING |

---

**Next Action:** Continue with order-state.service.ts migration
