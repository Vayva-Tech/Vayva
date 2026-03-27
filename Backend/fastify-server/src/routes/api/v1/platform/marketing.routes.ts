import { FastifyPluginAsync } from 'fastify';
import { MarketingService } from '../../../services/platform/marketing.service';

const marketingService = new MarketingService();

export const marketingRoutes: FastifyPluginAsync = async (server) => {
  server.get('/flash-sales', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const flashSales = await marketingService.getFlashSales(storeId);
      return reply.send({ success: true, data: flashSales });
    },
  });

  server.post('/flash-sales', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const saleData = request.body as any;

      try {
        const flashSale = await marketingService.createFlashSale(storeId, saleData);
        return reply.code(201).send({ success: true, data: flashSale });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create flash sale' 
        });
      }
    },
  });

  server.put('/flash-sales/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;
      const updates = request.body as any;

      try {
        const flashSale = await marketingService.updateFlashSale(id, storeId, updates);
        return reply.send({ success: true, data: flashSale });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to update flash sale' 
        });
      }
    },
  });

  server.get('/discounts', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const discounts = await marketingService.getDiscounts(storeId);
      return reply.send({ success: true, data: discounts });
    },
  });

  server.post('/discounts', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const discountData = request.body as any;

      try {
        const discount = await marketingService.createDiscount(storeId, discountData);
        return reply.code(201).send({ success: true, data: discount });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create discount' 
        });
      }
    },
  });

  server.put('/discounts/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;
      const updates = request.body as any;

      try {
        const discount = await marketingService.updateDiscount(id, storeId, updates);
        return reply.send({ success: true, data: discount });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to update discount' 
        });
      }
    },
  });

  server.get('/affiliates', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const affiliates = await marketingService.getAffiliates(storeId);
      return reply.send({ success: true, data: affiliates });
    },
  });

  server.post('/affiliates', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const affiliateData = request.body as any;

      try {
        const affiliate = await marketingService.createAffiliate(storeId, affiliateData);
        return reply.code(201).send({ success: true, data: affiliate });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create affiliate' 
        });
      }
    },
  });

  server.post('/affiliates/referrals', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { affiliateId, customerId, orderId } = request.body as any;

      try {
        const referral = await marketingService.trackAffiliateReferral(affiliateId, customerId, orderId);
        return reply.code(201).send({ success: true, data: referral });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to track referral' 
        });
      }
    },
  });
};
