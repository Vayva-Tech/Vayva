import { FastifyPluginAsync } from 'fastify';
import { FoodService } from '../../../../services/industry/food.service';

const foodService = new FoodService();

export const foodRoutes: FastifyPluginAsync = async (server) => {
  /**
   * GET /api/v1/industry/food/dashboard
   * Get comprehensive food delivery dashboard data
   */
  server.get('/dashboard', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const dashboardData = await foodService.getDashboard(storeId);
        return reply.send({ success: true, data: dashboardData });
      } catch (error) {
        server.log.error('[Food] Error getting dashboard', error);
        return reply.code(500).send({
          success: false,
          error: 'Failed to fetch food delivery dashboard data',
        });
      }
    },
  });

  /**
   * GET /api/v1/industry/food/kpis
   * Get food delivery KPI metrics
   */
  server.get('/kpis', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const kpis = await foodService.getKPIs(storeId);
        return reply.send({ success: true, data: kpis });
      } catch (error) {
        server.log.error('[Food] Error getting KPIs', error);
        return reply.code(500).send({
          success: false,
          error: 'Failed to fetch food delivery KPIs',
        });
      }
    },
  });

  /**
   * GET /api/v1/industry/food/orders/queue
   * Get current order queue for kitchen/display
   */
  server.get('/orders/queue', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const orderQueue = await foodService.getOrderQueue(storeId);
        return reply.send({ success: true, data: orderQueue });
      } catch (error) {
        server.log.error('[Food] Error getting order queue', error);
        return reply.code(500).send({
          success: false,
          error: 'Failed to fetch order queue',
        });
      }
    },
  });

  /**
   * GET /api/v1/industry/food/delivery/tracking
   * Get active delivery tracking data
   */
  server.get('/delivery/tracking', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const deliveries = await foodService.getDeliveryTracking(storeId);
        return reply.send({ success: true, data: deliveries });
      } catch (error) {
        server.log.error('[Food] Error getting delivery tracking', error);
        return reply.code(500).send({
          success: false,
          error: 'Failed to fetch delivery tracking',
        });
      }
    },
  });

  /**
   * GET /api/v1/industry/food/menu/performance
   * Get menu performance analytics
   */
  server.get('/menu/performance', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const performance = await foodService.getMenuPerformance(storeId);
        return reply.send({ success: true, data: performance });
      } catch (error) {
        server.log.error('[Food] Error getting menu performance', error);
        return reply.code(500).send({
          success: false,
          error: 'Failed to fetch menu performance data',
        });
      }
    },
  });

  /**
   * POST /api/v1/industry/food/actions/:actionId
   * Execute industry-specific action
   */
  server.post('/actions/:actionId', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const { actionId } = request.params as any;
        const data = request.body as any;

        const result = await foodService.executeAction(storeId, actionId, data);
        return reply.send({ success: true, data: result });
      } catch (error) {
        server.log.error('[Food] Error executing action', error);
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to execute action',
        });
      }
    },
  });

  /**
   * GET /api/v1/industry/food/metrics/:metricId
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
            metricData = await foodService.getKPIs(storeId).then((k) => k.revenue);
            break;
          case 'orders':
            metricData = await foodService.getKPIs(storeId).then((k) => k.orders);
            break;
          case 'prep-time':
            metricData = await foodService.getKPIs(storeId).then((k) => k.avgPrepTime);
            break;
          case 'delivery-time':
            metricData = await foodService.getKPIs(storeId).then((k) => k.avgDeliveryTime);
            break;
          case 'accuracy':
            metricData = await foodService.getKPIs(storeId).then((k) => k.orderAccuracy);
            break;
          case 'satisfaction':
            metricData = await foodService.getKPIs(storeId).then((k) => k.customerSatisfaction);
            break;
          default:
            return reply.code(400).send({
              success: false,
              error: `Unknown metric: ${metricId}`,
            });
        }

        return reply.send({ success: true, data: { metricId, value: metricData } });
      } catch (error) {
        server.log.error('[Food] Error getting metric', error);
        return reply.code(500).send({
          success: false,
          error: 'Failed to fetch metric data',
        });
      }
    },
  });
};
