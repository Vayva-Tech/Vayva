import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { getReferralService } from "@/services/referral";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(PERMISSIONS.MARKETING_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
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
    }
    catch (e: any) {
        logger.error("[REFERRALS_GET] Failed to fetch referral data", { storeId, error: e });
        return NextResponse.json({ error: "Failed to fetch referral data" }, { status: 500 });
    }
});
