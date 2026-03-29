import { FastifyPluginAsync } from 'fastify';
import { FinanceService } from '../../services/platform/finance.service';

export const financeRoutes: FastifyPluginAsync = async (fastify) => {
  const financeService = new FinanceService();

  fastify.get('/overview', async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      const result = await financeService.getOverview(storeId);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });

  fastify.get('/transactions', async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      const limit = parseInt((request.query as any).limit || '50');
      const result = await financeService.getTransactions(storeId, limit);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });

  fastify.get('/stats', async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      const result = await financeService.getStats(storeId);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });
};
