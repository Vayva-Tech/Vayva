import { FastifyPluginAsync } from 'fastify';
import { FoodService } from '../../../../services/platform/food.service';
import { z } from 'zod';

const foodService = new FoodService();

export const foodRoutes: FastifyPluginAsync = async (server) => {
  // ==================== Ghost Brands Routes ====================
  
  /**
   * GET /api/v1/food/:storeId/ghost-brands
   * Get all ghost brands for a store
   */
  server.get('/:storeId/ghost-brands', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { storeId } = request.params;
      const brands = await foodService.getGhostBrands(storeId);
      return reply.send({ success: true, data: brands });
    },
  });

  /**
   * POST /api/v1/food/:storeId/ghost-brands
   * Create a new ghost brand
   */
  server.post('/:storeId/ghost-brands', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const brand = await foodService.createGhostBrand(request.params.storeId, request.body);
        return reply.send({ success: true, data: brand });
      } catch (error) {
        return reply.code(500).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create ghost brand' 
        });
      }
    },
  });

  // ==================== Waste Tracking Routes ====================
  
  /**
   * POST /api/v1/food/waste-log
   * Log waste entry
   */
  server.post('/waste-log', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const wasteLog = await foodService.logWaste(request.body);
        return reply.send({ success: true, data: wasteLog });
      } catch (error) {
        return reply.code(500).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to log waste' 
        });
      }
    },
  });

  /**
   * GET /api/v1/food/:storeId/waste-report
   * Get waste report for a date range
   */
  server.get('/:storeId/waste-report', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { storeId } = request.params;
      const { startDate, endDate } = request.query;
      
      const report = await foodService.getWasteReport(
        storeId,
        new Date(startDate),
        new Date(endDate)
      );
      
      if (!report) {
        return reply.code(404).send({ success: false, error: 'Waste report not found' });
      }
      
      return reply.send({ success: true, data: report });
    },
  });

  // ==================== Reservations Routes ====================
  
  /**
   * GET /api/v1/food/:storeId/reservations
   * Get reservations for a specific date
   */
  server.get('/:storeId/reservations', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { storeId } = request.params;
      const { date, status } = request.query;
      
      const reservations = await foodService.getReservations(
        storeId,
        new Date(date),
        status
      );
      return reply.send({ success: true, data: reservations });
    },
  });

  /**
   * POST /api/v1/food/reservations
   * Create a new reservation
   */
  server.post('/reservations', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const reservation = await foodService.createReservation(request.body);
        return reply.send({ success: true, data: reservation });
      } catch (error) {
        return reply.code(500).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create reservation' 
        });
      }
    },
  });

  /**
   * PATCH /api/v1/food/reservations/:id/check-in
   * Check in a reservation
   */
  server.patch('/reservations/:id/check-in', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { id } = request.params;
      const { storeId } = request.body;
      
      try {
        const reservation = await foodService.checkInReservation(id, storeId);
        return reply.send({ success: true, data: reservation });
      } catch (error) {
        return reply.code(500).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to check in reservation' 
        });
      }
    },
  });

  /**
   * PATCH /api/v1/food/reservations/:id/cancel
   * Cancel a reservation
   */
  server.patch('/reservations/:id/cancel', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { id } = request.params;
      const { storeId } = request.body;
      
      try {
        const reservation = await foodService.cancelReservation(id, storeId);
        return reply.send({ success: true, data: reservation });
      } catch (error) {
        return reply.code(500).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to cancel reservation' 
        });
      }
    },
  });

  // ==================== Dining History Routes ====================
  
  /**
   * GET /api/v1/food/:storeId/customers/:customerId/dining-history
   * Get dining history for a customer
   */
  server.get('/:storeId/customers/:customerId/dining-history', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { storeId, customerId } = request.params;
      const history = await foodService.getDiningHistory(storeId, customerId);
      
      if (!history) {
        return reply.code(404).send({ success: false, error: 'Dining history not found' });
      }
      
      return reply.send({ success: true, data: history });
    },
  });

  // ==================== Availability Slots Routes ====================
  
  /**
   * GET /api/v1/food/:storeId/available-slots
   * Get available reservation slots for a date
   */
  server.get('/:storeId/available-slots', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { storeId } = request.params;
      const { date, partySize } = request.query;
      
      const slots = await foodService.getAvailableSlots(
        storeId,
        new Date(date),
        partySize
      );
      return reply.send({ success: true, data: slots });
    },
  });

  server.log.info('[FoodRoutes] Registered food routes');
};
