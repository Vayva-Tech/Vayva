import { FastifyPluginAsync } from 'fastify';
import { CheckoutService } from '../../../../services/commerce/checkout.service';

const checkoutService = new CheckoutService();

export const checkoutRoutes: FastifyPluginAsync = async (server) => {
  /**
   * POST /api/v1/checkouts/initialize
   * Initialize checkout from cart
   */
  server.post('/initialize', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { cartId, customerId, ...checkoutData } = request.body as any;

      try {
        const checkout = await checkoutService.initializeCheckout(
          cartId,
          storeId,
          customerId,
          checkoutData
        );
        return reply.code(201).send({ success: true, data: checkout });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to initialize checkout' 
        });
      }
    },
  });

  /**
   * PUT /api/v1/checkouts/:id
   * Update checkout information
   */
  server.put('/:checkoutId', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { checkoutId } = request.params as any;
      const updates = request.body as any;

      try {
        const updated = await checkoutService.updateCheckout(checkoutId, storeId, updates);
        return reply.send({ success: true, data: updated });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to update checkout' 
        });
      }
    },
  });

  /**
   * POST /api/v1/checkouts/:id/process
   * Process checkout and create order
   */
  server.post('/:checkoutId/process', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { checkoutId } = request.params as any;
      const paymentResult = request.body as any;

      try {
        const result = await checkoutService.processCheckout(checkoutId, storeId, paymentResult);
        return reply.send(result);
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to process checkout' 
        });
      }
    },
  });

  /**
   * POST /api/v1/checkouts/:id/cancel
   * Cancel checkout
   */
  server.post('/:checkoutId/cancel', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { checkoutId } = request.params as any;
      const { reason } = request.body as any;

      try {
        const result = await checkoutService.cancelCheckout(checkoutId, storeId, reason);
        return reply.send(result);
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to cancel checkout' 
        });
      }
    },
  });

  /**
   * GET /api/v1/checkouts/:id
   * Get checkout by ID
   */
  server.get('/:checkoutId', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { checkoutId } = request.params as any;

      const checkout = await checkoutService.getCheckoutById(checkoutId, storeId);
      
      if (!checkout) {
        return reply.code(404).send({ success: false, error: 'Checkout not found' });
      }

      return reply.send({ success: true, data: checkout });
    },
  });

  /**
   * GET /api/v1/checkouts
   * Get store checkouts
   */
  server.get('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
        status: query.status,
        fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
        toDate: query.toDate ? new Date(query.toDate) : undefined,
      };

      const result = await checkoutService.getStoreCheckouts(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  /**
   * GET /api/v1/checkouts/stats
   * Get checkout statistics
   */
  server.get('/stats', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const period = {
        from: query.fromDate ? new Date(query.fromDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        to: query.toDate ? new Date(query.toDate) : new Date(),
      };

      const stats = await checkoutService.getCheckoutStats(storeId, period);
      return reply.send({ success: true, data: stats });
    },
  });
};
