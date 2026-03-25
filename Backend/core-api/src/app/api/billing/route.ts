import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { pricingPolicyAgent } from '@vayva/billing/pricing-policy-agent';
import { prisma } from '@vayva/db';
import { logger } from '@/lib/logger';

/**
 * GET /api/billing/quota-status
 * Get current usage quota status for the authenticated user
 */
export async function GET(_request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's subscription
    const subscription = await prisma.merchantAiSubscription.findUnique({
      where: { storeId: session.user.id },
      include: { plan: true, addonPurchases: true }
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    // Generate usage report
    const report = await pricingPolicyAgent.generateUsageReport({
      id: subscription.id,
      userId: session.user.id,
      planKey: subscription.planKey as any,
      status: subscription.status,
      trialStartsAt: subscription.trialStartsAt,
      trialExpiresAt: subscription.trialExpiresAt,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      addonPurchases: subscription.addonPurchases
    });

    return NextResponse.json({
      currentTier: subscription.planKey,
      trialActive: !pricingPolicyAgent.isTrialExpired({
        id: subscription.id,
        userId: session.user.id,
        planKey: subscription.planKey as any,
        status: subscription.status,
        trialStartsAt: subscription.trialStartsAt,
        trialExpiresAt: subscription.trialExpiresAt,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd
      }),
      usageStats: report.stats,
      totalOverageCost: report.totalOverageCost,
      recommendations: report.recommendations,
      upgradeRecommended: pricingPolicyAgent.getRecommendedUpgradePath(
        subscription.planKey as any,
        {} // Would pass actual usage data here
      )
    });

  } catch (error) {
    logger.error('[API_QUOTA_STATUS] Failed to get quota status', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/billing/purchase-addon
 * Purchase an addon pack for additional usage
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { metric, quantity } = body;

    if (!metric || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields: metric, quantity' },
        { status: 400 }
      );
    }

    // Validate metric
    const validMetrics = ['AI_TOKENS', 'WHATSAPP_MESSAGES', 'STORAGE_GB', 'API_CALLS'];
    if (!validMetrics.includes(metric)) {
      return NextResponse.json(
        { error: `Invalid metric. Valid options: ${validMetrics.join(', ')}` },
        { status: 400 }
      );
    }

    // Get pricing for the addon
    const addonPrices: Record<string, { price: number; increment: number }> = {
      'AI_TOKENS': { price: 5000, increment: 10000 }, // 5000 Naira for 10,000 tokens
      'WHATSAPP_MESSAGES': { price: 5000, increment: 100 }, // 5000 Naira for 100 messages
      'STORAGE_GB': { price: 5000, increment: 10 }, // 5000 Naira for 10GB
      'API_CALLS': { price: 5000, increment: 1000 } // 5000 Naira for 1000 calls
    };

    const pricing = addonPrices[metric];
    if (!pricing) {
      return NextResponse.json(
        { error: 'Addon not available for this metric' },
        { status: 400 }
      );
    }

    // In a real implementation, this would:
    // 1. Process payment through Paystack
    // 2. Create addon purchase record
    // 3. Update user's quota
    // 4. Return success response

    // Mock implementation for now
    const addonPurchase = {
      id: `addon_${Date.now()}`,
      name: `${metric.replace('_', ' ')} Addon`,
      description: `Additional ${quantity} ${metric.toLowerCase()}`,
      priceNgn: pricing.price * quantity,
      metrics: {
        [metric]: pricing.increment * quantity
      },
      purchasedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    };

    logger.info('[API_PURCHASE_ADDON] Addon purchased', {
      userId: session.user.id,
      addon: addonPurchase
    });

    return NextResponse.json({
      success: true,
      addon: addonPurchase,
      message: 'Addon purchased successfully'
    });

  } catch (error) {
    logger.error('[API_PURCHASE_ADDON] Failed to purchase addon', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}