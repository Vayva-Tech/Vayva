/**
 * GET /api/merchant/billing/usage
 * 
 * Get usage statistics for the current store
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { UsageBillingService } from "@vayva/billing";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.storeId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const storeId = session.user.storeId;

    // Get usage stats
    const stats = await UsageBillingService.getUsageStats(storeId);

    // Calculate projected overages
    const projectedOverages = stats
      .filter(s => s.projected > s.limit)
      .map(s => ({
        metric: s.metric,
        projectedOverage: s.projected - s.limit,
        projectedCost: Math.floor((s.projected - s.limit) * getOverageRate(s.metric)),
      }));

    return NextResponse.json({
      stats,
      projectedOverages,
      hasOverages: stats.some(s => s.overage > 0),
      totalOverageCost: stats.reduce((sum, s) => sum + s.overageCost, 0),
    });
  } catch (error) {
    console.error("[BILLING_USAGE_API_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch usage statistics" },
      { status: 500 }
    );
  }
}

function getOverageRate(metric: string): number {
  const rates: Record<string, number> = {
    'AI_TOKENS': 0.005,
    'WHATSAPP_MESSAGES': 290,
    'WHATSAPP_MEDIA': 500,
    'STORAGE_GB': 10000,
    'API_CALLS': 1,
    'BANDWIDTH_GB': 5000,
  };
  return rates[metric] || 0;
}
