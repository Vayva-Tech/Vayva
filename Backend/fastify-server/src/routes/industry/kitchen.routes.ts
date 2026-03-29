import { FastifyPluginAsync } from 'fastify';
import { KitchenService } from '../../services/industry/kitchen.service';

export const kitchenRoutes: FastifyPluginAsync = async (fastify) => {
  const kitchenService = new KitchenService();

  fastify.get('/orders', async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      const status = (request.query as any).status;
      const result = await kitchenService.getOrders(storeId, status);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });
};
