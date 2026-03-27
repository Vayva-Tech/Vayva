import { FastifyPluginAsync } from 'fastify';
import { CollectionService } from '../../../services/commerce/collection.service';

const collectionService = new CollectionService();

export const collectionRoutes: FastifyPluginAsync = async (server) => {
  server.get('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      
      const collections = await collectionService.findAll(storeId);
      return reply.send({ success: true, data: collections });
    },
  });

  server.post('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const data = request.body as any;

      try {
        const collection = await collectionService.create(storeId, data);
        return reply.code(201).send({ success: true, data: collection });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create collection' 
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
        const collection = await collectionService.update(id, storeId, data);
        return reply.send({ success: true, data: collection });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to update collection' 
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
        const result = await collectionService.delete(id, storeId);
        return reply.send(result);
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to delete collection' 
        });
      }
    },
  });
};
