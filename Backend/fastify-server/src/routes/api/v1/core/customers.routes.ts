import { FastifyPluginAsync } from 'fastify';
import { CustomersService } from '../../../../services/core/customers.service';

const customersService = new CustomersService();

export const customersRoutes: FastifyPluginAsync = async (server) => {
  /**
   * GET /api/v1/customers
   * Get all customers for store
   */
  server.get('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        search: query.search,
        segment: query.segment,
        limit: query.limit ? parseInt(query.limit, 10) : 50,
        offset: query.offset ? parseInt(query.offset, 10) : 0,
      };

      const result = await customersService.getStoreCustomers(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  /**
   * POST /api/v1/customers
   * Create a new customer
   */
  server.post('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const customerData = request.body as any;

      try {
        const customer = await customersService.createCustomer({ ...customerData, storeId });
        return reply.code(201).send({ success: true, data: customer });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create customer' 
        });
      }
    },
  });

  /**
   * GET /api/v1/customers/:customerId
   * Get customer by ID
   */
  server.get('/:customerId', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { customerId } = request.params as { customerId: string };

      const customer = await customersService.getCustomerById(customerId, storeId);
      
      if (!customer) {
        return reply.code(404).send({ success: false, error: 'Customer not found' });
      }

      return reply.send({ success: true, data: customer });
    },
  });

  /**
   * PUT /api/v1/customers/:customerId
   * Update customer
   */
  server.put('/:customerId', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { customerId } = request.params as { customerId: string };
      const updates = request.body as any;

      try {
        const updated = await customersService.updateCustomer(customerId, storeId, updates);
        return reply.send({ success: true, data: updated });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to update customer' 
        });
      }
    },
  });

  /**
   * POST /api/v1/customers/:customerId/addresses
   * Add customer address
   */
  server.post('/:customerId/addresses', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { customerId } = request.params as { customerId: string };
      const addressData = request.body as any;

      try {
        const address = await customersService.addAddress(customerId, storeId, addressData);
        return reply.code(201).send({ success: true, data: address });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to add address' 
        });
      }
    },
  });

  /**
   * GET /api/v1/customers/:customerId/orders
   * Get customer order history
   */
  server.get('/:customerId/orders', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { customerId } = request.params as { customerId: string };

      const history = await customersService.getCustomerOrderHistory(customerId, storeId);
      return reply.send({ success: true, data: history });
    },
  });

  /**
   * GET /api/v1/customers/search
   * Search customers
   */
  server.get('/search', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { q } = request.query as { q: string };

      const customers = await customersService.searchCustomers(storeId, q);
      return reply.send({ success: true, data: customers });
    },
  });

  /**
   * GET /api/v1/customers/stats
   * Get customer statistics
   */
  server.get('/stats/overview', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;

      const stats = await customersService.getCustomerStats(storeId);
      return reply.send({ success: true, data: stats });
    },
  });
};
