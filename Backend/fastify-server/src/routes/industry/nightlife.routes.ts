import { FastifyPluginAsync } from 'fastify';
import { NightlifeService } from '../../services/industry/nightlife.service';

export const nightlifeRoutes: FastifyPluginAsync = async (fastify) => {
  const nightlifeService = new NightlifeService();

  fastify.get('/tickets', async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      const filter = (request.query as any).filter || 'all';
      const result = await nightlifeService.getTickets(storeId, filter);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });

  fastify.get('/reservations', async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      const filter = (request.query as any).filter || 'tonight';
      const result = await nightlifeService.getReservations(storeId, filter);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });
};
