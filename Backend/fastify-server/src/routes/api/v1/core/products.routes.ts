import { FastifyPluginAsync } from 'fastify';
import { ProductsService } from '../../../../services/core/products.service';

const productsService = new ProductsService();

export const productsRoutes: FastifyPluginAsync = async (server) => {
  /**
   * GET /api/v1/products
   * Get all products for store
   */
  server.get('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        category: query.category,
        search: query.search,
        status: query.status,
        limit: query.limit ? parseInt(query.limit, 10) : 50,
        offset: query.offset ? parseInt(query.offset, 10) : 0,
      };

      const result = await productsService.getStoreProducts(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  /**
   * POST /api/v1/products
   * Create a new product
   */
  server.post('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const productData = request.body as any;

      try {
        const product = await productsService.createProduct({ ...productData, storeId });
        return reply.code(201).send({ success: true, data: product });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create product' 
        });
      }
    },
  });

  /**
   * GET /api/v1/products/:productId
   * Get product by ID
   */
  server.get('/:productId', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { productId } = request.params as { productId: string };

      const product = await productsService.getProductById(productId, storeId);
      
      if (!product) {
        return reply.code(404).send({ success: false, error: 'Product not found' });
      }

      return reply.send({ success: true, data: product });
    },
  });

  /**
   * PUT /api/v1/products/:productId
   * Update product
   */
  server.put('/:productId', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { productId } = request.params as { productId: string };
      const updates = request.body as any;

      try {
        const updated = await productsService.updateProduct(productId, storeId, updates);
        return reply.send({ success: true, data: updated });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to update product' 
        });
      }
    },
  });

  /**
   * DELETE /api/v1/products/:productId
   * Delete product
   */
  server.delete('/:productId', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { productId } = request.params as { productId: string };

      try {
        await productsService.deleteProduct(productId, storeId);
        return reply.send({ success: true });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to delete product' 
        });
      }
    },
  });

  /**
   * POST /api/v1/products/:productId/variants
   * Create product variant
   */
  server.post('/:productId/variants', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { productId } = request.params as { productId: string };
      const variantData = request.body as any;

      try {
        const variant = await productsService.createVariant(productId, storeId, variantData);
        return reply.code(201).send({ success: true, data: variant });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create variant' 
        });
      }
    },
  });

  /**
   * PUT /api/v1/products/variants/:variantId
   * Update variant
   */
  server.put('/variants/:variantId', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { variantId } = request.params as { variantId: string };
      const updates = request.body as any;

      try {
        const updated = await productsService.updateVariant(variantId, storeId, updates);
        return reply.send({ success: true, data: updated });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to update variant' 
        });
      }
    },
  });

  /**
   * GET /api/v1/products/low-stock
   * Get low stock products
   */
  server.get('/alerts/low-stock', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { threshold } = request.query as { threshold?: number };

      const products = await productsService.getLowStockProducts(
        storeId, 
        threshold || 10
      );
      return reply.send({ success: true, data: products });
    },
  });

  /**
   * GET /api/v1/products/search
   * Search products
   */
  server.get('/search', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { q } = request.query as { q: string };

      const products = await productsService.searchProducts(storeId, q);
      return reply.send({ success: true, data: products });
    },
  });

  /**
   * POST /api/v1/products/:productId/calendar-sync
   * Add calendar sync to product
   */
  server.post('/:productId/calendar-sync', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { productId } = request.params as { productId: string };
      const syncData = request.body as any;

      try {
        const sync = await productsService.addCalendarSync(productId, storeId, syncData);
        return reply.code(201).send({ success: true, data: sync });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to add calendar sync',
        });
      }
    },
  });

  /**
   * DELETE /api/v1/products/calendar-sync/:syncId
   * Remove calendar sync from product
   */
  server.delete('/calendar-sync/:syncId', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { syncId } = request.params as { syncId: string };
      const { productId } = request.query as { productId: string };

      try {
        const result = await productsService.removeCalendarSync(productId, storeId, syncId);
        return reply.send(result);
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to remove calendar sync',
        });
      }
    },
  });

  /**
   * GET /api/v1/products/:productId/calendar-sync
   * Get calendar syncs for product
   */
  server.get('/:productId/calendar-sync', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { productId } = request.params as { productId: string };

      const syncs = await productsService.getCalendarSyncs(productId, storeId);
      return reply.send({ success: true, data: syncs });
    },
  });
};
