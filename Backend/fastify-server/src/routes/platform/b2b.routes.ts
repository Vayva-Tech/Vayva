import { FastifyPluginAsync } from 'fastify';
import { B2BService } from '../../services/platform/b2b.service';

export const b2bRoutes: FastifyPluginAsync = async (fastify) => {
  const b2bService = new B2BService();

  fastify.get('/credit/applications', async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      const result = await b2bService.getCreditApplications(storeId);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });

  fastify.get('/rfq', async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      const result = await b2bService.getRFQs(storeId);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });
};
