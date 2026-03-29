import { FastifyPluginAsync } from 'fastify';
import { RealEstateService } from '../../../../services/platform/realestate.service';
import { z } from 'zod';

const realEstateService = new RealEstateService();

export const realestateRoutes: FastifyPluginAsync = async (server) => {
  // ==================== Virtual Tours Routes ====================
  
  /**
   * GET /api/v1/realestate/properties/:propertyId/virtual-tour
   * Get virtual tour for a property
   */
  server.get('/properties/:propertyId/virtual-tour', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { propertyId } = request.params;
      const tour = await realEstateService.getVirtualTour(propertyId);
      
      if (!tour) {
        return reply.code(404).send({ success: false, error: 'Virtual tour not found' });
      }
      
      return reply.send({ success: true, data: tour });
    },
  });

  /**
   * POST /api/v1/realestate/virtual-tours
   * Create a new virtual tour
   */
  server.post('/virtual-tours', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const tour = await realEstateService.createVirtualTour(request.body);
        return reply.send({ success: true, data: tour });
      } catch (error) {
        return reply.code(500).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create virtual tour' 
        });
      }
    },
  });

  /**
   * POST /api/v1/realestate/tours/:tourId/scenes
   * Add a scene to a virtual tour
   */
  server.post('/tours/:tourId/scenes', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { tourId } = request.params;
      
      try {
        const scene = await realEstateService.addTourScene(tourId, request.body);
        return reply.send({ success: true, data: scene });
      } catch (error) {
        return reply.code(500).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to add tour scene' 
        });
      }
    },
  });

  // ==================== Maintenance Requests Routes ====================
  
  /**
   * GET /api/v1/realestate/:storeId/maintenance-requests
   * Get all maintenance requests for a store
   */
  server.get('/:storeId/maintenance-requests', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { storeId } = request.params;
      const { status } = request.query;
      
      const requests = await realEstateService.getMaintenanceRequests(storeId, status);
      return reply.send({ success: true, data: requests });
    },
  });

  /**
   * POST /api/v1/realestate/maintenance-requests
   * Create a new maintenance request
   */
  server.post('/maintenance-requests', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const request_data = await realEstateService.createMaintenanceRequest(request.body);
        return reply.send({ success: true, data: request_data });
      } catch (error) {
        return reply.code(500).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create maintenance request' 
        });
      }
    },
  });

  /**
   * POST /api/v1/realestate/maintenance-requests/:id/assign
   * Assign a maintenance request to staff
   */
  server.post('/maintenance-requests/:id/assign', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { id } = request.params;
      const { assignedTo } = request.body;
      
      try {
        const request_data = await realEstateService.assignMaintenanceRequest(id, assignedTo);
        return reply.send({ success: true, data: request_data });
      } catch (error) {
        return reply.code(500).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to assign maintenance request' 
        });
      }
    },
  });

  /**
   * POST /api/v1/realestate/maintenance-requests/:id/complete
   * Complete a maintenance request
   */
  server.post('/maintenance-requests/:id/complete', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { id } = request.params;
      const { cost, notes } = request.body;
      
      try {
        const request_data = await realEstateService.completeMaintenanceRequest(id, { cost, notes });
        return reply.send({ success: true, data: request_data });
      } catch (error) {
        return reply.code(500).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to complete maintenance request' 
        });
      }
    },
  });

  /**
   * POST /api/v1/realestate/maintenance-requests/:id/feedback
   * Add tenant feedback to a completed request
   */
  server.post('/maintenance-requests/:id/feedback', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { id } = request.params;
      const { rating, feedback } = request.body;
      
      try {
        const request_data = await realEstateService.addTenantFeedback(id, { rating, feedback });
        return reply.send({ success: true, data: request_data });
      } catch (error) {
        return reply.code(500).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to add tenant feedback' 
        });
      }
    },
  });

  // ==================== Analytics Routes ====================
  
  /**
   * GET /api/v1/realestate/:storeId/maintenance/analytics
   * Get maintenance analytics for a period
   */
  server.get('/:storeId/maintenance/analytics', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { storeId } = request.params;
      const { period } = request.query;
      
      const analytics = await realEstateService.getMaintenanceAnalytics(storeId, period);
      
      if (!analytics) {
        return reply.code(404).send({ success: false, error: 'Analytics not found' });
      }
      
      return reply.send({ success: true, data: analytics });
    },
  });

  server.log.info('[RealEstateRoutes] Registered real estate routes');
};
