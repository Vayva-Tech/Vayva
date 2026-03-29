import { FastifyPluginAsync } from 'fastify';
import { ComplianceService } from '../../../../services/platform/compliance.service';

const complianceService = new ComplianceService();

export const riskRoutes: FastifyPluginAsync = async (server) => {
  /**
   * GET /api/v1/compliance/risk/scores
   * Get risk scores dashboard
   */
  server.get('/risk/scores', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const query = request.query as any;
      const limit = query.limit ? parseInt(query.limit, 10) : 100;
      const minScore = query.minScore ? parseInt(query.minScore, 10) : 0;

      const result = await complianceService.getRiskScores({ limit, minScore });
      return reply.send({ success: true, data: result });
    },
  });

  /**
   * POST /api/v1/compliance/risk/:id/resolve
   * Resolve a risk item
   */
  server.post('/risk/:id/resolve', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = request.body as any;
      const { resolution } = body;
      const resolverId = (request.user as any).userId;

      if (!resolution) {
        return reply.code(400).send({ success: false, error: 'resolution is required' });
      }

      try {
        const result = await complianceService.resolveRisk(id, resolverId, resolution);
        return reply.send(result);
      } catch (error) {
        if ((error as Error).message === 'Risk not found') {
          return reply.code(404).send({ success: false, error: 'Risk not found' });
        }
        throw error;
      }
    },
  });
};
