import { NextResponse, NextRequest } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";

// GET /api/analytics/overview - Get dashboard analytics summary
export const GET = withVayvaAPI(
  PERMISSIONS.ANALYTICS_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const period = searchParams.get("period") || "30d"; // 7d, 30d, 90d, 1y

      const backendUrl = new URL(`${process.env.BACKEND_API_URL}/api/analytics/overview`);
      backendUrl.searchParams.set("period", period);

      const backendResponse = await fetch(backendUrl.toString(), {
        headers: {
          "x-store-id": storeId,
        },
      });

      if (!backendResponse.ok) {
        const error = await backendResponse
          .json()
          .catch(() => ({ error: "Failed to fetch analytics" }));

        return NextResponse.json(
          { success: false, error: error.error || "Failed to fetch analytics" },
          { status: backendResponse.status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json(data);
    } catch (error: unknown) {
      logger.error("[ANALYTICS_GET_ERROR] Failed to fetch analytics", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to fetch analytics" },
        { status: 500 }
      );
    }
  }
);
