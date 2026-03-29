import { FastifyPluginAsync } from 'fastify';
import { MarketplaceService } from '../../services/platform/marketplace.service';

export const marketplaceRoutes: FastifyPluginAsync = async (fastify) => {
  const marketplaceService = new MarketplaceService();

  fastify.get('/vendors', async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      const result = await marketplaceService.getVendors(storeId);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });
};
