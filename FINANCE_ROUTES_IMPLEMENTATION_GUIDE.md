# 🔧 Finance Routes Implementation Guide

**Priority**: 🔴 **CRITICAL - Fix Within 48 Hours**  
**Status**: Ready to Implement  
**Estimated Effort**: 4 hours

---

## 📋 OVERVIEW

The Finance dashboard is currently non-functional because the backend routes file is missing. The service exists (`finance.service.ts`) but has no HTTP endpoints registered in Fastify.

---

## 🎯 IMPLEMENTATION STEPS

### Step 1: Create Finance Routes File

**File Location**: `Backend/fastify-server/src/routes/api/v1/platform/finance.routes.ts`

```typescript
import { FastifyPluginAsync } from 'fastify';
import { FinanceService } from '../../../services/platform/finance.service';

const financeService = new FinanceService();

export const financeRoutes: FastifyPluginAsync = async (server) => {
  /**
   * GET /api/v1/finance/overview
   * Get comprehensive financial overview
   */
  server.get('/overview', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        
        const overview = await financeService.getOverview(storeId);
        
        return reply.send({ 
          success: true, 
          data: overview 
        });
      } catch (error) {
        server.log.error(error);
        return reply.code(500).send({ 
          success: false, 
          error: { code: 'FINANCE_OVERVIEW_ERROR', message: 'Failed to fetch financial overview' } 
        });
      }
    },
  });

  /**
   * GET /api/v1/finance/transactions
   * Get unified transaction history
   */
  server.get('/transactions', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const query = request.query as any;
        
        const limit = query.limit ? parseInt(query.limit, 10) : 50;
        
        const transactions = await financeService.getTransactions(storeId, limit);
        
        return reply.send({ 
          success: true, 
          data: transactions 
        });
      } catch (error) {
        server.log.error(error);
        return reply.code(500).send({ 
          success: false, 
          error: { code: 'TRANSACTIONS_ERROR', message: 'Failed to fetch transactions' } 
        });
      }
    },
  });

  /**
   * GET /api/v1/finance/payouts
   * Get payout history
   */
  server.get('/payouts', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const query = request.query as any;
        
        const filters = {
          status: query.status,
          limit: query.limit ? parseInt(query.limit, 10) : 20,
          offset: query.offset ? parseInt(query.offset, 10) : 0,
        };
        
        const payouts = await financeService.getPayouts(storeId, filters);
        
        return reply.send({ 
          success: true, 
          data: payouts 
        });
      } catch (error) {
        server.log.error(error);
        return reply.code(500).send({ 
          success: false, 
          error: { code: 'PAYOUTS_ERROR', message: 'Failed to fetch payouts' } 
        });
      }
    },
  });

  /**
   * GET /api/v1/finance/wallet
   * Get wallet details
   */
  server.get('/wallet', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        
        const wallet = await financeService.getWallet(storeId);
        
        return reply.send({ 
          success: true, 
          data: wallet 
        });
      } catch (error) {
        server.log.error(error);
        return reply.code(500).send({ 
          success: false, 
          error: { code: 'WALLET_ERROR', message: 'Failed to fetch wallet' } 
        });
      }
    },
  });

  /**
   * GET /api/v1/finance/stats
   * Get financial statistics
   */
  server.get('/stats', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const query = request.query as any;
        
        const range = query.range || 'month';
        
        const stats = await financeService.getStats(storeId, range as 'today' | 'week' | 'month');
        
        return reply.send({ 
          success: true, 
          data: stats 
        });
      } catch (error) {
        server.log.error(error);
        return reply.code(500).send({ 
          success: false, 
          error: { code: 'STATS_ERROR', message: 'Failed to fetch financial stats' } 
        });
      }
    },
  });
};
```

---

### Step 2: Register Routes in Fastify Server

**File Location**: `Backend/fastify-server/src/index.ts`

Find the section where routes are registered (around line 339-355) and add:

```typescript
// Add this line with other route registrations
await server.register(financeRoutes, { prefix: '/api/v1/finance' });
```

**Import at the top of the file**:

```typescript
// Add this import with other route imports
import { financeRoutes } from './routes/api/v1/platform/finance.routes';
```

---

### Step 3: Update Frontend API Calls

**File Location**: `Frontend/merchant/src/app/(dashboard)/dashboard/finance/page.tsx`

Update the SWR hook call:

```typescript
// CHANGE FROM:
const { data, error, isLoading } = useSWR<FinanceData>(
  '/api/finance/overview',  // ❌ Old path
  fetcher,
  { revalidateOnFocus: false, dedupingInterval: 30000 }
);

// CHANGE TO:
const { data, error, isLoading } = useSWR<FinanceData>(
  '/api/v1/finance/overview',  // ✅ New path matching Fastify pattern
  fetcher,
  { revalidateOnFocus: false, dedupingInterval: 30000 }
);
```

