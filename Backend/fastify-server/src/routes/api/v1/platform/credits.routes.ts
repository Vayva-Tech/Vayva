import { FastifyPluginAsync } from 'fastify';
import { CreditService } from '../../../../services/platform/credit.service';

const creditService = new CreditService();

export const creditRoutes: FastifyPluginAsync = async (server) => {
  server.get('/balance', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      
      try {
        const balance = await creditService.getBalance(storeId);
        return reply.send({ success: true, data: balance });
      } catch (error) {
        return reply.code(500).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to fetch credit balance' 
        });
      }
    },
  });

  server.post('/use', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { amount, feature, description } = request.body as any;

      try {
        if (!amount || typeof amount !== 'number' || amount <= 0) {
          return reply.code(400).send({ error: 'Valid amount required' });
        }

        if (!feature || typeof feature !== 'string') {
          return reply.code(400).send({ error: 'Feature name required' });
        }

        const result = await creditService.useCredits(storeId, amount, feature, description);
        
        if (!result.success) {
          return reply.code(402).send(result);
        }

        return reply.send(result);
      } catch (error) {
        return reply.code(500).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to process credit usage' 
        });
      }
    },
  });
};
