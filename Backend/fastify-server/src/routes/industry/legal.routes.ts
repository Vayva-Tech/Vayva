import { FastifyPluginAsync } from 'fastify';
import { LegalService } from '../../services/industry/legal.service';

export const legalRoutes: FastifyPluginAsync = async (fastify) => {
  const legalService = new LegalService();

  fastify.get('/cases', async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      const result = await legalService.getCases(storeId);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });
};
