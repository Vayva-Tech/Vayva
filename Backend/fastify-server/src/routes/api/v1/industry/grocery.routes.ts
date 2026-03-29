import { FastifyPluginAsync } from 'fastify';
import { GroceryService } from '../../../../services/industry/grocery.service';

const groceryService = new GroceryService();

export const groceryRoutes: FastifyPluginAsync = async (server) => {
  server.get('/suppliers', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
        status: query.status,
        category: query.category,
        minRating: query.minRating ? parseFloat(query.minRating) : undefined,
        maxRating: query.maxRating ? parseFloat(query.maxRating) : undefined,
        search: query.search,
      };

      const result = await groceryService.getSuppliers(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.post('/suppliers', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const supplierData = request.body as any;

      try {
        const supplier = await groceryService.createSupplier(storeId, supplierData);
        return reply.code(201).send({ success: true, data: supplier });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create supplier' 
        });
      }
    },
  });

  server.get('/suppliers/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      const supplier = await groceryService.getSupplierById(id, storeId);
      
      if (!supplier) {
        return reply.code(404).send({ success: false, error: 'Supplier not found' });
      }

      return reply.send({ success: true, data: supplier });
    },
  });

  server.put('/suppliers/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;
      const updates = request.body as any;

      try {
        const supplier = await groceryService.updateSupplier(id, storeId, updates);
        return reply.send({ success: true, data: supplier });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to update supplier' 
        });
      }
    },
  });

  server.delete('/suppliers/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      try {
        const result = await groceryService.deleteSupplier(id, storeId);
        return reply.send(result);
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to delete supplier' 
        });
      }
    },
  });

  server.get('/suppliers/:id/products', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      const products = await groceryService.getSupplierProducts(id, storeId);
      return reply.send({ success: true, data: products });
    },
  });

  server.get('/departments', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const departments = await groceryService.getDepartments(storeId);
      return reply.send({ success: true, data: departments });
    },
  });

  server.post('/departments', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const departmentData = request.body as any;

      try {
        const department = await groceryService.createDepartment(storeId, departmentData);
        return reply.code(201).send({ success: true, data: department });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create department' 
        });
      }
    },
  });

  server.get('/dashboard', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const stats = await groceryService.getDashboardStats(storeId);
      return reply.send({ success: true, data: stats });
    },
  });
};
