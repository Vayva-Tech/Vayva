import { FastifyPluginAsync } from 'fastify';
import { FinanceService } from '../../../../services/platform/finance.service';

const financeService = new FinanceService();

export const financeRoutes: FastifyPluginAsync = async (server) => {
  /**
   * GET /api/v1/finance/overview
   * Get comprehensive financial overview including wallet, revenue data, and KPIs
   */
  server.get('/overview', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        
        if (!storeId) {
          return reply.code(400).send({ 
            success: false, 
            error: { code: 'MISSING_STORE_ID', message: 'Store ID is required' } 
          });
        }
        
        const overview = await financeService.getOverview(storeId);
        
        return reply.send({ 
          success: true, 
          data: overview 
        });
      } catch (error) {
        server.log.error({ error, storeId: (request.user as any).storeId }, 'Error fetching finance overview');
        return reply.code(500).send({ 
          success: false, 
          error: { code: 'FINANCE_OVERVIEW_ERROR', message: 'Failed to fetch financial overview' } 
        });
      }
    },
  });

  /**
   * GET /api/v1/finance/transactions
   * Get unified transaction history (payments, payouts, refunds)
   */
  server.get('/transactions', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const query = request.query as any;
        
        if (!storeId) {
          return reply.code(400).send({ 
            success: false, 
            error: { code: 'MISSING_STORE_ID', message: 'Store ID is required' } 
          });
        }
        
        const limit = query.limit ? parseInt(query.limit, 10) : 50;
        const validatedLimit = Math.min(Math.max(limit, 1), 100); // Clamp between 1-100
        
        const transactions = await financeService.getTransactions(storeId, validatedLimit);
        
        return reply.send({ 
          success: true, 
          data: transactions 
        });
      } catch (error) {
        server.log.error({ error, storeId: (request.user as any).storeId }, 'Error fetching transactions');
        return reply.code(500).send({ 
          success: false, 
          error: { code: 'TRANSACTIONS_ERROR', message: 'Failed to fetch transactions' } 
        });
      }
    },
  });

  /**
   * GET /api/v1/finance/payouts
   * Get payout history with filtering
   */
  server.get('/payouts', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const query = request.query as any;
        
        if (!storeId) {
          return reply.code(400).send({ 
            success: false, 
            error: { code: 'MISSING_STORE_ID', message: 'Store ID is required' } 
          });
        }
        
        const filters = {
          status: query.status,
          limit: query.limit ? parseInt(query.limit, 10) : 20,
          offset: query.offset ? parseInt(query.offset, 10) : 0,
        };
        
        const validatedLimit = Math.min(Math.max(filters.limit, 1), 100);
        const validatedOffset = Math.max(filters.offset, 0);
        
        const payouts = await financeService.getPayouts(storeId, {
          ...filters,
          limit: validatedLimit,
          offset: validatedOffset,
        });
        
        return reply.send({ 
          success: true, 
          data: payouts 
        });
      } catch (error) {
        server.log.error({ error, storeId: (request.user as any).storeId }, 'Error fetching payouts');
        return reply.code(500).send({ 
          success: false, 
          error: { code: 'PAYOUTS_ERROR', message: 'Failed to fetch payouts' } 
        });
      }
    },
  });

  /**
   * GET /api/v1/finance/wallet
   * Get wallet details including virtual account information
   */
  server.get('/wallet', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        
        if (!storeId) {
          return reply.code(400).send({ 
            success: false, 
            error: { code: 'MISSING_STORE_ID', message: 'Store ID is required' } 
          });
        }
        
        const wallet = await financeService.getWallet(storeId);
        
        return reply.send({ 
          success: true, 
          data: wallet 
        });
      } catch (error) {
        server.log.error({ error, storeId: (request.user as any).storeId }, 'Error fetching wallet');
        return reply.code(500).send({ 
          success: false, 
          error: { code: 'WALLET_ERROR', message: 'Failed to fetch wallet' } 
        });
      }
    },
  });

  /**
   * GET /api/v1/finance/stats
   * Get financial statistics and metrics
   */
  server.get('/stats', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const query = request.query as any;
        
        if (!storeId) {
          return reply.code(400).send({ 
            success: false, 
            error: { code: 'MISSING_STORE_ID', message: 'Store ID is required' } 
          });
        }
        
        const range = query.range || 'month';
        const validRanges = ['today', 'week', 'month', 'year'];
        const validatedRange = validRanges.includes(range) ? range : 'month';
        
        const stats = await financeService.getStats(storeId, validatedRange as 'today' | 'week' | 'month' | 'year');
        
        return reply.send({ 
          success: true, 
          data: stats 
        });
      } catch (error) {
        server.log.error({ error, storeId: (request.user as any).storeId }, 'Error fetching finance stats');
        return reply.code(500).send({ 
          success: false, 
          error: { code: 'STATS_ERROR', message: 'Failed to fetch financial statistics' } 
        });
      }
    },
  });

  /**
   * POST /api/v1/finance/payout/request
   * Request a payout withdrawal
   */
  server.post('/payout/request', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const body = request.body as any;
        
        if (!storeId) {
          return reply.code(400).send({ 
            success: false, 
            error: { code: 'MISSING_STORE_ID', message: 'Store ID is required' } 
          });
        }
        
        const { amount, bankAccountId } = body;
        
        if (!amount || typeof amount !== 'number' || amount <= 0) {
          return reply.code(400).send({ 
            success: false, 
            error: { code: 'INVALID_AMOUNT', message: 'Valid amount is required' } 
          });
        }
        
        const result = await financeService.requestPayout(storeId, amount, bankAccountId);
        
        return reply.code(201).send({ 
          success: true, 
          data: result 
        });
      } catch (error) {
        server.log.error({ error, storeId: (request.user as any).storeId }, 'Error requesting payout');
        
        if ((error as any).code === 'INSUFFICIENT_BALANCE') {
          return reply.code(400).send({ 
            success: false, 
            error: { code: 'INSUFFICIENT_BALANCE', message: 'Insufficient wallet balance' } 
          });
        }
        
        return reply.code(500).send({ 
          success: false, 
          error: { code: 'PAYOUT_REQUEST_ERROR', message: 'Failed to process payout request' } 
        });
      }
    },
  });
};
