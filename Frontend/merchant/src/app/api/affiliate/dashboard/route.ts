import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { affiliateService } from "@vayva/affiliate";
import { z } from "zod";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger, ErrorCategory } from "@/lib/logger";

/**
 * GET /api/affiliate/dashboard
 * Get affiliate dashboard data for the current store
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
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
    handleApiError(error, {
      endpoint: "/affiliate/dashboard",
      operation: "GET_AFFILIATE_DASHBOARD",
    });
    return NextResponse.json(
      { error: "Failed to fetch affiliate dashboard" },
      { status: 500 }
    );
  }
}
