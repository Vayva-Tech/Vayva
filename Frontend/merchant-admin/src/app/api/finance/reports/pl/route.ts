import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";

// GET /api/finance/reports/pl - Generate Profit & Loss report
export const GET = withVayvaAPI(
  PERMISSIONS.FINANCE_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      
      // Parse date range (default to current month)
      const now = new Date();
      const startDateParam = searchParams.get("startDate");
      const endDateParam = searchParams.get("endDate");
      
      const startDate = startDateParam 
        ? new Date(startDateParam) 
        : new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = endDateParam 
        ? new Date(endDateParam) 
        : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

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
        `${process?.env?.BACKEND_API_URL}/api/finance/reports/pl?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        {
          headers: {
            "x-store-id": storeId,
          },
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to generate P&L report" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to generate P&L report" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json({ success: true, data });
    } catch (error: unknown) {
      logger.error("[FINANCE_REPORTS_PL_GET] Failed to generate P&L report", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to generate P&L report" },
        { status: 500 }
      );
    }
  }
);
