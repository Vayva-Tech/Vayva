import { FastifyPluginAsync } from 'fastify';
import { ActivityLoggerService } from '../../../../services/security/activity-server.log.service';
import { z } from 'zod';

const activityLoggerService = new ActivityLoggerService();

export const activityLoggerRoutes: FastifyPluginAsync = async (server) => {
  /**
   * POST /api/v1/audit/log
   * Log an activity
   */
  server.post('/log', {
    preHandler: [server.authenticate],
    schema: {
      body: z.object({
        storeId: z.string().uuid(),
        actorUserId: z.string().uuid(),
        action: z.string(),
        targetType: z.string(),
        targetId: z.string(),
        reason: z.string().optional(),
        before: z.record(z.unknown()).optional(),
        after: z.record(z.unknown()).optional(),
      }),
    },
    handler: async (request, reply) => {
      try {
        const payload = request.body;

        await activityLoggerService.logActivity(payload);

        return reply.send({ success: true });
      } catch (error) {
        server.log.error('[ActivityRoute] Log activity failed', error);
        throw error;
      }
    },
  });

  /**
   * GET /api/v1/audit/logs
   * Get audit logs for a store
   */
  server.get('/logs', {
    preHandler: [server.authenticate],
    schema: {
      querystring: z.object({
        limit: z.number().optional().default(100),
        offset: z.number().optional().default(0),
        action: z.string().optional(),
        targetType: z.string().optional(),
        targetId: z.string().optional(),
        actorUserId: z.string().uuid().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }),
    },
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const query = request.query;

        const options = {
          limit: query.limit,
          offset: query.offset,
          action: query.action,
          targetType: query.targetType,
          targetId: query.targetId,
          actorUserId: query.actorUserId,
          startDate: query.startDate
            ? new Date(query.startDate)
            : undefined,
          endDate: query.endDate ? new Date(query.endDate) : undefined,
        };

        const logs = await activityLoggerService.getAuditLogs(storeId, options);

        return reply.send({ success: true, data: logs });
      } catch (error) {
        server.log.error('[ActivityRoute] Get logs failed', error);
        throw error;
      }
    },
  });

  /**
   * GET /api/v1/audit/stats
   * Get activity statistics
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

        const stats = await activityLoggerService.getActivityStats(storeId, days);

        return reply.send({ success: true, data: stats });
      } catch (error) {
        server.log.error('[ActivityRoute] Get stats failed', error);
        throw error;
      }
    },
  });

  /**
   * GET /api/v1/audit/target/:targetType/:targetId/history
   * Get history for a specific target
   */
  server.get('/target/:targetType/:targetId/history', {
    preHandler: [server.authenticate],
    schema: {
      params: z.object({
        targetType: z.string(),
        targetId: z.string(),
      }),
      querystring: z.object({
        limit: z.number().optional().default(50),
      }),
    },
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const { targetType, targetId } = request.params;
        const { limit } = request.query;

        const history = await activityLoggerService.getTargetHistory(
          storeId,
          targetType,
          targetId,
          limit
        );

        return reply.send({ success: true, data: history });
      } catch (error) {
        server.log.error('[ActivityRoute] Get target history failed', error);
        throw error;
      }
    },
  });

  /**
   * GET /api/v1/audit/search
   * Search audit logs
   */
  server.get('/search', {
    preHandler: [server.authenticate],
    schema: {
      querystring: z.object({
        q: z.string(),
        limit: z.number().optional().default(100),
      }),
    },
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const { q, limit } = request.query;

        const results = await activityLoggerService.searchAuditLogs(
          storeId,
          q,
          limit
        );

        return reply.send({ success: true, data: results });
      } catch (error) {
        server.log.error('[ActivityRoute] Search failed', error);
        throw error;
      }
    },
  });
};
