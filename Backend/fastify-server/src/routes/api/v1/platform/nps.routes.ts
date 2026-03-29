import { FastifyPluginAsync } from 'fastify';
import { NPSService } from '../../../../services/platform/nps.service';

const npsService = new NPSService();

export const npsRoutes: FastifyPluginAsync = async (server) => {
  /**
   * GET /api/v1/nps
   * Get NPS metrics and survey data
   */
  server.get('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const query = request.query as any;
      const storeId = query.storeId as string | undefined;
      const period = (query.period as '30d' | '90d' | '1y' | 'all') || '90d';

      const result = await npsService.getNPSMetrics({
        storeId,
        period,
      });

      return reply.send({ success: true, data: result });
    },
  });

  /**
   * POST /api/v1/nps/send
   * Trigger NPS survey sending for a store
   */
  server.post('/send', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const body = request.body as any;
      const { storeId, surveyType } = body;

      if (!storeId) {
        return reply.code(400).send({ 
          success: false, 
          error: 'storeId is required' 
        });
      }

      try {
        const success = await npsService.triggerSurvey(storeId, surveyType);
        return reply.send({ 
          success: true, 
          message: 'NPS survey queued for sending',
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
