import { FastifyPluginAsync } from 'fastify';
import { BookingService } from '../../../../services/core/booking.service';

const bookingService = new BookingService();

export const bookingsRoutes: FastifyPluginAsync = async (server) => {
  // GET /api/v1/bookings - List bookings with date filters
  server.get('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const start = query.start ? new Date(query.start) : undefined;
      const end = query.end ? new Date(query.end) : undefined;

      try {
        const bookings = await bookingService.getBookings(storeId, start, end);
        return reply.send({ success: true, data: bookings });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch bookings',
        });
      }
    },
  });

  // POST /api/v1/bookings - Create new booking
  server.post('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const body = request.body as any;

      try {
        const booking = await bookingService.createBooking(storeId, body);
        return reply.code(201).send({ success: true, data: booking });
      } catch (error) {
        if (error instanceof Error && error.message.includes('Invalid')) {
          return reply.code(400).send({
            success: false,
            error: error.message,
          });
        }
        if (error instanceof Error && error.message.includes('conflicts')) {
          return reply.code(409).send({
            success: false,
            error: error.message,
          });
        }
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create booking',
        });
      }
    },
  });

  // PATCH /api/v1/bookings/:id/status - Update booking status
  server.patch('/:id/status', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;
      const { status } = request.body as any;

      if (!status) {
        return reply.code(400).send({
          success: false,
          error: 'Status is required',
        });
      }

      try {
        const updated = await bookingService.updateBookingStatus(id, storeId, status);
        return reply.send({ success: true, data: updated });
      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          return reply.code(404).send({
            success: false,
            error: error.message,
          });
        }
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update booking status',
        });
      }
    },
  });

  // POST /api/v1/bookings/:id/cancel - Cancel booking
  server.post('/:id/cancel', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;
      const { reason } = request.body as any;

      try {
        const updated = await bookingService.cancelBooking(id, storeId, reason);
        return reply.send({ success: true, data: updated });
      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          return reply.code(404).send({
            success: false,
            error: error.message,
          });
        }
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to cancel booking',
        });
      }
    },
  });
};
