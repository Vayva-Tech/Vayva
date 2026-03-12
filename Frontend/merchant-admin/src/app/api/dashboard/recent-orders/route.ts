import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";

// GET /api/dashboard/recent-orders - Get recent orders
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const limit = parseInt(searchParams.get("limit") || "5");

      const queryParams = new URLSearchParams();
      queryParams.set("limit", limit.toString());

      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/dashboard/recent-orders?${queryParams}`,
        {
          headers: {
            "x-store-id": storeId,
          },
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to fetch recent orders" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to fetch recent orders" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json(data);
    } catch (error: unknown) {
      logger.error("[DASHBOARD_RECENT_ORDERS_ERROR] Failed to fetch recent orders", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to fetch recent orders" },
        { status: 500 }
      );
    }
  }
);
