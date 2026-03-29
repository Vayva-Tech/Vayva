import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

/**
 * Health Score Service - Backend
 * Manages store health score calculations and tracking
 */
export class HealthScoreService {
  constructor(private readonly db = prisma) {}

  /**
   * Get health score for a specific store
   */
  async getStoreHealthScore(storeId: string) {
    const healthScore = await this.db.healthScore.findFirst({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
    });

    if (!healthScore) {
      throw new Error('Health score not found for store');
    }

    return healthScore;
  }

  /**
   * Get latest health scores for all stores with filtering
   */
  async getAllHealthScores(params?: {
    segment?: 'healthy' | 'atRisk' | 'critical';
    limit?: number;
  }) {
    const { segment, limit = 100 } = params || {};

    // Get latest scores for each store
    const latestScores = await this.db.$queryRaw`
      SELECT DISTINCT ON ("storeId") 
        hs.*,
        s.name as "storeName",
        s."createdAt" as "storeCreatedAt",
        u.id as "ownerId",
        u."firstName" as "ownerFirstName",
        u."lastName" as "ownerLastName",
        u.email as "ownerEmail",
        u.phone as "ownerPhone"
      FROM "HealthScore" hs
      JOIN "Store" s ON hs."storeId" = s.id
      JOIN "User" u ON s."ownerId" = u.id
      WHERE s."deletedAt" IS NULL
      ORDER BY "storeId", hs."calculatedAt" DESC
      LIMIT ${limit}
    `;

    // Filter by segment if specified
    let filteredScores = latestScores as Array<{ score: number }>;
    if (segment) {
      switch (segment) {
        case 'healthy':
          filteredScores = latestScores.filter((s) => s.score >= 70);
          break;
        case 'atRisk':
          filteredScores = latestScores.filter(
            (s) => s.score >= 40 && s.score < 70
          );
          break;
        case 'critical':
          filteredScores = latestScores.filter((s) => s.score < 40);
          break;
      }
    }

    // Calculate segments
    const scores = latestScores as Array<{ score: number }>;
    const segments = {
      healthy: scores.filter((s) => s.score >= 70).length,
      atRisk: scores.filter((s) => s.score >= 40 && s.score < 70).length,
      critical: scores.filter((s) => s.score < 40).length,
    };

    // Calculate stats
    const avgScore =
      scores.length > 0
        ? Math.round(
            scores.reduce((sum, s) => sum + s.score, 0) / scores.length
          )
        : 0;

    return {
      segments,
      stats: {
        totalStores: scores.length,
        averageScore: avgScore,
        ...segments,
      },
      scores: filteredScores,
    };
  }

  /**
   * Trigger health score recalculation
   * Note: Actual calculation happens via queue worker
   */
  async triggerRecalculation(storeId: string): Promise<boolean> {
    const store = await this.db.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new Error('Store not found');
    }

    // In production, this would add to a queue
    // For now, we just mark that recalculation is needed
    logger.info(`[HealthScore] Recalculation triggered for store ${storeId}`);
    return true;
  }
}
