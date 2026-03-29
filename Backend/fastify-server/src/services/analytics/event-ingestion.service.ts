import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class EventIngestionService {
  constructor(private readonly db = prisma) {}

  async ingestEvent(
    storeId: string,
    eventName: string,
    properties?: Record<string, unknown>
  ) {
    try {
      // Extract canonical fields from properties
      const templateSlug =
        properties?.templateSlug ||
        properties?.template ||
        properties?.templateId;
      
      const plan = properties?.plan;
      const entryPoint = properties?.entryPoint;
      const step = properties?.step || properties?.stepKey;
      const fastPath = !!properties?.fastPath;

      await this.db.onboardingAnalyticsEvent?.create({
        data: {
          storeId,
          sessionId: properties?.sessionId as string | undefined,
          eventName,
          templateSlug: templateSlug as string | undefined,
          plan: plan as string | undefined,
          entryPoint: entryPoint as string | undefined,
          step: step as string | undefined,
          fastPath,
          metadata: properties || {},
        },
      });

      // Log specific events for monitoring
      if (eventName === 'ONBOARDING_ABANDONED') {
        logger.warn('[Telemetry] Onboarding abandoned', { 
          templateSlug, 
          step, 
          storeId 
        });
      }
      
      if (eventName === 'ONBOARDING_STEP_ERROR') {
        logger.error('[Telemetry] Onboarding step error', { 
          templateSlug, 
          step, 
          error: properties?.error, 
          storeId 
        });
      }

      return { success: true };
    } catch (error) {
      logger.error('[Telemetry] Failed to ingest event', { error });
      throw error;
    }
  }

  async getEvents(storeId: string, filters: {
    eventName?: string;
    startDate?: Date;
    endDate?: Date;
    templateSlug?: string;
    limit?: number;
  }) {
    const where: any = { storeId };

    if (filters.eventName) {
      where.eventName = filters.eventName;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    if (filters.templateSlug) {
      where.templateSlug = filters.templateSlug;
    }

    const events = await this.db.onboardingAnalyticsEvent?.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 100,
    });

    return events || [];
  }

  async getEventStats(storeId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const events = await this.db.onboardingAnalyticsEvent?.findMany({
      where: {
        storeId,
        createdAt: { gte: startDate },
      },
    });

    const total = events?.length || 0;
    const byEventName = new Map<string, number>();
    const byTemplate = new Map<string, number>();

    events?.forEach((event) => {
      // Count by event name
      const currentCount = byEventName.get(event.eventName) || 0;
      byEventName.set(event.eventName, currentCount + 1);

      // Count by template
      if (event.templateSlug) {
        const currentCount = byTemplate.get(event.templateSlug) || 0;
        byTemplate.set(event.templateSlug, currentCount + 1);
      }
    });

    return {
      total,
      byEventName: Object.fromEntries(byEventName),
      byTemplate: Object.fromEntries(byTemplate),
      period: { startDate, endDate: new Date() },
    };
  }
}
