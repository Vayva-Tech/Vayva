import { FastifyPluginAsync } from 'fastify';
import { RescueService } from '../../services/industry/rescue.service';

export const rescueRoutes: FastifyPluginAsync = async (fastify) => {
  const rescueService = new RescueService();

  fastify.get('/incidents/:id', async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      const { id } = request.params as { id: string };
      const result = await rescueService.getIncident(id, storeId);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });
};
