import { FastifyPluginAsync } from 'fastify';
import { TravelService } from '../../../../services/industry/travel.service';

const travelService = new TravelService();

export const travelRoutes: FastifyPluginAsync = async (server) => {
  server.get('/bookings', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
        status: query.status,
        customerId: query.customerId,
        startDate: query.startDate,
        endDate: query.endDate,
      };

      const result = await travelService.findAll(storeId, filters);
      return reply.send({ success: true, data: result.data, meta: result.meta });
    },
  });

  server.post('/bookings', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const data = request.body as any;

      try {
        const booking = await travelService.create(storeId, data);
        return reply.code(201).send({ success: true, data: booking });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create booking',
        });
      }
    },
  });

  server.get('/bookings/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      try {
        const booking = await travelService.findOne(id, storeId);
        return reply.send({ success: true, data: booking });
      } catch (error) {
        return reply.code(404).send({
          success: false,
          error: error instanceof Error ? error.message : 'Booking not found',
        });
      }
    },
  });

  server.patch('/bookings/:id/status', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;
      const { status } = request.body as any;

      try {
        const booking = await travelService.updateStatus(id, storeId, status);
        return reply.send({ success: true, data: booking });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update status',
        });
      }
    },
  });

  server.delete('/bookings/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      try {
        await travelService.delete(id, storeId);
        return reply.send({ success: true });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to delete booking',
        });
      }
    },
  });
};
