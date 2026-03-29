import { prisma } from '@vayva/db';
import { logger } from '@vayva/shared';

/**
 * Activity Logger Service - Audit trail and activity logging
 * 
 * Provides:
 * - Log user actions with before/after state diffing
 * - Query audit logs by store, user, action type
 * - Activity analytics and reporting
 * - Compliance and governance support
 */

export interface ActivityLogPayload {
  storeId: string;
  actorUserId: string;
  action: string;
  targetType: string;
  targetId: string;
  reason?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
}

export class ActivityLoggerService {
  /**
   * Log an activity with smart diffing
   */
  async logActivity(payload: ActivityLogPayload): Promise<void> {
    try {
      const {
        storeId,
        actorUserId,
        action,
        targetType,
        targetId,
        reason,
        before,
        after,
      } = payload;

      // Calculate minimal diff if both states provided
      let diffBefore: Record<string, unknown> | null = null;
      let diffAfter: Record<string, unknown> | null = null;

      if (before && after) {
        diffBefore = {};
        diffAfter = {};
        const allKeys = new Set([
          ...Object.keys(before),
          ...Object.keys(after),
        ]);

        allKeys.forEach((key) => {
          const valBefore = before[key];
          const valAfter = after[key];

          if (valBefore !== valAfter) {
            diffBefore![key] = valBefore;
            diffAfter![key] = valAfter;
          }
        });

        // If no changes, don't log
        if (Object.keys(diffBefore).length === 0) {
          logger.debug('[ActivityLogger] No changes detected, skipping log', {
            action,
            targetType,
            targetId,
          });
          return;
        }
      } else {
        // One-sided log (Creation or Deletion)
        diffBefore = before || null;
        diffAfter = after || null;
      }

      await prisma.auditLog.create({
        data: {
          storeId,
          actorUserId,
          action,
          targetType,
          targetId,
          reason: reason || null,
          before: diffBefore ? JSON.stringify(diffBefore) : null,
          after: diffAfter ? JSON.stringify(diffAfter) : null,
        },
      });

      logger.info('[ActivityLogger] Activity logged', {
        storeId,
        actorUserId,
        action,
        targetType,
        targetId,
      });
    } catch (error) {
      // Fail silently - logs shouldn't break app flow
      logger.error('[ActivityLogger] Failed to log activity', {
        error: error instanceof Error ? error.message : String(error),
        payload,
      });
    }
  }

  /**
   * Get audit logs for a store
   */
  async getAuditLogs(
    storeId: string,
    options?: {
      limit?: number;
      offset?: number;
      action?: string;
      targetType?: string;
      targetId?: string;
      actorUserId?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<
    Array<{
      id: string;
      storeId: string;
      actorUserId: string;
      action: string;
      targetType: string;
      targetId: string;
      reason: string | null;
      before: Record<string, unknown> | null;
      after: Record<string, unknown> | null;
      createdAt: Date;
    }>
  > {
    try {
      const {
        limit = 100,
        offset = 0,
        action,
        targetType,
        targetId,
        actorUserId,
        startDate,
        endDate,
      } = options || {};

      const where: any = { storeId };

      if (action) where.action = action;
      if (targetType) where.targetType = targetType;
      if (targetId) where.targetId = targetId;
      if (actorUserId) where.actorUserId = actorUserId;
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
      }

      const logs = await prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });

      return logs.map((log) => ({
        ...log,
        before: log.before ? JSON.parse(log.before as string) : null,
        after: log.after ? JSON.parse(log.after as string) : null,
      }));
    } catch (error) {
      logger.error('[ActivityLogger] Failed to fetch audit logs', {
        storeId,
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  /**
   * Get activity statistics
   */
  async getActivityStats(
    storeId: string,
    days = 7
  ): Promise<{
    totalActivities: number;
    byAction: Array<{ action: string; count: number }>;
    byUser: Array<{ actorUserId: string; count: number }>;
    byTargetType: Array<{ targetType: string; count: number }>;
  }> {
    try {
      const since = new Date();
      since.setDate(since.getDate() - days);

      const [totalActivities, byAction, byUser, byTargetType] =
        await Promise.all([
          prisma.auditLog.count({
            where: {
              storeId,
              createdAt: { gte: since },
            },
          }),
          prisma.auditLog.groupBy({
            by: ['action'],
            where: {
              storeId,
              createdAt: { gte: since },
            },
            _count: true,
            orderBy: {
              _count: {
                action: 'desc',
              },
            },
            take: 20,
          }),
          prisma.auditLog.groupBy({
            by: ['actorUserId'],
            where: {
              storeId,
              createdAt: { gte: since },
            },
            _count: true,
            orderBy: {
              _count: {
                actorUserId: 'desc',
              },
            },
            take: 20,
          }),
          prisma.auditLog.groupBy({
            by: ['targetType'],
            where: {
              storeId,
              createdAt: { gte: since },
            },
            _count: true,
            orderBy: {
              _count: {
                targetType: 'desc',
              },
            },
            take: 20,
          }),
        ]);

      return {
        totalActivities,
        byAction: byAction.map((a) => ({
          action: a.action,
          count: a._count,
        })),
        byUser: byUser.map((u) => ({
          actorUserId: u.actorUserId,
          count: u._count,
        })),
        byTargetType: byTargetType.map((t) => ({
          targetType: t.targetType,
          count: t._count,
        })),
      };
    } catch (error) {
      logger.error('[ActivityLogger] Failed to fetch stats', {
        storeId,
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        totalActivities: 0,
        byAction: [],
        byUser: [],
        byTargetType: [],
      };
    }
  }

  /**
   * Get recent activities for a specific target
   */
  async getTargetHistory(
    storeId: string,
    targetType: string,
    targetId: string,
    limit = 50
  ): Promise<
    Array<{
      id: string;
      action: string;
      actorUserId: string;
      reason: string | null;
      before: Record<string, unknown> | null;
      after: Record<string, unknown> | null;
      createdAt: Date;
    }>
  > {
    try {
      const logs = await prisma.auditLog.findMany({
        where: {
          storeId,
          targetType,
          targetId,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return logs.map((log) => ({
        ...log,
        before: log.before ? JSON.parse(log.before as string) : null,
        after: log.after ? JSON.parse(log.after as string) : null,
      }));
    } catch (error) {
      logger.error('[ActivityLogger] Failed to fetch target history', {
        targetType,
        targetId,
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  /**
   * Search audit logs
   */
  async searchAuditLogs(
    storeId: string,
    query: string,
    limit = 100
  ): Promise<
    Array<{
      id: string;
      action: string;
      targetType: string;
      targetId: string;
      actorUserId: string;
      createdAt: Date;
    }>
  > {
    try {
      // Simple search by action or targetType
      const logs = await prisma.auditLog.findMany({
        where: {
          storeId,
          OR: [
            { action: { contains: query, mode: 'insensitive' } },
            { targetType: { contains: query, mode: 'insensitive' } },
            { targetId: { contains: query, mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          action: true,
          targetType: true,
          targetId: true,
          actorUserId: true,
          createdAt: true,
        },
      });

      return logs;
    } catch (error) {
      logger.error('[ActivityLogger] Search failed', {
        query,
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }
}
