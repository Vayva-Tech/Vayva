import { NextRequest, NextResponse } from "next/server";
import { affiliateService } from "@vayva/affiliate";
import { prisma } from "@vayva/db";
import { z } from "zod";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger, ErrorCategory } from "@/lib/logger";

/**
 * GET /api/affiliate/dashboard
 * Get affiliate dashboard data for the current store
 */
export const GET = withVayvaAPI(PERMISSIONS.FINANCE_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
  try {
    // Find affiliate record for this store
    const affiliate = await prisma.affiliate.findFirst({
      where: { storeId },
    });

    if (!affiliate) {
      return NextResponse.json({
        success: true,
        affiliate: null,
        stats: null,
        referrals: [],
        payouts: [],
      });
    }

    const dashboard = await affiliateService.getAffiliateDashboard(affiliate.id);

    return NextResponse.json({
      success: true,
      affiliate: dashboard.affiliate,
      stats: dashboard.stats,
      referrals: dashboard.referrals,
      payouts: dashboard.payouts,
    });
  } catch (error) {
    logger.error("[Affiliate Dashboard] Error:", ErrorCategory.API, error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch affiliate dashboard" },
      { status: 500 }
    );
  }
});
