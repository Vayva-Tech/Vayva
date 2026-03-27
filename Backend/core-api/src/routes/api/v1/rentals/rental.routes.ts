import { FastifyPluginAsync } from 'fastify';
import { RentalService } from '../../services/rentals/rental.service';

const rentalService = new RentalService();

export const rentalRoutes: FastifyPluginAsync = async (server) => {
  /**
   * GET /rentals/products
   * Get all rental products for store
   */
  server.get('/products', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { status, type } = request.query as { status?: string; type?: string };
      
      const products = await rentalService.getStoreRentals(storeId, { status, type });
      return reply.send({ success: true, data: products });
    },
  });

  /**
   * POST /rentals/products
   * Create rental product
   */
  server.post('/products', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const rentalData = request.body as any;

      try {
        const product = await rentalService.createRentalProduct({ ...rentalData, storeId });
        return reply.send({ success: true, data: product });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Creation failed' 
        });
      }
    },
  });

  /**
   * POST /rentals/bookings
   * Book a rental
   */
  server.post('/bookings', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const bookingData = request.body as any;

      try {
        const result = await rentalService.bookRental({ ...bookingData, storeId });
        return reply.send({ success: true, data: result });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Booking failed' 
        });
      }
    },
  });

  /**
   * POST /rentals/bookings/:bookingId/return
   * Return a rental
   */
  server.post('/bookings/:bookingId/return', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { bookingId } = request.params as { bookingId: string };
      const returnData = request.body as any;

      try {
        const result = await rentalService.returnRental(bookingId, storeId, returnData);
        return reply.send({ success: true, data: result });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Return failed' 
        });
      }
    },
  });

  /**
   * GET /rentals/customers/:customerId/active
   * Get customer's active rentals
   */
  server.get('/customers/:customerId/active', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { customerId } = request.params as { customerId: string };

      const rentals = await rentalService.getCustomerRentals(customerId, storeId);
      return reply.send({ success: true, data: rentals });
    },
  });

  /**
   * POST /rentals/bookings/:bookingId/extend
   * Extend rental
   */
  server.post('/bookings/:bookingId/extend', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { bookingId } = request.params as { bookingId: string };
      const { endDate } = request.body as { endDate: Date };

      try {
        const result = await rentalService.extendRental(bookingId, storeId, endDate);
        return reply.send({ success: true, data: result });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Extension failed' 
        });
      }
    },
  });
};
