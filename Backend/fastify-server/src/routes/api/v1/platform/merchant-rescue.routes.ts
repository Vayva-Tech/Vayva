import { FastifyPluginAsync } from 'fastify';
import { MerchantRescueService } from '../../../../services/security/merchant-rescue.service';
import { z } from 'zod';

const merchantRescueService = new MerchantRescueService();

export const merchantRescueRoutes: FastifyPluginAsync = async (server) => {
  /**
   * POST /api/v1/rescue/incidents
   * Report an incident
   */
  server.post('/incidents', {
    preHandler: [server.authenticate],
    schema: {
      body: z.object({
        errorMessage: z.string(),
        fingerprint: z.string().optional(),
        route: z.string().optional(),
        storeId: z.string().uuid().optional(),
        userId: z.string().uuid().optional(),
        stackHash: z.string().optional(),
      }),
    },
    handler: async (request, reply) => {
      try {
        const data = request.body;

        const incident = await merchantRescueService.reportIncident(data);

        return reply.send({ success: true, data: incident });
      } catch (error) {
        server.log.error('[RescueRoute] Report incident failed', error);
        throw error;
      }
    },
  });

  /**
   * GET /api/v1/rescue/incidents/:id
   * Get incident status
   */
  server.get('/incidents/:id', {
    preHandler: [server.authenticate],
    schema: {
      params: z.object({
        id: z.string().uuid(),
      }),
    },
    handler: async (request, reply) => {
      try {
        const { id } = request.params;

        const incident = await merchantRescueService.getIncidentStatus(id);

        return reply.send({ success: true, data: incident });
      } catch (error) {
        server.log.error('[RescueRoute] Get incident failed', error);
        throw error;
      }
    },
  });

  /**
   * POST /api/v1/rescue/incidents/:id/analyze
   * Trigger AI analysis for an incident
   */
  server.post('/incidents/:id/analyze', {
    preHandler: [server.authenticate],
    schema: {
      params: z.object({
        id: z.string().uuid(),
      }),
    },
    handler: async (request, reply) => {
      try {
        const { id } = request.params;

        // Trigger analysis (non-blocking)
        merchantRescueService.analyzeAndSuggest(id).catch((err) => {
          server.log.error('[RescueRoute] Background analysis failed', err);
        });

        return reply.send({
          success: true,
          message: 'Analysis triggered',
        });
      } catch (error) {
        server.log.error('[RescueRoute] Analyze incident failed', error);
        throw error;
      }
    },
  });

  /**
   * GET /api/v1/rescue/incidents/list
   * List incidents for a store
   */
  server.get('/incidents/list', {
    preHandler: [server.authenticate],
    schema: {
      querystring: z.object({
        limit: z.number().optional().default(50),
      }),
    },
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const { limit } = request.query;

        const incidents = await merchantRescueService.listIncidents(
          storeId,
          limit
        );

        return reply.send({ success: true, data: incidents });
      } catch (error) {
        server.log.error('[RescueRoute] List incidents failed', error);
        throw error;
      }
    },
  });

  /**
   * GET /api/v1/rescue/stats
   * Get incident statistics
   */
  server.get('/stats', {
    preHandler: [server.authenticate],
    schema: {
      querystring: z.object({
        days: z.number().optional().default(7),
      }),
    },
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const { days } = request.query;

        const stats = await merchantRescueService.getIncidentStats(storeId, days);

        return reply.send({ success: true, data: stats });
      } catch (error) {
        server.log.error('[RescueRoute] Get stats failed', error);
        throw error;
      }
    },
  });
};
