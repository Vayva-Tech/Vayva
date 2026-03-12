import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";

// GET /api/dashboard/industry-overview - Get industry overview
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/dashboard/industry-overview`,
        {
          headers: {
            "x-store-id": storeId,
          },
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to fetch industry overview" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to fetch industry overview" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json(data);
    } catch (error: unknown) {
      logger.error("[DASHBOARD_INDUSTRY_OVERVIEW_ERROR] Failed to fetch industry overview", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to fetch industry overview" },
        { status: 500 }
      );
    }
  }
);
