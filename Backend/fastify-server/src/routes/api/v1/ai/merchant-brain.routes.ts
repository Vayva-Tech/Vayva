import { FastifyPluginAsync } from 'fastify';
import { MerchantBrainService } from '../../../../services/security/merchant-brain.service';
import { z } from 'zod';

const merchantBrainService = new MerchantBrainService();

export const merchantBrainRoutes: FastifyPluginAsync = async (server) => {
  /**
   * POST /api/v1/merchant-brain/describe-image
   * Describe an image using OpenAI Vision
   */
  server.post('/describe-image', {
    preHandler: [server.authenticate],
    schema: {
      body: z.object({
        imageUrl: z.string().url(),
      }),
    },
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const { imageUrl } = request.body;

        const result = await merchantBrainService.describeImage(storeId, imageUrl);

        return reply.send(result);
      } catch (error) {
        server.log.error('[MerchantBrainRoute] Describe image failed', error);
        throw error;
      }
    },
  });

  /**
   * GET /api/v1/merchant-brain/search-catalog
   * Search catalog products
   */
  server.get('/search-catalog', {
    preHandler: [server.authenticate],
    schema: {
      querystring: z.object({
        q: z.string().min(1),
      }),
    },
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const { q } = request.query;

        const result = await merchantBrainService.searchCatalog(storeId, q);

        return reply.send(result);
      } catch (error) {
        server.log.error('[MerchantBrainRoute] Search catalog failed', error);
        throw error;
      }
    },
  });

  /**
   * GET /api/v1/merchant-brain/fulfillment-policy
   * Get store fulfillment policy
   */
  server.get('/fulfillment-policy', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;

        const result = await merchantBrainService.getStoreFulfillmentPolicy(storeId);

        return reply.send(result);
      } catch (error) {
        server.log.error('[MerchantBrainRoute] Fulfillment policy failed', error);
        throw error;
      }
    },
  });

  /**
   * GET /api/v1/merchant-brain/inventory-status
   * Get inventory status for a product
   */
  server.get('/inventory-status', {
    preHandler: [server.authenticate],
    schema: {
      querystring: z.object({
        productId: z.string().uuid(),
      }),
    },
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const { productId } = request.query;

        const result = await merchantBrainService.getInventoryStatus(storeId, productId);

        return reply.send(result);
      } catch (error) {
        server.log.error('[MerchantBrainRoute] Inventory status failed', error);
        throw error;
      }
    },
  });

  /**
   * GET /api/v1/merchant-brain/delivery-quote
   * Get delivery quote v1
   */
  server.get('/delivery-quote', {
    preHandler: [server.authenticate],
    schema: {
      querystring: z.object({
        location: z.string().min(1),
      }),
    },
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const { location } = request.query;

        const result = await merchantBrainService.getDeliveryQuote(storeId, location);

        return reply.send(result);
      } catch (error) {
        server.log.error('[MerchantBrainRoute] Delivery quote failed', error);
        throw error;
      }
    },
  });

  /**
   * GET /api/v1/merchant-brain/delivery-quote-v2
   * Get delivery quote v2 with margin calculation
   */
  server.get('/delivery-quote-v2', {
    preHandler: [server.authenticate],
    schema: {
      querystring: z.object({
        location: z.string().min(1),
      }),
    },
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const { location } = request.query;

        const result = await merchantBrainService.getDeliveryQuoteV2(storeId, location);

        return reply.send(result);
      } catch (error) {
        server.log.error('[MerchantBrainRoute] Delivery quote v2 failed', error);
        throw error;
      }
    },
  });

  /**
   * GET /api/v1/merchant-brain/promotions
   * Get active promotions
   */
  server.get('/promotions', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;

        const promotions = await merchantBrainService.getActivePromotions(storeId);

        return reply.send({ promotions });
      } catch (error) {
        server.log.error('[MerchantBrainRoute] Promotions failed', error);
        throw error;
      }
    },
  });

  /**
   * GET /api/v1/merchant-brain/retrieve-context
   * Retrieve context from knowledge embeddings
   */
  server.get('/retrieve-context', {
    preHandler: [server.authenticate],
    schema: {
      querystring: z.object({
        query: z.string().min(1),
        limit: z.number().optional().default(3),
      }),
    },
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const { query, limit } = request.query;

        const results = await merchantBrainService.retrieveContext(storeId, query, limit);

        return reply.send({ results });
      } catch (error) {
        server.log.error('[MerchantBrainRoute] Retrieve context failed', error);
        throw error;
      }
    },
  });

  /**
   * POST /api/v1/merchant-brain/index-catalog
   * Index store catalog for RAG
   */
  server.post('/index-catalog', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;

        const result = await merchantBrainService.indexStoreCatalog(storeId);

        return reply.send(result);
      } catch (error) {
        server.log.error('[MerchantBrainRoute] Index catalog failed', error);
        throw error;
      }
    },
  });
};
