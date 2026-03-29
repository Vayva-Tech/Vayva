import { FastifyPluginAsync } from 'fastify';
import { HealthScoreService } from '../../../../services/platform/health-score.service';

const healthScoreService = new HealthScoreService();

export const healthScoreRoutes: FastifyPluginAsync = async (server) => {
  /**
   * GET /api/v1/health-score
   * Get health score data with optional filtering
   */
  server.get('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const query = request.query as any;
      const segment = query.segment as 'healthy' | 'atRisk' | 'critical' | undefined;
      const storeId = query.storeId as string | undefined;
      const limit = query.limit ? parseInt(query.limit, 10) : undefined;

      try {
        if (storeId) {
          // Get specific store health score
          const healthScore = await healthScoreService.getStoreHealthScore(storeId);
          return reply.send({ success: true, data: { healthScore } });
        } else {
          // Get all health scores with filtering
          const result = await healthScoreService.getAllHealthScores({
            segment,
            limit,
          });
          return reply.send({ success: true, data: result });
        }
      } catch (error) {
        if ((error as Error).message === 'Health score not found for store') {
          return reply.code(404).send({ 
            success: false, 
            error: 'Health score not found' 
          });
        }
        throw error;
      }
    },
  });

  /**
   * POST /api/v1/health-score/recalculate
   * Trigger health score recalculation for a store
   */
  server.post('/recalculate', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const body = request.body as any;
      const { storeId } = body;

      if (!storeId) {
        return reply.code(400).send({ 
          success: false, 
          error: 'storeId is required' 
        });
      }

      try {
        const success = await healthScoreService.triggerRecalculation(storeId);
        return reply.send({ 
          success: true, 
          message: 'Health score recalculation queued',
        });
      } catch (error) {
        if ((error as Error).message === 'Store not found') {
          return reply.code(404).send({ 
            success: false, 
            error: 'Store not found' 
          });
        }
        throw error;
      }
    },
  });
};
