import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { generateTaxSummary } from "@/lib/accounting/ledger";
import { logger } from "@/lib/logger";

// GET /api/finance/reports/tax - Generate Tax Summary report
export const GET = withVayvaAPI(
  PERMISSIONS.FINANCE_VIEW,
  async (req: Request, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      
      const startDateParam = searchParams.get("startDate");
      const endDateParam = searchParams.get("endDate");
      
      if (!startDateParam || !endDateParam) {
        return NextResponse.json(
          { success: false, error: "startDate and endDate are required" },
          { status: 400 }
        );
      }

      const startDate = new Date(startDateParam);
      const endDate = new Date(endDateParam);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return NextResponse.json(
          { success: false, error: "Invalid date format" },
          { status: 400 }
        );
      }

      const report = await generateTaxSummary(storeId, startDate, endDate);

      return NextResponse.json({
        success: true,
        data: report,
      });
    } catch (error: unknown) {
      logger.error("[FINANCE_REPORTS_TAX_GET] Failed to generate tax summary", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to generate tax summary" },
        { status: 500 }
      );
    }
  }
);
