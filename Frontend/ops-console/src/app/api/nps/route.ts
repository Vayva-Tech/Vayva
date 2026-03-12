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

// GET /api/nps - Get NPS metrics
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');
    const period = searchParams.get('period') || '90d'; // 30d, 90d, 1y, all

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
      const surveys = await prisma.npsSurvey.findMany({
        where: {
          storeId,
          sentAt: { gte: startDate },
        },
        orderBy: { sentAt: 'desc' },
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
          : null;

      return NextResponse.json({
        surveys,
        metrics,
      });
    }

    // Get global NPS metrics
    const surveys = await prisma.npsSurvey.findMany({
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

    // Get recent responses with store info
    const recentResponses = await prisma.npsSurvey.findMany({
      where: {
        status: 'responded',
        sentAt: { gte: startDate },
      },
      orderBy: { respondedAt: 'desc' },
      take: 20,
      include: {
        store: {
          select: {
            name: true,
            owner: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
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
    const body = await req.json();
    const { storeId } = body;

    if (!storeId) {
      return NextResponse.json(
        { error: 'storeId is required' },
        { status: 400 }
      );
    }

    // Queue NPS survey
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
