import { FastifyPluginAsync } from 'fastify';
import { CustomerSegmentationService } from '../../../../services/security/customer-segmentation.service';
import { z } from 'zod';

const customerSegmentationService = new CustomerSegmentationService();

export const customerSegmentationRoutes: FastifyPluginAsync = async (server) => {
  /**
   * GET /api/v1/segmentation/:storeId/rfm
   * Perform RFM analysis for a store
   */
  server.get('/segmentation/:storeId/rfm', {
    preHandler: [server.authenticate],
    schema: {
      params: z.object({
        storeId: z.string().uuid(),
      }),
    },
    handler: async (request, reply) => {
      try {
        const { storeId } = request.params;

        const rfmCustomers = await customerSegmentationService.performRFMAnalysis(storeId);

        return reply.send({ success: true, data: rfmCustomers });
      } catch (error) {
        server.log.error('[SegmentationRoute] RFM analysis failed', error);
        throw error;
      }
    },
  });

  /**
   * GET /api/v1/segmentation/segments
   * Get all segments for a store
   */
  server.get('/segmentation/segments', {
    preHandler: [server.authenticate],
    schema: {
      querystring: z.object({
        storeId: z.string().uuid(),
      }),
    },
    handler: async (request, reply) => {
      try {
        const { storeId } = request.query;

        const segments = await customerSegmentationService.getSegments(storeId);

        return reply.send({ success: true, data: segments });
      } catch (error) {
        server.log.error('[SegmentationRoute] Get segments failed', error);
        throw error;
      }
    },
  });

  /**
   * POST /api/v1/segmentation/segments
   * Create a new segment
   */
  server.post('/segmentation/segments', {
    preHandler: [server.authenticate],
    schema: {
      body: z.object({
        storeId: z.string().uuid(),
        name: z.string(),
        criteria: z.record(z.unknown()),
        description: z.string().optional(),
        color: z.string().optional(),
        icon: z.string().optional(),
      }),
    },
    handler: async (request, reply) => {
      try {
        const { storeId, name, criteria, description, color, icon } = request.body;

        const segment = await customerSegmentationService.createSegment(
          storeId,
          name,
          criteria as any,
          description,
          color,
          icon
        );

        return reply.send({ success: true, data: segment });
      } catch (error) {
        server.log.error('[SegmentationRoute] Create segment failed', error);
        throw error;
      }
    },
  });

  /**
   * PATCH /api/v1/segmentation/segments/:id
   * Update an existing segment
   */
  server.patch('/segmentation/segments/:id', {
    preHandler: [server.authenticate],
    schema: {
      params: z.object({
        id: z.string().uuid(),
      }),
      body: z.record(z.unknown()),
    },
    handler: async (request, reply) => {
      try {
        const { id } = request.params;
        const updates = request.body;

        const segment = await customerSegmentationService.updateSegment(id, updates as any);

        return reply.send({ success: true, data: segment });
      } catch (error) {
        server.log.error('[SegmentationRoute] Update segment failed', error);
        throw error;
      }
    },
  });

  /**
   * DELETE /api/v1/segmentation/segments/:id
   * Delete a segment
   */
  server.delete('/segmentation/segments/:id', {
    preHandler: [server.authenticate],
    schema: {
      params: z.object({
        id: z.string().uuid(),
      }),
    },
    handler: async (request, reply) => {
      try {
        const { id } = request.params;

        await customerSegmentationService.deleteSegment(id);

        return reply.send({ success: true });
      } catch (error) {
        server.log.error('[SegmentationRoute] Delete segment failed', error);
        throw error;
      }
    },
  });

  /**
   * POST /api/v1/segmentation/memberships
   * Assign customer to segment
   */
  server.post('/segmentation/memberships', {
    preHandler: [server.authenticate],
    schema: {
      body: z.object({
        customerId: z.string().uuid(),
        segmentId: z.string().uuid(),
        score: z.number(),
      }),
    },
    handler: async (request, reply) => {
      try {
        const { customerId, segmentId, score } = request.body;

        const membership = await customerSegmentationService.assignCustomerToSegment(
          customerId,
          segmentId,
          score
        );

        return reply.send({ success: true, data: membership });
      } catch (error) {
        server.log.error('[SegmentationRoute] Assign customer failed', error);
        throw error;
      }
    },
  });

  /**
   * DELETE /api/v1/segmentation/memberships
   * Remove customer from segment
   */
  server.delete('/segmentation/memberships', {
    preHandler: [server.authenticate],
    schema: {
      querystring: z.object({
        customerId: z.string().uuid(),
        segmentId: z.string().uuid(),
      }),
    },
    handler: async (request, reply) => {
      try {
        const { customerId, segmentId } = request.query;

        await customerSegmentationService.removeCustomerFromSegment(
          customerId,
          segmentId
        );

        return reply.send({ success: true });
      } catch (error) {
        server.log.error('[SegmentationRoute] Remove customer failed', error);
        throw error;
      }
    },
  });

  /**
   * GET /api/v1/segmentation/customer-segments
   * Get segments for a customer
   */
  server.get('/segmentation/customer-segments', {
    preHandler: [server.authenticate],
    schema: {
      querystring: z.object({
        customerId: z.string().uuid(),
      }),
    },
    handler: async (request, reply) => {
      try {
        const { customerId } = request.query;

        const segments = await customerSegmentationService.getCustomerSegments(customerId);

        return reply.send({ success: true, data: segments });
      } catch (error) {
        server.log.error('[SegmentationRoute] Get customer segments failed', error);
        throw error;
      }
    },
  });

  /**
   * GET /api/v1/segmentation/segments/:id/customers
   * Get customers in a segment
   */
  server.get('/segmentation/segments/:id/customers', {
    preHandler: [server.authenticate],
    schema: {
      params: z.object({
        id: z.string().uuid(),
      }),
    },
    handler: async (request, reply) => {
      try {
        const { id } = request.params;

        const customers = await customerSegmentationService.getSegmentCustomers(id);

        return reply.send({ success: true, data: customers });
      } catch (error) {
        server.log.error('[SegmentationRoute] Get segment customers failed', error);
        throw error;
      }
    },
  });

  /**
   * POST /api/v1/segmentation/predefined
   * Create predefined segment templates
   */
  server.post('/segmentation/predefined', {
    preHandler: [server.authenticate],
    schema: {
      body: z.object({
        storeId: z.string().uuid(),
      }),
    },
    handler: async (request, reply) => {
      try {
        const { storeId } = request.body;

        const segments = await customerSegmentationService.createPredefinedSegments(storeId);

        return reply.send({ success: true, data: segments });
      } catch (error) {
        server.log.error('[SegmentationRoute] Create predefined segments failed', error);
        throw error;
      }
    },
  });

  /**
   * GET /api/v1/segmentation/:storeId/overview
   * Get segment overview statistics
   */
  server.get('/segmentation/:storeId/overview', {
    preHandler: [server.authenticate],
    schema: {
      params: z.object({
        storeId: z.string().uuid(),
      }),
    },
    handler: async (request, reply) => {
      try {
        const { storeId } = request.params;

        const overview = await customerSegmentationService.getSegmentOverview(storeId);

        return reply.send({ success: true, data: overview });
      } catch (error) {
        server.log.error('[SegmentationRoute] Get overview failed', error);
        throw error;
      }
    },
  });
};
