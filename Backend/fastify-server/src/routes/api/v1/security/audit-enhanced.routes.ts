import { FastifyPluginAsync } from 'fastify';
import { AuditEnhancedService, AuditEventType } from '../../../../services/security/audit-enhanced.service';
import { z } from 'zod';

const auditEnhancedService = new AuditEnhancedService();

// Schema for audit event types
const auditEventTypeSchema = z.nativeEnum(AuditEventType);

export const auditEnhancedRoutes: FastifyPluginAsync = async (server) => {
  /**
   * POST /api/v1/audit/log
   * Log an audit event
   */
  server.post('/log', {
    preHandler: [server.authenticate],
    schema: {
      body: z.object({
        eventType: auditEventTypeSchema,
        userId: z.string().uuid(),
        storeId: z.string().uuid().nullable().optional(),
        meta: z.object({
          ipAddress: z.string().optional(),
          userAgent: z.string().optional(),
          targetType: z.string().optional(),
          targetId: z.string().optional(),
          reason: z.string().optional(),
          changes: z.record(z.unknown()).optional(),
          meta: z.record(z.unknown()).optional(),
        }).optional(),
      }),
    },
    handler: async (request, reply) => {
      try {
        const { eventType, userId, storeId, meta } = request.body;
        
        await auditEnhancedService.logAuditEvent(storeId || null, userId, eventType, meta);
        
        return reply.send({ success: true });
      } catch (error) {
        server.log.error('[AuditRoute] Log event failed', error);
        throw error;
      }
    },
  });

  /**
   * GET /api/v1/audit/logs
   * Get audit logs with filtering
   */
  server.get('/logs', {
    preHandler: [server.authenticate],
    schema: {
      querystring: z.object({
        storeId: z.string().uuid(),
        userId: z.string().uuid().optional(),
        eventType: auditEventTypeSchema.optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        limit: z.number().optional().default(50),
        offset: z.number().optional().default(0),
      }),
    },
    handler: async (request, reply) => {
      try {
        const { storeId, userId, eventType, startDate, endDate, limit, offset } = request.query;
        
        const options: any = {
          storeId,
          limit,
          offset,
        };

        if (userId) options.userId = userId;
        if (eventType) options.eventType = eventType;
        if (startDate) options.startDate = new Date(startDate);
        if (endDate) options.endDate = new Date(endDate);

        const result = await auditEnhancedService.getAuditLogs(options);
        
        return reply.send(result);
      } catch (error) {
        server.log.error('[AuditRoute] Get logs failed', error);
        throw error;
      }
    },
  });

  /**
   * GET /api/v1/audit/suspicious-report
   * Get suspicious activity report
   */
  server.get('/suspicious-report', {
    preHandler: [server.authenticate],
    schema: {
      querystring: z.object({
        storeId: z.string().uuid(),
        days: z.number().optional().default(7),
      }),
    },
    handler: async (request, reply) => {
      try {
        const { storeId, days } = request.query;
        
        const report = await auditEnhancedService.getSuspiciousActivityReport(storeId, days);
        
        return reply.send(report);
      } catch (error) {
        server.log.error('[AuditRoute] Suspicious report failed', error);
        throw error;
      }
    },
  });

  /**
   * GET /api/v1/audit/activity-summary
   * Get recent activity summary
   */
  server.get('/activity-summary', {
    preHandler: [server.authenticate],
    schema: {
      querystring: z.object({
        storeId: z.string().uuid(),
        hours: z.number().optional().default(24),
      }),
    },
    handler: async (request, reply) => {
      try {
        const { storeId, hours } = request.query;
        
        const summary = await auditEnhancedService.getRecentActivitySummary(storeId, hours);
        
        return reply.send(summary);
      } catch (error) {
        server.log.error('[AuditRoute] Activity summary failed', error);
        throw error;
      }
    },
  });

  /**
   * POST /api/v1/audit/export
   * Export audit logs as CSV
   */
  server.post('/export', {
    preHandler: [server.authenticate],
    schema: {
      body: z.object({
        storeId: z.string().uuid(),
        startDate: z.string(),
        endDate: z.string(),
      }),
    },
    handler: async (request, reply) => {
      try {
        const { storeId, startDate, endDate } = request.body;
        
        const csv = await auditEnhancedService.exportAuditLogs(
          storeId,
          new Date(startDate),
          new Date(endDate)
        );
        
        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', `attachment; filename="audit-logs-${storeId}.csv"`);
        return reply.send(csv);
      } catch (error) {
        server.log.error('[AuditRoute] Export failed', error);
        throw error;
      }
    },
  });

  /**
   * DELETE /api/v1/audit/cleanup
   * Clear old audit logs (retention policy)
   */
  server.delete('/cleanup', {
    preHandler: [server.authenticate],
    schema: {
      body: z.object({
        retentionDays: z.number().optional().default(90),
      }),
    },
    handler: async (request, reply) => {
      try {
        const { retentionDays } = request.body;
        
        const deletedCount = await auditEnhancedService.clearOldAuditLogs(retentionDays);
        
        return reply.send({ 
          success: true, 
          data: { deletedCount, retentionDays } 
        });
      } catch (error) {
        server.log.error('[AuditRoute] Cleanup failed', error);
        throw error;
      }
    },
  });
};
