/**
 * NPS API Routes
 * GET /api/nps - Get NPS metrics and survey data
 * POST /api/nps/send - Send NPS survey to a store
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@vayva/db';
import { Queue } from 'bullmq';
import { getRedis } from '@vayva/redis';
import { QUEUES } from '@vayva/shared';
import { OpsAuthService } from '@/lib/ops-auth';
import { opsApiAuthErrorResponse } from '@/lib/ops-api-auth';

// GET /api/nps - Get NPS metrics
export async function GET(req: NextRequest) {
  try {
    let user: { role?: string };
    try {
      const ctx = await OpsAuthService.requireSession();
      user = ctx.user;
    } catch (e) {
      const res = opsApiAuthErrorResponse(e);
      if (res) return res;
      throw e;
    }

    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');
    const period = searchParams.get('period') || '90d'; // 30d, 90d, 1y, all

    try {
      if (storeId) {
        OpsAuthService.requireRole(user, 'OPS_SUPPORT');
      } else {
        OpsAuthService.requireRole(user, 'OPERATOR');
      }
    } catch (e) {
      const res = opsApiAuthErrorResponse(e);
      if (res) return res;
      throw e;
    }

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

    // If storeId provided, get store-specific NPS data
    if (storeId) {
      const surveys = await prisma.nPSSurvey.findMany({
        where: {
          storeId,
          sentAt: { gte: startDate },
        },
        orderBy: { sentAt: 'desc' },
      });

      const respondedSurveys = surveys.filter((s: { status: string }) => s.status === 'responded');
      const scores = respondedSurveys
        .map((s: { score: number | null }) => s.score)
        .filter((s): s is number => s !== null);

      const metrics =
        respondedSurveys.length > 0
          ? {
              responseRate: (respondedSurveys.length / surveys.length) * 100,
              averageScore: scores.reduce((a: number, b: number) => a + b, 0) / scores.length,
              promoters: scores.filter((s: number) => s >= 9).length,
              passives: scores.filter((s: number) => s >= 7 && s <= 8).length,
              detractors: scores.filter((s: number) => s <= 6).length,
              npsScore:
                ((scores.filter((s: number) => s >= 9).length -
                  scores.filter((s: number) => s <= 6).length) /
                  scores.length) *
                100,
            }
          : null;

      return NextResponse.json({
        surveys,
        metrics,
      });
    }

    // Get global NPS metrics (cross-tenant — OPERATOR+ only, enforced above)
    const surveys = await prisma.nPSSurvey.findMany({
      where: {
        sentAt: { gte: startDate },
      },
    });

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
            averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
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

    const recentResponses = await prisma.nPSSurvey.findMany({
      where: {
        status: 'responded',
        sentAt: { gte: startDate },
      },
      orderBy: { respondedAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({
      metrics,
      recentResponses,
    });
  } catch (error) {
    console.error('NPS API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/nps/send - Send NPS survey
export async function POST(req: NextRequest) {
  try {
    let user: { role?: string };
    try {
      const ctx = await OpsAuthService.requireSession();
      user = ctx.user;
    } catch (e) {
      const res = opsApiAuthErrorResponse(e);
      if (res) return res;
      throw e;
    }

    try {
      OpsAuthService.requireRole(user, 'OPERATOR');
    } catch (e) {
      const res = opsApiAuthErrorResponse(e);
      if (res) return res;
      throw e;
    }

    const body = await req.json();
    const { storeId } = body;

    if (!storeId) {
      return NextResponse.json(
        { error: 'storeId is required' },
        { status: 400 }
      );
    }

    const connection = await getRedis();
    const queue = new Queue(QUEUES.NPS_SURVEY, { connection });

    await queue.add(`manual-${storeId}`, {
      storeId,
      surveyType: 'triggered',
    });

    await queue.close();

    return NextResponse.json({
      success: true,
      message: 'NPS survey queued for sending',
    });
  } catch (error) {
    console.error('NPS send error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
