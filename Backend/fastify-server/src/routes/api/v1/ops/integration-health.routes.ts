import { FastifyPluginAsync } from 'fastify';
import { IntegrationHealthService } from '../../../../services/security/integration-health.service';
import { z } from 'zod';

const integrationHealthService = new IntegrationHealthService();

export const integrationHealthRoutes: FastifyPluginAsync = async (server) => {
  /**
   * POST /api/v1/integration-health/log
   * Log an integration event
   */
  server.post('/log', {
    preHandler: [server.authenticate],
    schema: {
      body: z.object({
        integrationKey: z.string(),
        eventType: z.string(),
        status: z.enum(['SUCCESS', 'FAIL']),
      }),
    },
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const { integrationKey, eventType, status } = request.body;

        await integrationHealthService.logIntegrationEvent(
          storeId,
          integrationKey,
          eventType,
          status
        );

        return reply.send({ success: true });
      } catch (error) {
        server.log.error('[IntegrationHealthRoute] Log event failed', error);
        throw error;
      }
    },
  });

  /**
   * GET /api/v1/integration-health/status
   * Get integration health status for all integrations
   */
  server.get('/status', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;

        const health = await integrationHealthService.getIntegrationHealth(storeId);

        return reply.send({ success: true, data: health });
      } catch (error) {
        server.log.error('[IntegrationHealthRoute] Get status failed', error);
        throw error;
      }
    },
  });

  /**
   * GET /api/v1/integration-health/history
   * Get integration event history
   */
  server.get('/history', {
    preHandler: [server.authenticate],
    schema: {
      querystring: z.object({
        integrationKey: z.string().optional(),
        limit: z.number().optional().default(50),
      }),
    },
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const { integrationKey, limit } = request.query;

        const history = await integrationHealthService.getIntegrationHistory(
          storeId,
          integrationKey,
          limit
        );

        return reply.send({ success: true, data: history });
      } catch (error) {
        server.log.error('[IntegrationHealthRoute] Get history failed', error);
        throw error;
      }
    },
  });

  /**
   * GET /api/v1/integration-health/stats
   * Get integration statistics
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

        const stats = await integrationHealthService.getIntegrationStats(storeId, days);

        return reply.send({ success: true, data: stats });
      } catch (error) {
        server.log.error('[IntegrationHealthRoute] Get stats failed', error);
        throw error;
      }
    },
  });

  /**
   * GET /api/v1/integration-health/check/:integrationKey
   * Check if a specific integration is healthy
   */
  server.get('/check/:integrationKey', {
    preHandler: [server.authenticate],
    schema: {
      params: z.object({
        integrationKey: z.string(),
      }),
      querystring: z.object({
        thresholdHours: z.number().optional().default(24),
      }),
    },
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const { integrationKey } = request.params;
        const { thresholdHours } = request.query;

        const isHealthy = await integrationHealthService.isIntegrationHealthy(
          storeId,
          integrationKey,
          thresholdHours
        );

        return reply.send({ success: true, data: { healthy: isHealthy } });
      } catch (error) {
        server.log.error('[IntegrationHealthRoute] Check health failed', error);
        throw error;
      }
    },
  });
};
