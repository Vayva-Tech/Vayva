import { FastifyPluginAsync } from 'fastify';
import { WalletService } from '../../../../services/financial/wallet.service';

const walletService = new WalletService();

export const walletRoutes: FastifyPluginAsync = async (server) => {
  /**
   * GET /api/v1/wallet
   * Get or create wallet for customer
   */
  server.get('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const customerId = (request.query as any).customerId;

      const wallet = await walletService.getOrCreateWallet(storeId, customerId);
      return reply.send({ success: true, data: wallet });
    },
  });

  /**
   * GET /api/v1/wallet/:id
   * Get wallet by ID
   */
  server.get('/:walletId', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { walletId } = request.params as any;

      const wallet = await walletService.getWalletById(walletId, storeId);
      
      if (!wallet) {
        return reply.code(404).send({ success: false, error: 'Wallet not found' });
      }

      return reply.send({ success: true, data: wallet });
    },
  });

  /**
   * POST /api/v1/wallet/credit
   * Credit wallet
   */
  server.post('/credit', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { walletId, amount, metadata } = request.body as any;

      try {
        const transaction = await walletService.creditWallet(walletId, storeId, amount, metadata);
        return reply.code(201).send({ success: true, data: transaction });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to credit wallet' 
        });
      }
    },
  });

  /**
   * POST /api/v1/wallet/debit
   * Debit wallet
   */
  server.post('/debit', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { walletId, amount, metadata } = request.body as any;

      try {
        const transaction = await walletService.debitWallet(walletId, storeId, amount, metadata);
        return reply.code(201).send({ success: true, data: transaction });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to debit wallet' 
        });
      }
    },
  });

  /**
   * POST /api/v1/wallet/transfer
   * Transfer between wallets
   */
  server.post('/transfer', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { fromWalletId, toWalletId, amount, metadata } = request.body as any;

      try {
        await walletService.transferWallets(fromWalletId, toWalletId, storeId, amount, metadata);
        return reply.send({ success: true });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Transfer failed' 
        });
      }
    },
  });

  /**
   * POST /api/v1/wallet/virtual-account
   * Create virtual account
   */
  server.post('/virtual-account', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { walletId } = request.body as any;

      try {
        const account = await walletService.createVirtualAccount(walletId, storeId);
        return reply.code(201).send({ success: true, data: account });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create virtual account' 
        });
      }
    },
  });

  /**
   * GET /api/v1/wallet/transactions/:walletId
   * Get wallet transactions
   */
  server.get('/transactions/:walletId', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { walletId } = request.params as any;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
        type: query.type as 'CREDIT' | 'DEBIT',
        fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
        toDate: query.toDate ? new Date(query.toDate) : undefined,
      };

      const result = await walletService.getWalletTransactions(walletId, storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  /**
   * POST /api/v1/wallet/pin/set
   * Set wallet PIN
   */
  server.post('/pin/set', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { walletId, pinHash } = request.body as any;

      try {
        await walletService.setWalletPin(walletId, storeId, pinHash);
        return reply.send({ success: true });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to set PIN' 
        });
      }
    },
  });

  /**
   * POST /api/v1/wallet/withdraw/initiate
   * Initiate withdrawal
   */
  server.post('/withdraw/initiate', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { walletId, amount, bankCode, accountNumber, accountName } = request.body as any;

      try {
        const withdrawal = await walletService.initiateWithdrawal(walletId, storeId, amount, {
          bankCode,
          accountNumber,
          accountName,
        });
        return reply.code(201).send({ success: true, data: withdrawal });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to initiate withdrawal' 
        });
      }
    },
  });

  /**
   * POST /api/v1/wallet/withdraw/confirm
   * Confirm withdrawal
   */
  server.post('/withdraw/confirm', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { withdrawalId } = request.body as any;

      try {
        await walletService.confirmWithdrawal(withdrawalId, storeId);
        return reply.send({ success: true });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to confirm withdrawal' 
        });
      }
    },
  });

  /**
   * GET /api/v1/wallet/stats
   * Get wallet statistics
   */
  server.get('/stats', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const stats = await walletService.getWalletStats(storeId);
      return reply.send({ success: true, data: stats });
    },
  });
};
