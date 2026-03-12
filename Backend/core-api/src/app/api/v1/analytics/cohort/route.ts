/**
 * Cohort Analysis API Routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { cohortAnalyzer, CohortMetricType } from '@vayva/analytics';
import { requireAuth } from '@/lib/auth';

/**
 * GET /api/v1/analytics/cohort
 * Get cohort analysis for the authenticated merchant
 */
export async function GET(req: NextRequest) {
    try {
        const session = await requireAuth(req);
        if (!session?.storeId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const metricType = (searchParams.get('type') || 'retention') as CohortMetricType;
        const months = parseInt(searchParams.get('months') || '6', 10);

        // Validate metric type
        const validTypes: CohortMetricType[] = ['retention', 'revenue', 'orders', 'ltv'];
        if (!validTypes.includes(metricType)) {
            return NextResponse.json(
                { error: 'Invalid metric type' },
                { status: 400 }
            );
        }

        // Try to get from cache first
        const cachedReport = await cohortAnalyzer.getCohortReport(session.storeId, metricType);
        
        if (cachedReport) {
            return NextResponse.json({
                ...cachedReport,
                cached: true,
            });
        }

        // Generate new report
        let report;
        switch (metricType) {
            case 'retention':
                report = await cohortAnalyzer.calculateRetentionCohorts(session.storeId, months);
                break;
            case 'revenue':
                report = await cohortAnalyzer.calculateRevenueCohorts(session.storeId, months);
                break;
            default:
                report = await cohortAnalyzer.calculateRetentionCohorts(session.storeId, months);
        }

        return NextResponse.json({
            ...report,
            cached: false,
        });
    } catch (error) {
        console.error('Cohort analysis error:', error);
        return NextResponse.json(
            { error: 'Failed to generate cohort analysis' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/v1/analytics/cohort/recalculate
 * Force recalculation of cohort analysis
 */
export async function POST(req: NextRequest) {
    try {
        const session = await requireAuth(req);
        if (!session?.storeId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const metricType = (body.type || 'retention') as CohortMetricType;
        const months = parseInt(body.months || '6', 10);

        let report;
        switch (metricType) {
            case 'retention':
                report = await cohortAnalyzer.calculateRetentionCohorts(session.storeId, months);
                break;
            case 'revenue':
                report = await cohortAnalyzer.calculateRevenueCohorts(session.storeId, months);
                break;
            default:
                report = await cohortAnalyzer.calculateRetentionCohorts(session.storeId, months);
        }

        return NextResponse.json({
            ...report,
            recalculated: true,
        });
    } catch (error) {
        console.error('Cohort recalculation error:', error);
        return NextResponse.json(
            { error: 'Failed to recalculate cohort analysis' },
            { status: 500 }
        );
    }
}
