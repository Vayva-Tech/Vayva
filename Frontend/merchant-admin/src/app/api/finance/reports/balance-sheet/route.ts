import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";

// GET /api/finance/reports/balance-sheet - Generate Balance Sheet report
export const GET = withVayvaAPI(
  PERMISSIONS.FINANCE_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      
      // Parse as-of date (default to today)
      const asOfDateParam = searchParams.get("asOfDate");
      const asOfDate = asOfDateParam 
        ? new Date(asOfDateParam) 
        : new Date();

      // Validate date
      if (isNaN(asOfDate.getTime())) {
        return NextResponse.json(
          { success: false, error: "Invalid date format" },
          { status: 400 }
        );
      }

      // Forward to Backend API
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/finance/reports/balance-sheet?asOfDate=${asOfDate.toISOString()}`,
        {
          headers: {
            "x-store-id": storeId,
          },
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to generate balance sheet" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to generate balance sheet" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json({ success: true, data });
    } catch (error: unknown) {
      logger.error("[FINANCE_REPORTS_BALANCE_SHEET_GET] Failed to generate balance sheet", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to generate balance sheet" },
        { status: 500 }
      );
    }
  }
);