**Check all other finance-related API calls** in the component and update:
- `/api/finance/transactions` → `/api/v1/finance/transactions`
- `/api/finance/payouts` → `/api/v1/finance/payouts`
- `/api/finance/wallet` → `/api/v1/finance/wallet`
- `/api/finance/stats` → `/api/v1/finance/stats`

---

### Step 4: Verify Service Methods

**File Location**: `Backend/fastify-server/src/services/platform/finance.service.ts`

Ensure these methods exist:

```typescript
export class FinanceService {
  constructor(private readonly db = prisma) {}

  async getOverview(storeId: string) { /* ... */ }
  async getTransactions(storeId: string, limit: number) { /* ... */ }
  async getPayouts(storeId: string, filters: any) { /* ... */ }
  async getWallet(storeId: string) { /* ... */ }
  async getStats(storeId: string, range: string) { /* ... */ }
}
```

If any methods are missing, implement them based on the frontend requirements.

---

## 🧪 TESTING CHECKLIST

### Manual Testing

1. **Start the Fastify server**
   ```bash
   cd Backend/fastify-server
   pnpm dev
   ```

2. **Test each endpoint with curl or Postman**

   ```bash
   # Test overview endpoint
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
        http://localhost:3001/api/v1/finance/overview

   # Test transactions endpoint
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
        http://localhost:3001/api/v1/finance/transactions

   # Test payouts endpoint
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
        http://localhost:3001/api/v1/finance/payouts

   # Test wallet endpoint
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
        http://localhost:3001/api/v1/finance/wallet

   # Test stats endpoint
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
        http://localhost:3001/api/v1/finance/stats
   ```

3. **Verify authentication is required**
   - Try calling endpoints without JWT token
   - Should return 401 Unauthorized

4. **Test with invalid store ID**
   - Should handle gracefully with appropriate error

5. **Test frontend integration**
   - Navigate to `/dashboard/finance`
   - Verify data loads correctly
   - Check browser console for errors
   - Test refresh functionality

### Automated Testing (Optional but Recommended)

Create test file: `Backend/fastify-server/src/__tests__/finance.routes.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildServer } from '../../server';
import { FastifyInstance } from 'fastify';

describe('Finance Routes', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = await buildServer();
  });

  afterAll(async () => {
    await server.close();
  });

  it('GET /api/v1/finance/overview should require authentication', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/v1/finance/overview',
    });
    
    expect(response.statusCode).toBe(401);
  });

  // Add more tests...
});
```

---

## ✅ VERIFICATION CHECKLIST

After implementation, verify:

- [ ] Finance routes file created
- [ ] Routes imported in index.ts
- [ ] Routes registered with correct prefix
- [ ] All 5 endpoints respond
- [ ] Authentication working
- [ ] Error handling implemented
- [ ] Frontend API calls updated
- [ ] Finance dashboard loads data
- [ ] No console errors
- [ ] Type safety maintained
- [ ] Logging implemented
- [ ] Tests passing (if written)

---

## 🐛 TROUBLESHOOTING

### Issue: Routes not found (404)
**Solution**: Check that routes are registered in index.ts with correct prefix

### Issue: Authentication fails
**Solution**: Verify JWT plugin is configured and authenticate decorator exists

### Issue: Service methods undefined
**Solution**: Check FinanceService exports and method signatures

### Issue: Frontend still can't fetch
**Solution**: 
1. Verify API base URL configuration
2. Check CORS settings allow frontend origin
3. Ensure JWT token is being sent in headers

### Issue: TypeScript errors
**Solution**: 
1. Run `pnpm typecheck` to see all errors
2. Add proper type annotations
3. Import types from shared package if available

---

## 📊 EXPECTED RESULTS

After successful implementation:

✅ Finance dashboard fully functional  
✅ All endpoints respond with proper data  
✅ Authentication working correctly  
✅ Frontend displays financial data  
✅ No console errors  
✅ Type safety maintained  

---

## 🔄 NEXT STEPS

After fixing finance routes:

1. **Product Management Backend** (8-12 hours)
2. **Education Backend Audit** (12-16 hours)
3. **Healthcare Compliance** (6-8 hours)

See [`MERCHANT_ADMIN_AUDIT_EXECUTIVE_SUMMARY.md`](./MERCHANT_ADMIN_AUDIT_EXECUTIVE_SUMMARY.md) for complete prioritization.

---

**Ready to implement?** Start with Step 1 and work through systematically. Each step builds on the previous one.
