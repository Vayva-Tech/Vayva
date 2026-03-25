import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";

/**
 * GET /api/ai/analytics
 * Get comprehensive AI analytics and metrics
 */
export const GET = withVayvaAPI(
  PERMISSIONS.AI_ASSISTANT_USE,
  async (_req: NextRequest, { storeId }) => {
    try {
      return NextResponse.json({
        storeId,
        enabled: false,
        message:
          "AI analytics is not enabled on this deployment (schema not configured).",
      });
    } catch (error) {
      console.error('[AI_ANALYTICS] Error:', error);
      return NextResponse.json(
        { error: "Failed to fetch analytics" },
        { status: 500 }
      );
    }
  }
);