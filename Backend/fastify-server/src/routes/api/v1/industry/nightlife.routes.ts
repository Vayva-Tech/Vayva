import { FastifyPluginAsync } from 'fastify';
import { NightlifeService } from '../../../services/industry/nightlife.service';

const nightlifeService = new NightlifeService();

export const nightlifeRoutes: FastifyPluginAsync = async (server) => {
  server.get('/tickets', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const filter = (request.query as any).filter || 'all';

      const tickets = await nightlifeService.getTickets(storeId, filter);
      return reply.send({ success: true, data: tickets });
    },
  });

  server.post('/tickets/:id/check-in', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      try {
        const result = await nightlifeService.checkInTicket(id, storeId);
        return reply.send(result);
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to check in' 
        });
      }
    },
  });

  server.get('/tables/status', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const tables = await nightlifeService.getTablesStatus(storeId);
      return reply.send({ success: true, data: tables });
    },
  });

  server.get('/reservations', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
        date: query.date,
        status: query.status,
      };

      const result = await nightlifeService.getReservations(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.post('/reservations', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const reservationData = request.body as any;

      try {
        const reservation = await nightlifeService.createReservation(storeId, reservationData);
        return reply.code(201).send({ success: true, data: reservation });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create reservation' 
        });
      }
    },
  });

  server.post('/reservations/:id/cancel', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      try {
        const result = await nightlifeService.cancelReservation(id, storeId);
        return reply.send({ success: true, data: result });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to cancel reservation' 
        });
      }
    },
  });

  server.get('/promoters', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const promoters = await nightlifeService.getPromoters(storeId);
      return reply.send({ success: true, data: promoters });
    },
  });

  server.get('/security/log', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 50,
        type: query.type,
        fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
        toDate: query.toDate ? new Date(query.toDate) : undefined,
      };

      const result = await nightlifeService.getSecurityLog(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.post('/security/log', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const incidentData = request.body as any;

      try {
        const log = await nightlifeService.logSecurityIncident(storeId, incidentData);
        return reply.code(201).send({ success: true, data: log });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to log incident' 
        });
      }
    },
  });

  server.get('/bottle-service/packages', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const packages = await nightlifeService.getBottleServicePackages(storeId);
      return reply.send({ success: true, data: packages });
    },
  });

  server.get('/bottle-service/orders', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
        status: query.status,
      };

      const result = await nightlifeService.getBottleServiceOrders(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.get('/guest-list', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 50,
        date: query.date,
      };

      const result = await nightlifeService.getGuestList(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.post('/guest-list', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const guestData = request.body as any;

      try {
        const entry = await nightlifeService.addToGuestList(storeId, guestData);
        return reply.code(201).send({ success: true, data: entry });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to add to guest list' 
        });
      }
    },
  });

  server.get('/dashboard', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const stats = await nightlifeService.getNightlifeStats(storeId);
      return reply.send({ success: true, data: stats });
    },
  });
};
