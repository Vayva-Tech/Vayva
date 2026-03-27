import { FastifyPluginAsync } from 'fastify';
import { SettlementService } from '../../../services/core/settlement.service';

const settlementService = new SettlementService();

export const settlementsRoutes: FastifyPluginAsync = async (server) => {
  // GET /api/v1/settlements - List settlements
  server.get('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;
      const limit = query.limit ? parseInt(query.limit, 10) : 50;

      try {
        const settlements = await settlementService.getSettlements(storeId, limit);
        return reply.send({ success: true, data: settlements });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch settlements',
        });
      }
    },
  });
};
