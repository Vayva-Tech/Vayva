/**
 * Fraud Detection API Routes
 *
 * POST /api/security/fraud/check          - Check order for fraud
 * GET  /api/security/fraud/check          - Get fraud stats
 * GET  /api/security/fraud/rules          - List fraud rules
 * POST /api/security/fraud/rules          - Create fraud rule
 * POST /api/security/fraud/blocklist      - Add to blocklist
 * GET  /api/security/fraud/[checkId]      - Get check details
 * PATCH /api/security/fraud/[checkId]     - Update decision
 */

import { NextRequest, NextResponse } from 'next/server';
import { fraudDetectionService, mlRiskScorer } from '@vayva/security';
import { auth } from '@/lib/auth';
import { prisma } from '@vayva/db';

/**
 * POST /api/security/fraud/check
 * Check a transaction for fraud
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as {
      orderId: string;
      customerId?: string;
      email: string;
      ipAddress: string;
      userAgent: string;
      billingAddress: {
        street: string;
        city: string;
        state: string;
        country: string;
        zip: string;
      };
      shippingAddress: {
        street: string;
        city: string;
        state: string;
        country: string;
        zip: string;
      };
      amount: number;
      paymentMethod: string;
      sessionData?: {
        duration?: number;
        pageViews?: number;
      };
    };

    const storeId = request.headers.get('x-store-id');
    if (!storeId) {
      return NextResponse.json({ error: 'x-store-id header required' }, { status: 400 });
    }

    // Run ML risk scoring in parallel with rule-based check
    const [fraudCheck, mlPrediction] = await Promise.all([
      fraudDetectionService.checkOrder(storeId, {
        orderId: body.orderId,
        customerId: body.customerId,
        email: body.email,
        ipAddress: body.ipAddress,
        userAgent: body.userAgent,
        billingAddress: body.billingAddress,
        shippingAddress: body.shippingAddress,
        amount: body.amount,
        paymentMethod: body.paymentMethod,
      }),
      mlRiskScorer.scoreTransaction(storeId, {
        amount: body.amount,
        email: body.email,
        ipAddress: body.ipAddress,
        userAgent: body.userAgent,
        billingCountry: body.billingAddress.country,
        shippingCountry: body.shippingAddress.country,
        paymentMethod: body.paymentMethod,
        customerId: body.customerId,
        sessionData: body.sessionData,
      }),
    ]);

    // Combine rule-based and ML scores (weighted average)
    const combinedScore = Math.round(
      fraudCheck.riskScore * 0.6 + mlPrediction.score * 0.4
    );

    return NextResponse.json({
      check: {
        ...fraudCheck,
        mlScore: mlPrediction.score,
        mlRiskFactors: mlPrediction.topRiskFactors,
        mlRecommendation: mlPrediction.recommendation,
        combinedScore,
      },
    });
  } catch (error) {
    console.error('[Fraud] Check failed:', error);
    return NextResponse.json({ error: 'Fraud check failed' }, { status: 500 });
  }
}

/**
 * GET /api/security/fraud/check
 * Get fraud statistics for a store
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const storeId = request.headers.get('x-store-id');
    if (!storeId) {
      return NextResponse.json({ error: 'x-store-id header required' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const stats = await fraudDetectionService.getStats(storeId, days);

    // Get recent high-risk checks
    const recentHighRisk = await prisma.fraudCheck.findMany({
      where: {
        storeId,
        riskLevel: { in: ['high', 'critical'] },
        status: 'review',
      },
      orderBy: { checkedAt: 'desc' },
      take: 10,
    }).catch(() => []);

    return NextResponse.json({ stats, recentHighRisk });
  } catch (error) {
    console.error('[Fraud] Stats failed:', error);
    return NextResponse.json({ error: 'Failed to get fraud stats' }, { status: 500 });
  }
}
