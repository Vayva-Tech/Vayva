import { FastifyPluginAsync } from 'fastify';
import { ReturnService } from '../../../services/core/return.service';

const returnService = new ReturnService();

export const returnsRoutes: FastifyPluginAsync = async (server) => {
  // GET /api/v1/returns - List returns
  server.get('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        status: query.status,
        orderId: query.orderId,
        customerId: query.customerId,
        limit: query.limit ? parseInt(query.limit, 10) : 50,
        offset: query.offset ? parseInt(query.offset, 10) : 0,
      };

      try {
        const result = await returnService.getReturns(storeId, filters);
        return reply.send({ success: true, data: result });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch returns',
        });
      }
    },
  });

  // POST /api/v1/returns - Create return request
  server.post('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const body = request.body as any;

      try {
        const result = await returnService.createReturn(storeId, body);
        return reply.code(201).send({ success: true, ...result });
      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          return reply.code(404).send({
            success: false,
            error: error.message,
          });
        }
        if (error instanceof Error && error.message.includes('exceeds')) {
          return reply.code(400).send({
            success: false,
            error: error.message,
          });
        }
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create return',
        });
      }
    },
  });

  // PATCH /api/v1/returns - Process return action
  server.patch('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const userId = (request.user as any).userId;
      const { id, action, ...data } = request.body as any;

      if (!id || !action) {
        return reply.code(400).send({
          success: false,
          error: 'Return ID and action are required',
        });
      }

      try {
        const updated = await returnService.processReturnAction(storeId, userId, id, action, data);
        return reply.send({ success: true, data: updated });
      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          return reply.code(404).send({
            success: false,
            error: error.message,
          });
        }
        if (error instanceof Error && error.message.includes('must be') || error.message.includes('Can only') || error.message.includes('is required')) {
          return reply.code(400).send({
            success: false,
            error: error.message,
          });
        }
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to process return',
        });
      }
    },
  });
};
