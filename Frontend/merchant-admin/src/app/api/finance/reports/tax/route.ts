import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";

// GET /api/finance/reports/tax - Generate Tax Summary report
export const GET = withVayvaAPI(
  PERMISSIONS.FINANCE_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      
      // Parse date range (default to current quarter)
      const now = new Date();
      const quarter = Math.floor(now.getMonth() / 3);
      const startDateParam = searchParams.get("startDate");
      const endDateParam = searchParams.get("endDate");
      
      const startDate = startDateParam 
        ? new Date(startDateParam) 
        : new Date(now.getFullYear(), quarter * 3, 1);
      const endDate = endDateParam 
        ? new Date(endDateParam) 
        : new Date(now.getFullYear(), (quarter + 1) * 3, 0, 23, 59, 59);

      // Validate dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return NextResponse.json(
          { success: false, error: "Invalid date format" },
          { status: 400 }
        );
      }

      if (startDate > endDate) {
        return NextResponse.json(
          { success: false, error: "Start date must be before end date" },
          { status: 400 }
        );
      }

      // Forward to Backend API
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/finance/reports/tax?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        {
          headers: {
            "x-store-id": storeId,
          },
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to generate tax summary" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to generate tax summary" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json({ success: true, data });
    } catch (error: unknown) {
      logger.error("[FINANCE_REPORTS_TAX_GET] Failed to generate tax summary", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to generate tax summary" },
        { status: 500 }
      );
    }
  }
);
