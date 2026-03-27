import { FastifyPluginAsync } from 'fastify';
import { ServiceCatalogService } from '../../../services/commerce/serviceCatalog.service';

const serviceCatalogService = new ServiceCatalogService();

export const servicesRoutes: FastifyPluginAsync = async (server) => {
  server.get('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      
      try {
        const services = await serviceCatalogService.findAll(storeId);
        return reply.send({ success: true, data: services });
      } catch (error) {
        return reply.code(500).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to fetch services' 
        });
      }
    },
  });

  server.post('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const data = request.body as any;

      try {
        const service = await serviceCatalogService.create(storeId, data);
        return reply.code(201).send({ success: true, data: service });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create service' 
        });
      }
    },
  });

  server.put('/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;
      const data = request.body as any;

      try {
        const service = await serviceCatalogService.update(id, storeId, data);
        return reply.send({ success: true, data: service });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to update service' 
        });
      }
    },
  });

  server.delete('/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      try {
        const result = await serviceCatalogService.delete(id, storeId);
        return reply.send(result);
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to delete service' 
        });
      }
    },
  });

  server.get('/dashboard', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;
      const date = query.date ? new Date(query.date) : undefined;

      try {
        const dashboard = await serviceCatalogService.getDashboard(storeId, date);
        return reply.send({ success: true, data: dashboard });
      } catch (error) {
        return reply.code(500).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to fetch dashboard' 
        });
      }
    },
  });
};
