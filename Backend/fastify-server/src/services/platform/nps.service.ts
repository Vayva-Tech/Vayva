import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

/**
 * NPS (Net Promoter Score) Service - Backend
 * Manages NPS surveys, responses, and analytics
 */
export class NPSService {
  constructor(private readonly db = prisma) {}

  /**
   * Get NPS metrics for a store or globally
   */
  async getNPSMetrics(params: {
    storeId?: string;
    period?: '30d' | '90d' | '1y' | 'all';
  }) {
    const { storeId, period = '90d' } = params;

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0);
    }

    // Build where clause
    const where: any = {
      sentAt: { gte: startDate },
    };
    if (storeId) {
      where.storeId = storeId;
    }

    const [surveys, recentResponses] = await Promise.all([
      this.db.nPSSurvey.findMany({
        where,
      }),
      storeId
        ? []
        : this.db.nPSSurvey.findMany({
            where: {
              status: 'responded',
              sentAt: { gte: startDate },
            },
            orderBy: { respondedAt: 'desc' },
            take: 20,
          }),
    ]);

    const respondedSurveys = surveys.filter((s) => s.status === 'responded');
    const scores = respondedSurveys
      .map((s) => s.score)
      .filter((s): s is number => s !== null);

    const metrics =
      scores.length > 0
        ? {
            totalSent: surveys.length,
            totalResponded: respondedSurveys.length,
            responseRate: (respondedSurveys.length / surveys.length) * 100,
            averageScore:
              scores.reduce((a, b) => a + b, 0) / scores.length,
            promoters: scores.filter((s) => s >= 9).length,
            passives: scores.filter((s) => s >= 7 && s <= 8).length,
            detractors: scores.filter((s) => s <= 6).length,
            npsScore:
              ((scores.filter((s) => s >= 9).length -
                scores.filter((s) => s <= 6).length) /
                scores.length) *
              100,
          }
        : {
            totalSent: surveys.length,
            totalResponded: 0,
            responseRate: 0,
            averageScore: 0,
            promoters: 0,
            passives: 0,
            detractors: 0,
            npsScore: 0,
          };

    return {
      surveys,
      metrics,
      recentResponses: !storeId ? recentResponses : undefined,
    };
  }

  /**
   * Trigger NPS survey sending
   * Note: Actual sending happens via queue worker
   */
  async triggerSurvey(storeId: string, surveyType: 'scheduled' | 'triggered' = 'triggered'): Promise<boolean> {
    const store = await this.db.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new Error('Store not found');
    }

    logger.info(`[NPS] Survey triggered for store ${storeId} (${surveyType})`);
    return true;
  }
}
