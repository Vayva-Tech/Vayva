/**
 * Predictive Analytics API Routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { predictiveAnalytics, InsightType as _InsightType } from '@vayva/analytics';
import { requireAuth } from '@/lib/auth';

/**
 * GET /api/v1/analytics/predictive
 * Get active predictions for the authenticated merchant
 */
export async function GET(req: NextRequest) {
    try {
        const session = await requireAuth(req);
        if (!session?.storeId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const predictions = await predictiveAnalytics.getActivePredictions(session.storeId);

        return NextResponse.json({
            predictions,
            count: predictions.length,
        });
    } catch (error) {
        console.error('Predictive analytics error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch predictions' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/v1/analytics/predictive/churn
 * Generate churn risk prediction
 */
export async function POST_churn(req: NextRequest) {
    try {
        const session = await requireAuth(req);
        if (!session?.storeId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const prediction = await predictiveAnalytics.predictChurnRisk(session.storeId);

        return NextResponse.json(prediction);
    } catch (error) {
        console.error('Churn prediction error:', error);
        return NextResponse.json(
            { error: 'Failed to generate churn prediction' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/v1/analytics/predictive/inventory
 * Generate inventory forecasts
 */
export async function POST_inventory(req: NextRequest) {
    try {
        const session = await requireAuth(req);
        if (!session?.storeId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const forecasts = await predictiveAnalytics.predictInventoryNeeds(session.storeId);

        return NextResponse.json({
            forecasts,
            count: forecasts.length,
            urgent: forecasts.filter(f => f.daysUntilStockout !== null && f.daysUntilStockout <= 7).length,
        });
    } catch (error) {
        console.error('Inventory forecast error:', error);
        return NextResponse.json(
            { error: 'Failed to generate inventory forecast' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/v1/analytics/predictive/revenue
 * Generate revenue prediction
 */
export async function POST_revenue(req: NextRequest) {
    try {
        const session = await requireAuth(req);
        if (!session?.storeId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const prediction = await predictiveAnalytics.predictRevenue(session.storeId);

        return NextResponse.json(prediction);
    } catch (error) {
        console.error('Revenue prediction error:', error);
        return NextResponse.json(
            { error: 'Failed to generate revenue prediction' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/v1/analytics/predictive/:id/act
 * Mark a prediction as acted upon
 */
export async function PATCH_act(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requireAuth(req);
        if (!session?.storeId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { actionResult } = body;

        await predictiveAnalytics.markPredictionActed(params.id, actionResult);

        return NextResponse.json({
            success: true,
            message: 'Prediction marked as acted upon',
        });
    } catch (error) {
        console.error('Mark prediction acted error:', error);
        return NextResponse.json(
            { error: 'Failed to update prediction' },
            { status: 500 }
        );
    }
}
