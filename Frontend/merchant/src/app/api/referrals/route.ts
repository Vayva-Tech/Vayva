import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { getReferralService } from "@/services/referral";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const service = getReferralService();
        const program = await service.getProgram(storeId);
        const analytics = await service.getReferralAnalytics(storeId);

        // Get customer-facing stats for this merchant
        const { prisma } = await import('@vayva/db');
        const totalCodes = await prisma.referralCode?.count({
            where: { program: { storeId } }
        });

        return NextResponse.json({
            program,
            analytics: {
                totalReferrers: analytics.totalReferrers,
                totalConversions: analytics.totalConversions,
                totalRevenue: analytics.totalRevenue,
                totalRewardsPending: analytics.totalRewardsPending,
                totalRewardsPaid: analytics.totalRewardsPaid,
                conversionRate: analytics.conversionRate,
                topReferrers: analytics.topReferrers,
            },
            stats: {
                totalCodes,
            },
        }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
  } catch (error) {
    handleApiError(error, { endpoint: "/api/referrals", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
