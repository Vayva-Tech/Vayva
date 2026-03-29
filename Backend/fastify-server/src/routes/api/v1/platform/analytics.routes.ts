import { FastifyPluginAsync } from 'fastify';
import { AnalyticsService } from '../../../../services/platform/analytics.service';

const analyticsService = new AnalyticsService();

export const analyticsRoutes: FastifyPluginAsync = async (server) => {
  server.get('/overview', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const range = (request.query as any).range || '7d';

      const overview = await analyticsService.getAnalyticsOverview(storeId, range);
      return reply.send({ success: true, data: overview });
    },
  });

  server.get('/performance', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 50,
        fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
        toDate: query.toDate ? new Date(query.toDate) : undefined,
      };

      const result = await analyticsService.getPerformanceMetrics(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.post('/events', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const eventData = request.body as any;

      try {
        const event = await analyticsService.trackEvent(storeId, eventData);
        return reply.code(201).send({ success: true, data: event });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to track event' 
        });
      }
    },
  });

  server.get('/insights', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const insights = await analyticsService.getInsights(storeId);
      return reply.send({ success: true, data: insights });
    },
  });

  server.get('/enhanced', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const metrics = (request.query as any).metrics?.split(',') || [];

      const enhanced = await analyticsService.getEnhancedAnalytics(storeId, metrics);
      return reply.send({ success: true, data: enhanced });
    },
  });
};
