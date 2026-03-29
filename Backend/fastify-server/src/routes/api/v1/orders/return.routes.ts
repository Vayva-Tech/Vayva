import { FastifyPluginAsync } from 'fastify';
import { ReturnService } from '../../../../services/security/return.service';
import { z } from 'zod';

const returnService = new ReturnService();

export const returnRoutes: FastifyPluginAsync = async (server) => {
  /**
   * POST /api/v1/returns/request
   * Create a new return request
   */
  server.post('/request', {
    preHandler: [server.authenticate],
    schema: {
      body: z.object({
        orderId: z.string().uuid(),
        customerPhone: z.string(),
        payload: z.record(z.unknown()),
      }),
    },
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const { orderId, customerPhone, payload } = request.body;

        const result = await returnService.createRequest(
          storeId,
          orderId,
          customerPhone,
          payload
        );

        return reply.send({ success: true, data: result });
      } catch (error) {
        server.log.error('[ReturnRoute] Create request failed', error);
        throw error;
      }
    },
  });

  /**
   * GET /api/v1/returns/requests
   * Get all return requests for a store
   */
  server.get('/requests', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;

        const requests = await returnService.getRequests(storeId);

        return reply.send({ success: true, data: requests });
      } catch (error) {
        server.log.error('[ReturnRoute] Get requests failed', error);
        throw error;
      }
    },
  });

  /**
   * GET /api/v1/returns/request/:id
   * Get a single return request by ID
   */
  server.get('/request/:id', {
    preHandler: [server.authenticate],
    schema: {
      params: z.object({
        id: z.string().uuid(),
      }),
    },
    handler: async (request, reply) => {
      try {
        const { id } = request.params;

        const result = await returnService.getRequestById(id);

        return reply.send({ success: true, data: result });
      } catch (error) {
        server.log.error('[ReturnRoute] Get request failed', error);
        throw error;
      }
    },
  });

  /**
   * PATCH /api/v1/returns/request/:id/status
   * Update return request status
   */
  server.patch('/request/:id/status', {
    preHandler: [server.authenticate],
    schema: {
      params: z.object({
        id: z.string().uuid(),
      }),
      body: z.object({
        status: z.enum(['PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED']),
        notes: z.string().optional(),
      }),
    },
    handler: async (request, reply) => {
      try {
        const { id } = request.params;
        const { status, notes } = request.body;
        const actorId = (request.user as any).userId;

        await returnService.updateStatus(id, status, actorId, { notes });

        return reply.send({ success: true });
      } catch (error) {
        server.log.error('[ReturnRoute] Update status failed', error);
        throw error;
      }
    },
  });

  /**
   * POST /api/v1/returns/request/:id/cancel
   * Cancel a return request
   */
  server.post('/request/:id/cancel', {
    preHandler: [server.authenticate],
    schema: {
      params: z.object({
        id: z.string().uuid(),
      }),
      body: z.object({
        reason: z.string().optional(),
      }),
    },
    handler: async (request, reply) => {
      try {
        const { id } = request.params;
        const { reason } = request.body;

        await returnService.cancelRequest(id, reason);

        return reply.send({ success: true });
      } catch (error) {
        server.log.error('[ReturnRoute] Cancel request failed', error);
        throw error;
      }
    },
  });

  /**
   * POST /api/v1/returns/request/:id/approve
   * Approve a return request
   */
  server.post('/request/:id/approve', {
    preHandler: [server.authenticate],
    schema: {
      params: z.object({
        id: z.string().uuid(),
      }),
      body: z.object({
        notes: z.string().optional(),
      }),
    },
    handler: async (request, reply) => {
      try {
        const { id } = request.params;
        const { notes } = request.body;

        await returnService.approveRequest(id, notes);

        return reply.send({ success: true });
      } catch (error) {
        server.log.error('[ReturnRoute] Approve request failed', error);
        throw error;
      }
    },
  });

  /**
   * POST /api/v1/returns/request/:id/complete
   * Complete a return request
   */
  server.post('/request/:id/complete', {
    preHandler: [server.authenticate],
    schema: {
      params: z.object({
        id: z.string().uuid(),
      }),
      body: z.object({
        notes: z.string().optional(),
      }),
    },
    handler: async (request, reply) => {
      try {
        const { id } = request.params;
        const { notes } = request.body;

        await returnService.completeRequest(id, notes);

        return reply.send({ success: true });
      } catch (error) {
        server.log.error('[ReturnRoute] Complete request failed', error);
        throw error;
      }
    },
  });

  /**
   * GET /api/v1/returns/stats
   * Get return statistics for a store
   */
  server.get('/stats', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;

        const stats = await returnService.getReturnStats(storeId);

        return reply.send({ success: true, data: stats });
      } catch (error) {
        server.log.error('[ReturnRoute] Get stats failed', error);
        throw error;
      }
    },
  });
};
