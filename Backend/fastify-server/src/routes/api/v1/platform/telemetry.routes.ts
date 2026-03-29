import { FastifyPluginAsync } from 'fastify';
import { EventIngestionService } from '../../../../services/analytics/event-ingestion.service';

const eventIngestionService = new EventIngestionService();

export const telemetryRoutes: FastifyPluginAsync = async (server) => {
  server.post('/event', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const body = request.body as Record<string, unknown>;
        
        const { eventName, properties } = body;
        
        if (!eventName) {
          return reply.code(400).send({ error: 'eventName is required' });
        }

        await eventIngestionService.ingestEvent(storeId, eventName, properties as Record<string, unknown>);
        
        return reply.send({ success: true });
      } catch (error) {
        server.log.error(error);
        throw error;
      }
    },
  });

  server.get('/events', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const query = request.query as Record<string, string | undefined>;
        
        const filters = {
          eventName: query.eventName,
          startDate: query.startDate ? new Date(query.startDate) : undefined,
          endDate: query.endDate ? new Date(query.endDate) : undefined,
          templateSlug: query.templateSlug,
          limit: query.limit ? parseInt(query.limit, 10) : 100,
        };

        const events = await eventIngestionService.getEvents(storeId, filters);
        return reply.send(events);
      } catch (error) {
        server.log.error(error);
        throw error;
      }
    },
  });

  server.get('/stats', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const query = request.query as Record<string, string | undefined>;
        
        const days = query.days ? parseInt(query.days, 10) : 30;

        const stats = await eventIngestionService.getEventStats(storeId, days);
        return reply.send(stats);
      } catch (error) {
        server.log.error(error);
        throw error;
      }
    },
  });
};
