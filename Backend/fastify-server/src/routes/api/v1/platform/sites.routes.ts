import { FastifyPluginAsync } from 'fastify';
import { SiteService } from '../../../services/platform/site.service';

const siteService = new SiteService();

export const sitesRoutes: FastifyPluginAsync = async (server) => {
  server.get('/overview', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;

      try {
        const overview = await siteService.getOverview(storeId);
        return reply.send({ success: true, data: overview });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to fetch site overview' 
        });
      }
    },
  });

  server.put('/settings', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const updates = request.body as any;

      try {
        const updated = await siteService.updateSiteSettings(storeId, updates);
        return reply.send({ success: true, data: updated });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to update settings' 
        });
      }
    },
  });
};
