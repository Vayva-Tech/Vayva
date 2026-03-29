import { FastifyPluginAsync } from 'fastify';
import { DashboardService } from '../../services/platform/dashboard.service';

export const dashboardRoutes: FastifyPluginAsync = async (fastify) => {
  const dashboardService = new DashboardService();

  fastify.get('/sidebar-counts', async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      const result = await dashboardService.getSidebarCounts(storeId);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });
};
