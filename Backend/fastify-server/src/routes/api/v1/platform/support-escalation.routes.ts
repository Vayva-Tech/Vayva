import { FastifyPluginAsync } from 'fastify';
import { SupportEscalationService } from '../../../../services/platform/support-escalation.service';

const escalationService = new SupportEscalationService();

export const supportEscalationRoutes: FastifyPluginAsync = async (server) => {
  server.post('/handoff', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const body = request.body as Record<string, unknown>;
        const params = {
          storeId: (request.user as any).storeId,
          trigger: body.trigger as string,
          conversationId: body.conversationId as string | undefined,
          reason: body.reason as string | undefined,
          aiSummary: body.aiSummary as string,
        };

        const ticket = await escalationService.triggerHandoff(params);
        return reply.send(ticket);
      } catch (error) {
        server.log.error(error);
        throw error;
      }
    },
  });

  server.get('/tickets', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const query = request.query as Record<string, string | undefined>;
        const limit = query.limit ? parseInt(query.limit, 10) : 50;
        
        const tickets = await escalationService.getTickets(storeId, limit);
        return reply.send(tickets);
      } catch (error) {
        server.log.error(error);
        throw error;
      }
    },
  });

  server.patch('/tickets/:ticketId/status', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const ticketId = (request.params as any).ticketId;
        const body = request.body as Record<string, string>;
        
        const updated = await escalationService.updateTicketStatus(ticketId, body.status);
        return reply.send(updated);
      } catch (error) {
        server.log.error(error);
        throw error;
      }
    },
  });
};
