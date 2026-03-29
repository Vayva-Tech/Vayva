import { FastifyPluginAsync } from 'fastify';
import { EventsService } from '../../../../services/industry/events.service';

const eventsService = new EventsService();

export const eventsRoutes: FastifyPluginAsync = async (server) => {
  server.get('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
        status: query.status,
        fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
        toDate: query.toDate ? new Date(query.toDate) : undefined,
      };

      const result = await eventsService.getEvents(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.post('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const eventData = request.body as any;

      try {
        const event = await eventsService.createEvent(storeId, eventData);
        return reply.code(201).send({ success: true, data: event });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create event' 
        });
      }
    },
  });

  server.get('/attendees', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 50,
        eventId: query.eventId,
        status: query.status,
      };

      const result = await eventsService.getAttendees(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.post('/attendees/:id/checkin', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      try {
        const attendee = await eventsService.checkinAttendee(id, storeId);
        return reply.send({ success: true, data: attendee });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to check in' 
        });
      }
    },
  });

  server.get('/vendors', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const vendors = await eventsService.getVendors(storeId);
      return reply.send({ success: true, data: vendors });
    },
  });

  server.post('/vendors', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const vendorData = request.body as any;

      try {
        const vendor = await eventsService.createVendor(storeId, vendorData);
        return reply.code(201).send({ success: true, data: vendor });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create vendor' 
        });
      }
    },
  });

  server.get('/sponsors', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const sponsors = await eventsService.getSponsors(storeId);
      return reply.send({ success: true, data: sponsors });
    },
  });

  server.post('/sponsors', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const sponsorData = request.body as any;

      try {
        const sponsor = await eventsService.createSponsor(storeId, sponsorData);
        return reply.code(201).send({ success: true, data: sponsor });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create sponsor' 
        });
      }
    },
  });

  server.get('/tickets/sales', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
        eventId: query.eventId,
        fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
        toDate: query.toDate ? new Date(query.toDate) : undefined,
      };

      const result = await eventsService.getTicketSales(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.get('/dashboard', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const stats = await eventsService.getEventStats(storeId);
      return reply.send({ success: true, data: stats });
    },
  });
};
