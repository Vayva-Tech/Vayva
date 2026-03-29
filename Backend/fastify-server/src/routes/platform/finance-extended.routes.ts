import { FastifyPluginAsync } from 'fastify';
import { FinanceExtendedService } from '../../services/platform/finance-extended.service';

export const financeExtendedRoutes: FastifyPluginAsync = async (fastify) => {
  const financeExtendedService = new FinanceExtendedService();

  fastify.get('/activity', async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      const result = await financeExtendedService.getActivity(storeId);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });

  fastify.get('/statements', async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      const result = await financeExtendedService.getStatements(storeId);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });

  fastify.post('/statements/generate', async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      const body = request.body as any;
      const result = await financeExtendedService.generateStatement(storeId, body);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });

  fastify.get('/banks', async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      const result = await financeExtendedService.getBanks(storeId);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });

  fastify.get('/payouts', async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      const result = await financeExtendedService.getPayouts(storeId);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });
};
