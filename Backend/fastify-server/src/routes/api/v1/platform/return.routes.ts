import { FastifyPluginAsync } from 'fastify';
import { ReturnService } from '../../../../services/platform/return.service';

const returnService = new ReturnService();

export const returnRoutes: FastifyPluginAsync = async (server) => {
  server.post('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const body = request.body as Record<string, unknown>;
        const storeId = (request.user as any).storeId;
        const orderId = body.orderId as string;
        const customerId = body.customerId as string;
        const payload = {
          reason: body.reason as string,
          items: body.items as Array<{ productId?: string; quantity?: number }> | undefined,
        };

        const returnRequest = await returnService.createRequest(storeId, orderId, customerId, payload);
        return reply.send(returnRequest);
      } catch (error) {
        server.log.error(error);
        throw error;
      }
    },
  });

  server.get('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const requests = await returnService.getRequests(storeId);
        return reply.send(requests);
      } catch (error) {
        server.log.error(error);
        throw error;
      }
    },
  });

  server.get('/:requestId', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const requestId = (request.params as any).requestId;
        const returnRequest = await returnService.getRequestById(requestId);
        
        if (!returnRequest) {
          return reply.code(404).send({ error: 'Return request not found' });
        }
        
        return reply.send(returnRequest);
      } catch (error) {
        server.log.error(error);
        throw error;
      }
    },
  });

  server.patch('/:requestId/status', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const requestId = (request.params as any).requestId;
        const userId = (request.user as any).userId;
        const body = request.body as Record<string, string>;
        
        const updated = await returnService.updateStatus(requestId, body.status, userId);
        return reply.send(updated);
      } catch (error) {
        server.log.error(error);
        throw error;
      }
    },
  });

  server.post('/:requestId/cancel', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const requestId = (request.params as any).requestId;
        const cancelled = await returnService.cancelRequest(requestId);
        return reply.send(cancelled);
      } catch (error) {
        server.log.error(error);
        throw error;
      }
    },
  });
};
