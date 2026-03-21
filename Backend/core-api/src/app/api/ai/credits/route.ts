import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { AICreditService } from "@/lib/ai/credit-service";
import { logger } from "@/lib/logger";

/**
 * GET /api/ai/credits
 * Returns AI credit balance and usage data for the authenticated merchant.
 */
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (_req, { storeId }) => {
    try {
      const [summary, alertInfo] = await Promise.all([
        AICreditService.getCreditSummary(storeId),
        AICreditService.checkLowCreditAlert(storeId),
      ]);

      return NextResponse.json(
        {
          success: true,
          data: {
            totalCreditsPurchased: summary.totalCreditsPurchased,
            creditsRemaining: summary.creditsRemaining,
            creditsUsed: summary.creditsUsed,
            percentageUsed: summary.percentageUsed,
            isLowCredit: summary.isLowCredit,
            estimatedRequestsRemaining: summary.estimatedRequestsRemaining,
            showAlert: alertInfo.showAlert,
          },
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[AI_CREDITS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch AI credit data" },
        { status: 500 },
      );
    }
  },
);
