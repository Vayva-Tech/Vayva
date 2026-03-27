import { FastifyPluginAsync } from 'fastify';
import { DashboardService } from '../../../services/platform/dashboard.service';

const dashboardService = new DashboardService();

export const dashboardRoutes: FastifyPluginAsync = async (server) => {
  server.get('/metrics', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const metrics = await dashboardService.getMetrics(storeId);
      return reply.send({ success: true, data: metrics });
    },
  });

  server.get('/recent-orders', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const limit = (request.query as any).limit ? parseInt((request.query as any).limit, 10) : 10;
      
      const orders = await dashboardService.getRecentOrders(storeId, limit);
      return reply.send({ success: true, data: orders });
    },
  });

  server.get('/industry-overview', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const overview = await dashboardService.getIndustryOverview(storeId);
      return reply.send({ success: true, data: overview });
    },
  });

  server.get('/stats', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const period = {
        from: query.fromDate ? new Date(query.fromDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        to: query.toDate ? new Date(query.toDate) : new Date(),
      };

      const stats = await dashboardService.getDashboardStats(storeId, period);
      return reply.send({ success: true, data: stats });
    },
  });

  server.get('/activity-feed', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const limit = (request.query as any).limit ? parseInt((request.query as any).limit, 10) : 20;
      
      const activity = await dashboardService.getActivityFeed(storeId, limit);
      return reply.send({ success: true, data: activity });
    },
  });
};
