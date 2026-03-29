import { FastifyPluginAsync } from 'fastify';
import { FashionService } from '../../../../services/industry/fashion.service';

const fashionService = new FashionService();

export const fashionRoutes: FastifyPluginAsync = async (server) => {
  /**
   * GET /api/v1/industry/fashion/dashboard
   * Get comprehensive fashion dashboard data
   */
  server.get('/dashboard', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const dashboardData = await fashionService.getDashboard(storeId);
        return reply.send({ success: true, data: dashboardData });
      } catch (error) {
        server.log.error('[Fashion] Error getting dashboard', error);
        return reply.code(500).send({
          success: false,
          error: 'Failed to fetch fashion dashboard data',
        });
      }
    },
  });

  /**
   * GET /api/v1/industry/fashion/kpis
   * Get fashion-specific KPI metrics
   */
  server.get('/kpis', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const kpis = await fashionService.getKPIs(storeId);
        return reply.send({ success: true, data: kpis });
      } catch (error) {
        server.log.error('[Fashion] Error getting KPIs', error);
        return reply.code(500).send({
          success: false,
          error: 'Failed to fetch fashion KPIs',
        });
      }
    },
  });

  /**
   * GET /api/v1/industry/fashion/metrics/:metricId
   * Get specific metric data
   */
  server.get('/metrics/:metricId', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const { metricId } = request.params as any;

        let metricData;
        switch (metricId) {
          case 'revenue':
            metricData = await fashionService.getKPIs(storeId).then((k) => k.revenue);
            break;
          case 'orders':
            metricData = await fashionService.getKPIs(storeId).then((k) => k.orders);
            break;
          case 'units-sold':
            metricData = await fashionService.getKPIs(storeId).then((k) => k.unitsSold);
            break;
          case 'return-rate':
            metricData = await fashionService.getKPIs(storeId).then((k) => k.returnRate);
            break;
          default:
            return reply.code(400).send({
              success: false,
              error: `Unknown metric: ${metricId}`,
            });
        }

        return reply.send({ success: true, data: { metricId, value: metricData } });
      } catch (error) {
        server.log.error('[Fashion] Error getting metric', error);
        return reply.code(500).send({
          success: false,
          error: 'Failed to fetch metric data',
        });
      }
    },
  });

  /**
   * GET /api/v1/industry/fashion/trends
   * Get trend analysis data
   */
  server.get('/trends', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const trends = await fashionService.getTrendAnalysis(storeId);
        return reply.send({ success: true, data: trends });
      } catch (error) {
        server.log.error('[Fashion] Error getting trends', error);
        return reply.code(500).send({
          success: false,
          error: 'Failed to fetch trend data',
        });
      }
    },
  });

  /**
   * GET /api/v1/industry/fashion/size-guides
   * Get size guide management data
   */
  server.get('/size-guides', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const sizeGuides = await fashionService.getSizeGuides(storeId);
        return reply.send({ success: true, data: sizeGuides });
      } catch (error) {
        server.log.error('[Fashion] Error getting size guides', error);
        return reply.code(500).send({
          success: false,
          error: 'Failed to fetch size guides',
        });
      }
    },
  });

  /**
   * POST /api/v1/industry/fashion/actions/:actionId
   * Execute industry-specific action
   */
  server.post('/actions/:actionId', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const { actionId } = request.params as any;
        const data = request.body as any;

        const result = await fashionService.executeAction(storeId, actionId, data);
        return reply.send({ success: true, data: result });
      } catch (error) {
        server.log.error('[Fashion] Error executing action', error);
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to execute action',
        });
      }
    },
  });

  /**
   * GET /api/v1/industry/fashion/top-products
   * Get top performing products
   */
  server.get('/top-products', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const topProducts = await fashionService.getTopProducts(storeId);
        return reply.send({ success: true, data: topProducts });
      } catch (error) {
        server.log.error('[Fashion] Error getting top products', error);
        return reply.code(500).send({
          success: false,
          error: 'Failed to fetch top products',
        });
      }
    },
  });
};
