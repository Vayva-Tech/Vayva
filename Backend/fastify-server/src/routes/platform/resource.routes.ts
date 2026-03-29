import { FastifyPluginAsync } from 'fastify';
import { ResourceService } from '../../services/platform/resource.service';

export const resourceRoutes: FastifyPluginAsync = async (fastify) => {
  const resourceService = new ResourceService();

  fastify.get('/list', async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      const type = (request.query as any).type;
      const result = await resourceService.listResources(storeId, type);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });
};
