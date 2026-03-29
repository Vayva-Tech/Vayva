import { FastifyPluginAsync } from 'fastify';
import { StorageService } from '../../../../services/platform/storage.service';

const storageService = new StorageService();

export const storageRoutes: FastifyPluginAsync = async (server) => {
  server.get('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      try {
        const filters = {
          page: query.page ? parseInt(query.page, 10) : 1,
          limit: query.limit ? parseInt(query.limit, 10) : 20,
          type: query.type,
        };
        const result = await storageService.getFiles(storeId, filters);
        return reply.send({ success: true, data: result });
      } catch (error) {
        return reply.code(500).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to fetch files' 
        });
      }
    },
  });

  server.post('/upload', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const userId = (request.user as any).userId;
      const fileData = request.body as any;

      try {
        const result = await storageService.uploadFile(storeId, userId, fileData);
        return reply.code(201).send({ success: true, data: result });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to upload file' 
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
        const result = await storageService.deleteFile(id, storeId);
        return reply.send({ success: true, data: result });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to delete file' 
        });
      }
    },
  });
};
