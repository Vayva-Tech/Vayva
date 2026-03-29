import { prisma } from '@vayva/db';
import { logger } from '@vayva/shared';

/**
 * Integration Health Service - Monitor integration health across stores
 * 
 * Provides:
 * - Log integration events (success/fail)
 * - Get integration health status for dashboard
 * - Track WhatsApp, Paystack, Delivery integrations
 * - Monitor event history and success rates
 */

export type IntegrationStatus = 'OK' | 'WARNING' | 'FAIL' | 'UNKNOWN';

export interface IntegrationHealth {
  status: IntegrationStatus;
  lastSuccess: Date | null;
  lastEvent: Date | null;
}

export class IntegrationHealthService {
  /**
   * Log an integration event for health monitoring
   */
  async logIntegrationEvent(
    storeId: string,
    integrationKey: string,
    eventType: string,
    status: string
  ): Promise<void> {
    // Feature flag check
    const isEnabled = process.env.OPS_INTEGRATION_HEALTH_ENABLED === 'true';
    if (!isEnabled) {
      return;
    }

    try {
      await prisma.integrationEvent.create({
        data: {
          storeId,
          integrationKey,
          eventType,
          status: status as any,
        },
      });

      logger.info('[IntegrationHealth] Event logged', {
        storeId,
        integrationKey,
        eventType,
        status,
      });
    } catch (error) {
      // Silent fail but log
      logger.error('[IntegrationHealth] Failed to log event', {
        storeId,
        integrationKey,
        eventType,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Get integration health status for ops dashboard
   */
  async getIntegrationHealth(storeId: string): Promise<Record<string, IntegrationHealth>> {
    const integrations = ['whatsapp', 'paystack', 'delivery'];
    const health: Record<string, IntegrationHealth> = {};

    const now = Date.now();
    const day24h = 24 * 60 * 60 * 1000;
    const hours2 = 2 * 60 * 60 * 1000;

    for (const key of integrations) {
      const [lastSuccess, lastEvent] = await Promise.all([
        prisma.integrationEvent.findFirst({
          where: { storeId, integrationKey: key, status: 'SUCCESS' },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.integrationEvent.findFirst({
          where: { storeId, integrationKey: key },
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      // Determine status
      let status: IntegrationStatus = 'UNKNOWN';

      if (lastSuccess && now - lastSuccess.createdAt.getTime() < day24h) {
        status = 'OK'; // Success in last 24h
      } else if (
        lastEvent &&
        lastEvent.status === 'FAIL' &&
        now - lastEvent.createdAt.getTime() < hours2
      ) {
        status = 'FAIL'; // Recent failure within 2h
      } else if (lastSuccess) {
        status = 'WARNING'; // No success in 24h but has historical success
      }

      health[key] = {
        status,
        lastSuccess: lastSuccess?.createdAt || null,
        lastEvent: lastEvent?.createdAt || null,
      };
    }

    return health;
  }

  /**
   * Get detailed integration event history
   */
  async getIntegrationHistory(
    storeId: string,
    integrationKey?: string,
    limit = 50
  ): Promise<
    Array<{
      id: string;
      integrationKey: string;
      eventType: string;
      status: string;
      createdAt: Date;
    }>
  > {
    try {
      const events = await prisma.integrationEvent.findMany({
        where: {
          storeId,
          ...(integrationKey && { integrationKey }),
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          integrationKey: true,
          eventType: true,
          status: true,
          createdAt: true,
        },
      });

      return events.map((e) => ({
        id: e.id,
        integrationKey: e.integrationKey,
        eventType: e.eventType,
        status: e.status,
        createdAt: e.createdAt,
      }));
    } catch (error) {
      logger.error('[IntegrationHealth] Failed to fetch history', {
        storeId,
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  /**
   * Get integration statistics
   */
  async getIntegrationStats(
    storeId: string,
    days = 7
  ): Promise<{
    totalEvents: number;
    successCount: number;
    failCount: number;
    successRate: number;
    byIntegration: Array<{
      integrationKey: string;
      total: number;
      success: number;
      fail: number;
    }>;
  }> {
    try {
      const since = new Date();
      since.setDate(since.getDate() - days);

      const [totalEvents, successCount, failCount, byIntegration] = await Promise.all([
        prisma.integrationEvent.count({
          where: {
            storeId,
            createdAt: { gte: since },
          },
        }),
        prisma.integrationEvent.count({
          where: {
            storeId,
            status: 'SUCCESS',
            createdAt: { gte: since },
          },
        }),
        prisma.integrationEvent.count({
          where: {
            storeId,
            status: 'FAIL',
            createdAt: { gte: since },
          },
        }),
        prisma.integrationEvent.groupBy({
          by: ['integrationKey'],
          where: {
            storeId,
            createdAt: { gte: since },
          },
          _count: true,
          having: {
            integrationKey: {
              _count: {
                gt: 0,
              },
            },
          },
        }),
      ]);

      const byIntegrationDetailed = await Promise.all(
        byIntegration.map(async (item) => {
          const [success, fail] = await Promise.all([
            prisma.integrationEvent.count({
              where: {
                storeId,
                integrationKey: item.integrationKey,
                status: 'SUCCESS',
                createdAt: { gte: since },
              },
            }),
            prisma.integrationEvent.count({
              where: {
                storeId,
                integrationKey: item.integrationKey,
                status: 'FAIL',
                createdAt: { gte: since },
              },
            }),
          ]);

          return {
            integrationKey: item.integrationKey,
            total: item._count,
            success,
            fail,
          };
        })
      );

      return {
        totalEvents,
        successCount,
        failCount,
        successRate: totalEvents > 0 ? Math.round((successCount / totalEvents) * 100) : 0,
        byIntegration: byIntegrationDetailed,
      };
    } catch (error) {
      logger.error('[IntegrationHealth] Failed to fetch stats', {
        storeId,
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        totalEvents: 0,
        successCount: 0,
        failCount: 0,
        successRate: 0,
        byIntegration: [],
      };
    }
  }

  /**
   * Check if a specific integration is healthy
   */
  async isIntegrationHealthy(
    storeId: string,
    integrationKey: string,
    thresholdHours = 24
  ): Promise<boolean> {
    try {
      const lastSuccess = await prisma.integrationEvent.findFirst({
        where: {
          storeId,
          integrationKey,
          status: 'SUCCESS',
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!lastSuccess) {
        return false;
      }

      const now = Date.now();
      const thresholdMs = thresholdHours * 60 * 60 * 1000;

      return now - lastSuccess.createdAt.getTime() < thresholdMs;
    } catch (error) {
      logger.error('[IntegrationHealth] Failed to check health', {
        storeId,
        integrationKey,
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }
}
