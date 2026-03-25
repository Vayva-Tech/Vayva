/**
 * Health Score API Routes
 * GET /api/health-score - Get health score dashboard data
 * POST /api/health-score/recalculate - Trigger recalculation for a store
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@vayva/db';
import { Queue } from 'bullmq';
import { getRedis } from '@vayva/redis';
import { QUEUES } from '@vayva/shared';
import { OpsAuthService } from '@/lib/ops-auth';
import { opsApiAuthErrorResponse } from '@/lib/ops-api-auth';

// GET /api/health-score - Get health score segments and stats
export async function GET(req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();
    const { searchParams } = new URL(req.url);
    const segment = searchParams.get('segment');
    const storeId = searchParams.get('storeId');

    try {
      if (storeId) {
        OpsAuthService.requireRole(user, 'OPS_SUPPORT');
      } else {
        OpsAuthService.requireRole(user, 'OPERATOR');
      }
    } catch (roleErr) {
      const r = opsApiAuthErrorResponse(roleErr);
      if (r) return r;
      throw roleErr;
    }

    // If storeId provided, get specific store health
    if (storeId) {
      const healthScore = await prisma.healthScore.findFirst({
        where: { storeId },
        orderBy: { createdAt: 'desc' },
      });

      if (!healthScore) {
        return NextResponse.json(
          { error: 'Health score not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ healthScore });
    }

    // Get latest health scores for all stores
    const latestScores = await prisma.$queryRaw`
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
    `;

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

    // Filter by segment if requested
    let filteredScores = scores;
    if (segment) {
      switch (segment) {
        case 'healthy':
          filteredScores = scores.filter((s) => s.score >= 70);
          break;
        case 'atRisk':
          filteredScores = scores.filter(
            (s) => s.score >= 40 && s.score < 70
          );
          break;
        case 'critical':
          filteredScores = scores.filter((s) => s.score < 40);
          break;
      }
    }

    return NextResponse.json({
      segments,
      stats: {
        totalStores: scores.length,
        averageScore: avgScore,
        ...segments,
      },
      scores: filteredScores,
    });
  } catch (error) {
    const authRes = opsApiAuthErrorResponse(error);
    if (authRes) return authRes;
    console.error('Health score API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/health-score/recalculate - Trigger recalculation
export async function POST(req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();
    try {
      OpsAuthService.requireRole(user, 'OPERATOR');
    } catch (roleErr) {
      const r = opsApiAuthErrorResponse(roleErr);
      if (r) return r;
      throw roleErr;
    }

    const body = await req.json();
    const { storeId } = body;

    if (!storeId) {
      return NextResponse.json(
        { error: 'storeId is required' },
        { status: 400 }
      );
    }

    // Queue health score calculation
    const connection = await getRedis();
    const queue = new Queue(QUEUES.HEALTH_SCORE_CALCULATION, { connection });

    await queue.add(`recalculate-${storeId}`, {
      storeId,
      forceRecalculate: true,
    });

    await queue.close();

    return NextResponse.json({
      success: true,
      message: 'Health score recalculation queued',
    });
  } catch (error) {
    const authRes = opsApiAuthErrorResponse(error);
    if (authRes) return authRes;
    console.error('Health score recalculation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
