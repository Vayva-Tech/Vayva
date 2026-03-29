import { FastifyPluginAsync } from 'fastify';
import { BNPLService } from '../../services/platform/bnpl.service';

export const bnplRoutes: FastifyPluginAsync = async (fastify) => {
  const bnplService = new BNPLService();

  fastify.get('/dashboard', async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      const result = await bnplService.getDashboard(storeId);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });
};
