import { FastifyPluginAsync } from 'fastify';
import { SupportService } from '../../../../services/platform/support.service';

const supportService = new SupportService();

export const supportRoutes: FastifyPluginAsync = async (server) => {
  server.get('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      try {
        const filters = {
          page: query.page ? parseInt(query.page, 10) : 1,
          limit: query.limit ? parseInt(query.limit, 10) : 20,
          status: query.status,
          priority: query.priority,
        };
        const result = await supportService.getSupportTickets(storeId, filters);
        return reply.send({ success: true, data: result });
      } catch (error) {
        return reply.code(500).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to fetch tickets' 
        });
      }
    },
  });

  server.post('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const userId = (request.user as any).userId;
      const ticketData = request.body as any;

      try {
        const ticket = await supportService.createSupportTicket(storeId, userId, ticketData);
        return reply.code(201).send({ success: true, data: ticket });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create ticket' 
        });
      }
    },
  });

  server.patch('/:id/status', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;
      const { status } = request.body as any;

      try {
        const updated = await supportService.updateTicketStatus(id, storeId, status);
        return reply.send({ success: true, data: updated });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to update ticket' 
        });
      }
    },
  });

  server.post('/:id/comments', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;
      const userId = (request.user as any).userId;
      const { comment } = request.body as any;

      try {
        const ticketComment = await supportService.addTicketComment(id, userId, comment);
        return reply.code(201).send({ success: true, data: ticketComment });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to add comment' 
        });
      }
    },
  });
};
