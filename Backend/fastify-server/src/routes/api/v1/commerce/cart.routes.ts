import { FastifyPluginAsync } from 'fastify';
import { CartService } from '../../../../services/commerce/cart.service';

const cartService = new CartService();

export const cartRoutes: FastifyPluginAsync = async (server) => {
  /**
   * GET /api/v1/carts
   * Get or create cart
   */
  server.get('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;
      
      const customerId = query.customerId;
      const sessionId = query.sessionId;

      const cart = await cartService.getOrCreateCart(storeId, customerId, sessionId);
      return reply.send({ success: true, data: cart });
    },
  });

  /**
   * GET /api/v1/carts/:id
   * Get cart by ID
   */
  server.get('/:cartId', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { cartId } = request.params as any;

      const cart = await cartService.getCartById(cartId, storeId);
      
      if (!cart) {
        return reply.code(404).send({ success: false, error: 'Cart not found' });
      }

      return reply.send({ success: true, data: cart });
    },
  });

  /**
   * POST /api/v1/carts/items
   * Add item to cart
   */
  server.post('/items', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { cartId, productId, variantId, quantity, customPrice, metadata } = request.body as any;

      try {
        const item = await cartService.addItemToCart(cartId, storeId, {
          productId,
          variantId,
          quantity,
          customPrice,
          metadata,
        });
        return reply.code(201).send({ success: true, data: item });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to add item to cart' 
        });
      }
    },
  });

  /**
   * PUT /api/v1/carts/items/:id
   * Update cart item
   */
  server.put('/items/:itemId', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { itemId } = request.params as any;
      const updates = request.body as any;

      try {
        const item = await cartService.updateCartItem(itemId, storeId, updates);
        return reply.send({ success: true, data: item });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to update cart item' 
        });
      }
    },
  });

  /**
   * DELETE /api/v1/carts/items/:id
   * Remove item from cart
   */
  server.delete('/items/:itemId', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { itemId } = request.params as any;

      try {
        const result = await cartService.removeCartItem(itemId, storeId);
        return reply.send(result);
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to remove item from cart' 
        });
      }
    },
  });

  /**
   * POST /api/v1/carts/:id/clear
   * Clear cart
   */
  server.post('/:cartId/clear', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { cartId } = request.params as any;

      try {
        const result = await cartService.clearCart(cartId, storeId);
        return reply.send(result);
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to clear cart' 
        });
      }
    },
  });

  /**
   * POST /api/v1/carts/:id/coupon
   * Apply coupon to cart
   */
  server.post('/:cartId/coupon', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { cartId } = request.params as any;
      const { couponCode } = request.body as any;

      try {
        const coupon = await cartService.applyCoupon(cartId, storeId, couponCode);
        return reply.send({ success: true, data: coupon });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to apply coupon' 
        });
      }
    },
  });

  /**
   * GET /api/v1/carts/:id/totals
   * Calculate cart totals
   */
  server.get('/:cartId/totals', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { cartId } = request.params as any;

      const totals = await cartService.calculateCartTotals(cartId, storeId);
      return reply.send({ success: true, data: totals });
    },
  });

  /**
   * PUT /api/v1/carts/:id/shipping
   * Update cart shipping
   */
  server.put('/:cartId/shipping', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { cartId } = request.params as any;
      const shippingData = request.body as any;

      try {
        const updated = await cartService.updateCartShipping(cartId, storeId, shippingData);
        return reply.send({ success: true, data: updated });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to update shipping' 
        });
      }
    },
  });

  /**
   * POST /api/v1/carts/:id/abandon
   * Abandon cart
   */
  server.post('/:cartId/abandon', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { cartId } = request.params as any;

      try {
        const result = await cartService.abandonCart(cartId, storeId);
        return reply.send(result);
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to abandon cart' 
        });
      }
    },
  });

  /**
   * GET /api/v1/carts/abandoned
   * Get abandoned carts
   */
  server.get('/abandoned', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        daysAgo: query.daysAgo ? parseInt(query.daysAgo, 10) : 7,
        minValue: query.minValue ? parseFloat(query.minValue) : undefined,
      };

      const carts = await cartService.getAbandonedCarts(storeId, filters);
      return reply.send({ success: true, data: carts });
    },
  });
};
