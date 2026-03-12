/**
 * NPS (Net Promoter Score) API Routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { npsSystem } from '@vayva/analytics';
import { requireAuth } from '@/lib/auth';

/**
 * GET /api/v1/analytics/nps
 * Get NPS metrics for the authenticated merchant
 */
export async function GET(req: NextRequest) {
    try {
        const session = await requireAuth(req);
        if (!session?.storeId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const includeTrend = searchParams.get('trend') === 'true';
        const trendMonths = parseInt(searchParams.get('months') || '6', 10);

        const metrics = await npsSystem.getMetrics(session.storeId);

        const response: Record<string, unknown> = { metrics };

        if (includeTrend) {
            const trend = await npsSystem.getNpsTrend(session.storeId, trendMonths);
            response.trend = trend;
        }

        return NextResponse.json(response);
    } catch (error) {
        console.error('NPS metrics error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch NPS metrics' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/v1/analytics/nps/respond
 * Submit an NPS response
 */
export async function POST_respond(req: NextRequest) {
    try {
        const session = await requireAuth(req);
        if (!session?.storeId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { score, feedback } = body;

        // Validate score
        if (typeof score !== 'number' || score < 0 || score > 10) {
            return NextResponse.json(
                { error: 'Score must be a number between 0 and 10' },
                { status: 400 }
            );
        }

        await npsSystem.recordResponse(session.storeId, score, feedback);

        return NextResponse.json({
            success: true,
            message: 'Thank you for your feedback!',
        });
    } catch (error) {
        console.error('NPS response error:', error);
        return NextResponse.json(
            { error: 'Failed to record response' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/v1/analytics/nps/send
 * Request an NPS survey (admin only)
 */
export async function POST_send(req: NextRequest) {
    try {
        const session = await requireAuth(req);
        // Check if user is admin
        if (!session?.isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { storeId } = body;

        if (!storeId) {
            return NextResponse.json(
                { error: 'storeId is required' },
                { status: 400 }
            );
        }

        const result = await npsSystem.sendSurvey(storeId);

        return NextResponse.json(result);
    } catch (error) {
        console.error('NPS send error:', error);
        return NextResponse.json(
            { error: 'Failed to send survey' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/v1/analytics/nps/platform
 * Get platform-wide NPS metrics (admin only)
 */
export async function GET_platform(req: NextRequest) {
    try {
        const session = await requireAuth(req);
        if (!session?.isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const metrics = await npsSystem.getPlatformMetrics();

        return NextResponse.json({ metrics });
    } catch (error) {
        console.error('Platform NPS error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch platform NPS metrics' },
            { status: 500 }
        );
    }
}
