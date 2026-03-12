/**
 * GET /api/saas/dashboard
 * Fetches SaaS dashboard data from SaaS Industry Engine
 */

import { NextRequest, NextResponse } from "next/server";
import { SaaSEngine } from "@vayva/industry-saas";

export const GET = async (req: NextRequest) => {
  try {
    // Initialize SaaS Engine
    const engine = new SaaSEngine({});
    await engine.initialize();

    // Get subscription stats
    const subscriptionStats = await engine.features?.subscription?.getStats?.() || {};

    return NextResponse.json({
      success: true,
      data: {
        subscriptions: subscriptionStats,
        summary: {
          totalSubscriptions: subscriptionStats.totalSubscriptions || 0,
          activeSubscriptions: subscriptionStats.activeSubscriptions || 0,
          mrr: subscriptionStats.mrr || 0,
          churnRate: subscriptionStats.churnRate || 0,
          upcomingRenewals: subscriptionStats.upcomingRenewals || 0,
          usageRecordsThisMonth: subscriptionStats.usageRecordsThisMonth || 0,
        },
      },
    });
  } catch (error: unknown) {
    console.error("[SAAS_API_ERROR]", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to load SaaS data" 
      },
      { status: 500 }
    );
  }
};
