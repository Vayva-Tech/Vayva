/**
 * Funnel Analysis API Routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { funnelAnalyzer, FunnelType } from '@vayva/analytics';
import { requireAuth } from '@/lib/auth';

/**
 * GET /api/v1/analytics/funnel
 * Get funnel analysis for the authenticated merchant
 */
export async function GET(req: NextRequest) {
    try {
        const session = await requireAuth(req);
        if (!session?.storeId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const funnelType = (searchParams.get('type') || 'product_view_to_purchase') as FunnelType;
        const days = parseInt(searchParams.get('days') || '30', 10);

        // Validate funnel type
        const validTypes: FunnelType[] = [
            'product_view_to_purchase',
            'cart_to_checkout',
            'checkout_to_payment',
            'visitor_to_signup',
            'signup_to_first_order',
            'ai_conversation_to_sale',
        ];

        if (!validTypes.includes(funnelType)) {
            return NextResponse.json(
                { error: 'Invalid funnel type' },
                { status: 400 }
            );
        }

        let report;
        switch (funnelType) {
            case 'product_view_to_purchase':
                report = await funnelAnalyzer.analyzeProductToPurchaseFunnel(session.storeId, days);
                break;
            case 'ai_conversation_to_sale':
                report = await funnelAnalyzer.analyzeAIConversationFunnel(session.storeId, days);
                break;
            default:
                report = await funnelAnalyzer.analyzeProductToPurchaseFunnel(session.storeId, days);
        }

        return NextResponse.json(report);
    } catch (error) {
        console.error('Funnel analysis error:', error);
        return NextResponse.json(
            { error: 'Failed to generate funnel analysis' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/v1/analytics/funnel/history
 * Get historical funnel data
 */
export async function GET_history(req: NextRequest) {
    try {
        const session = await requireAuth(req);
        if (!session?.storeId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const funnelType = (searchParams.get('type') || 'product_view_to_purchase') as FunnelType;
        const days = parseInt(searchParams.get('days') || '30', 10);

        const history = await funnelAnalyzer.getFunnelHistory(session.storeId, funnelType, days);

        return NextResponse.json({
            funnelType,
            history,
        });
    } catch (error) {
        console.error('Funnel history error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch funnel history' },
            { status: 500 }
        );
    }
}
