import { FastifyPluginAsync } from 'fastify';
import { RefundService } from '../../../services/core/refund.service';

const refundService = new RefundService();

export const refundsRoutes: FastifyPluginAsync = async (server) => {
  // GET /api/v1/refunds - List refunds
  server.get('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        status: query.status,
        orderId: query.orderId,
        limit: query.limit ? parseInt(query.limit, 10) : 50,
        offset: query.offset ? parseInt(query.offset, 10) : 0,
      };

      try {
        const result = await refundService.getRefunds(storeId, filters);
        return reply.send({ success: true, data: result });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch refunds',
        });
      }
    },
  });

  // POST /api/v1/refunds - Create refund request
  server.post('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const body = request.body as any;

      try {
        const refund = await refundService.createRefund(storeId, body);
        return reply.code(201).send({ success: true, refund });
      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          return reply.code(404).send({
            success: false,
            error: error.message,
          });
        }
        if (error instanceof Error && error.message.includes('Cannot')) {
          return reply.code(400).send({
            success: false,
            error: error.message,
          });
        }
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create refund',
        });
      }
    },
  });

  // PATCH /api/v1/refunds - Approve or reject refund
  server.patch('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id, action, notes } = request.body as any;

      if (!id || !action) {
        return reply.code(400).send({
          success: false,
          error: 'Refund ID and action are required',
        });
      }

      try {
        const refund = await refundService.processRefundAction(storeId, id, action, notes);
        return reply.send({ success: true, refund });
      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          return reply.code(404).send({
            success: false,
            error: error.message,
          });
        }
        if (error instanceof Error && error.message.includes('already')) {
          return reply.code(400).send({
            success: false,
            error: error.message,
          });
        }
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to process refund',
        });
      }
    },
  });
};
