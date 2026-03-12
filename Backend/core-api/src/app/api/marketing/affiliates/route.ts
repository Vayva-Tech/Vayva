import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { ReferralService } from "@/services/referral.service";
import { logger } from "@/lib/logger";
export const GET = withVayvaAPI(
  PERMISSIONS.METRICS_VIEW,
  async (req, { storeId }) => {
    try {
      // Ensure code exists and fetch stats
      await ReferralService.getOrCreateCode(storeId);
      const stats = await ReferralService.getStats(storeId);
      return NextResponse.json(
        {
          success: true,
          data: stats,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error) {
      logger.error("[AFFILIATES_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch affiliate data" },
        { status: 500 },
      );
    }
  },
);
