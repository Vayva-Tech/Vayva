import { FastifyPluginAsync } from 'fastify';
import { WholesaleService } from '../../../../services/industry/wholesale.service';

const wholesaleService = new WholesaleService();

export const wholesaleRoutes: FastifyPluginAsync = async (server) => {
  server.get('/customers', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
        status: query.status,
        tier: query.tier,
        search: query.search,
      };

      const result = await wholesaleService.getCustomers(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.post('/customers', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const customerData = request.body as any;

      try {
        const customer = await wholesaleService.createCustomer(storeId, customerData);
        return reply.code(201).send({ success: true, data: customer });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create customer' 
        });
      }
    },
  });

  server.get('/customers/:id/orders', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      const orders = await wholesaleService.getCustomerOrders(id, storeId);
      return reply.send({ success: true, data: orders });
    },
  });

  server.get('/products', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 50,
        category: query.category,
        isActive: query.isActive !== undefined ? query.isActive === 'true' : undefined,
      };

      const result = await wholesaleService.getProducts(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.post('/products', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const productData = request.body as any;

      try {
        const product = await wholesaleService.createProduct(storeId, productData);
        return reply.code(201).send({ success: true, data: product });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create product' 
        });
      }
    },
  });

  server.get('/products/:id/inventory', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      const inventory = await wholesaleService.getProductInventory(id, storeId);
      return reply.send({ success: true, data: inventory });
    },
  });

  server.put('/products/:id/inventory', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;
      const updates = request.body as any;

      try {
        const inventory = await wholesaleService.updateProductInventory(id, storeId, updates);
        return reply.send({ success: true, data: inventory });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to update inventory' 
        });
      }
    },
  });

  server.get('/purchase-orders', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
        status: query.status,
        supplierId: query.supplierId,
      };

      const result = await wholesaleService.getPurchaseOrders(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.post('/purchase-orders', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const orderData = request.body as any;

      try {
        const order = await wholesaleService.createPurchaseOrder(storeId, orderData);
        return reply.code(201).send({ success: true, data: order });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create purchase order' 
        });
      }
    },
  });

  server.post('/purchase-orders/auto-generate', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { productId, reorderPoint } = request.body as any;

      try {
        const suggestion = await wholesaleService.autoGeneratePurchaseOrder(storeId, productId, reorderPoint);
        return reply.send({ success: true, data: suggestion });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Auto-generation failed' 
        });
      }
    },
  });

  server.get('/shipments', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
        status: query.status,
        orderId: query.orderId,
      };

      const result = await wholesaleService.getShipments(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.post('/shipments', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const shipmentData = request.body as any;

      try {
        const shipment = await wholesaleService.createShipment(storeId, shipmentData);
        return reply.code(201).send({ success: true, data: shipment });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create shipment' 
        });
      }
    },
  });

  server.get('/dashboard', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const stats = await wholesaleService.getWholesaleStats(storeId);
      return reply.send({ success: true, data: stats });
    },
  });
};
