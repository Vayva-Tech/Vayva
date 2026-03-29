import { FastifyPluginAsync } from 'fastify';
import { RestaurantService } from '../../../../services/industry/restaurant.service';

const restaurantService = new RestaurantService();

export const restaurantRoutes: FastifyPluginAsync = async (server) => {
  server.get('/kds/tickets', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        status: query.status as any,
        station: query.station,
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 50,
      };

      const result = await restaurantService.getKitchenTickets(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.post('/kds/tickets', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const ticketData = request.body as any;

      try {
        const ticket = await restaurantService.createKitchenTicket(storeId, ticketData);
        return reply.code(201).send({ success: true, data: ticket });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create ticket' 
        });
      }
    },
  });

  server.put('/kds/tickets/:id/status', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;
      const { status } = request.body as any;

      try {
        const ticket = await restaurantService.updateTicketStatus(id, storeId, status);
        return reply.send({ success: true, data: ticket });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to update status' 
        });
      }
    },
  });

  server.post('/kds/tickets/:id/void', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;
      const { reason } = request.body as any;

      try {
        const ticket = await restaurantService.voidTicket(id, storeId, reason);
        return reply.send({ success: true, data: ticket });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to void ticket' 
        });
      }
    },
  });

  server.get('/kds/stations', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const stations = await restaurantService.getKDSStations(storeId);
      return reply.send({ success: true, data: stations });
    },
  });

  server.post('/kds/stations', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const stationData = request.body as any;

      try {
        const station = await restaurantService.createKDSStation(storeId, stationData);
        return reply.code(201).send({ success: true, data: station });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create station' 
        });
      }
    },
  });

  server.put('/kds/stations/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;
      const updates = request.body as any;

      try {
        const station = await restaurantService.updateKDSStation(id, storeId, updates);
        return reply.send({ success: true, data: station });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to update station' 
        });
      }
    },
  });

  server.delete('/kds/stations/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      try {
        const result = await restaurantService.deleteKDSStation(id, storeId);
        return reply.send(result);
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to delete station' 
        });
      }
    },
  });

  server.get('/kds/stats', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const stats = await restaurantService.getTicketStats(storeId);
      return reply.send({ success: true, data: stats });
    },
  });

  // Menu Items endpoints
  server.post('/menu-items', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const data = request.body as any;

      try {
        const product = await restaurantService.createMenuItem(storeId, data);
        return reply.code(201).send({ success: true, data: product });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create menu item',
        });
      }
    },
  });

  server.get('/kitchen/orders', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const orders = await restaurantService.getKitchenOrders(storeId);
      return reply.send({ success: true, data: orders });
    },
  });

  server.put('/kitchen/orders/:id/status', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;
      const { status } = request.body as any;

      try {
        const order = await restaurantService.updateOrderStatus(id, status);
        return reply.send({ success: true, data: order });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update order status',
        });
      }
    },
  });
};
