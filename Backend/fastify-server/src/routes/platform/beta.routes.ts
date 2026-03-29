import { FastifyPluginAsync } from 'fastify';
import { BetaService } from '../../services/platform/beta.service';

export const betaRoutes: FastifyPluginAsync = async (fastify) => {
  const betaService = new BetaService();

  fastify.get('/desktop-app-waitlist', async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      const result = await betaService.getDesktopAppWaitlist(storeId);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });
};
