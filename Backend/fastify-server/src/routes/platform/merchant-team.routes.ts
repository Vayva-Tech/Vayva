import { FastifyPluginAsync } from 'fastify';
import { MerchantTeamService } from '../../services/platform/merchant-team.service';

export const merchantTeamRoutes: FastifyPluginAsync = async (fastify) => {
  const merchantTeamService = new MerchantTeamService();

  fastify.get('/team', async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      const result = await merchantTeamService.getTeam(storeId);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });

  fastify.get('/audit', async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      const result = await merchantTeamService.getAudit(storeId);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });
};
