import { FastifyPluginAsync } from 'fastify';
import { RetailService } from '../../../services/industry/retail.service';

const retailService = new RetailService();

export const retailRoutes: FastifyPluginAsync = async (server) => {
  server.get('/gift-cards', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
        status: query.status,
      };

      const result = await retailService.getGiftCards(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.post('/gift-cards/issue', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const giftCardData = request.body as any;

      try {
        const giftCard = await retailService.issueGiftCard(storeId, giftCardData);
        return reply.code(201).send({ success: true, data: giftCard });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to issue gift card' 
        });
      }
    },
  });

  server.post('/gift-cards/:id/redeem', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;
      const { amount } = request.body as any;

      try {
        const redemption = await retailService.redeemGiftCard(id, storeId, amount);
        return reply.send({ success: true, data: redemption });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to redeem gift card' 
        });
      }
    },
  });

  server.get('/customers/segments', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const segments = await retailService.getCustomerSegments(storeId);
      return reply.send({ success: true, data: segments });
    },
  });

  server.post('/customers/segments', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const segmentData = request.body as any;

      try {
        const segment = await retailService.createCustomerSegment(storeId, segmentData);
        return reply.code(201).send({ success: true, data: segment });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create segment' 
        });
      }
    },
  });

  server.get('/loyalty/tiers', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const tiers = await retailService.getLoyaltyTiers(storeId);
      return reply.send({ success: true, data: tiers });
    },
  });

  server.get('/loyalty/points-transactions', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
        customerId: query.customerId,
        type: query.type,
      };

      const result = await retailService.getLoyaltyPointsTransactions(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.post('/loyalty/points-transactions', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const transactionData = request.body as any;

      try {
        const transaction = await retailService.awardLoyaltyPoints(storeId, transactionData);
        return reply.code(201).send({ success: true, data: transaction });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to award points' 
        });
      }
    },
  });

  server.get('/stores', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const stores = await retailService.getStores(storeId);
      return reply.send({ success: true, data: stores });
    },
  });

  server.post('/stores', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const storeData = request.body as any;

      try {
        const store = await retailService.createStore(storeId, storeData);
        return reply.code(201).send({ success: true, data: store });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create store' 
        });
      }
    },
  });

  server.get('/stores/:id/performance', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      const performance = await retailService.getStorePerformance(storeId, id);
      return reply.send({ success: true, data: performance });
    },
  });

  server.get('/dashboard', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const stats = await retailService.getRetailStats(storeId);
      return reply.send({ success: true, data: stats });
    },
  });
};
