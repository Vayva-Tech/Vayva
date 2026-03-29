import { FastifyPluginAsync } from 'fastify';
import { MarketingService } from '../../services/platform/marketing.service';

export const marketingRoutes: FastifyPluginAsync = async (fastify) => {
  const marketingService = new MarketingService();

  fastify.get('/flash-sales', async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      const result = await marketingService.getFlashSales(storeId);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });

  fastify.get('/flash-sales/:id', async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      const { id } = request.params as { id: string };
      const result = await marketingService.getFlashSales(storeId, id);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });
};
