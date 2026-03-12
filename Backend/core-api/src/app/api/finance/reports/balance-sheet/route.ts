import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { generateBalanceSheet } from "@/lib/accounting/ledger";
import { logger } from "@/lib/logger";

// GET /api/finance/reports/balance-sheet - Generate Balance Sheet report
export const GET = withVayvaAPI(
  PERMISSIONS.FINANCE_VIEW,
  async (req: Request, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      
      const asOfDateParam = searchParams.get("asOfDate");
      const asOfDate = asOfDateParam ? new Date(asOfDateParam) : new Date();

      if (isNaN(asOfDate.getTime())) {
        return NextResponse.json(
          { success: false, error: "Invalid date format" },
          { status: 400 }
        );
      }

      const report = await generateBalanceSheet(storeId, asOfDate);

      return NextResponse.json({
        success: true,
        data: report,
      });
    } catch (error: unknown) {
      logger.error("[FINANCE_REPORTS_BALANCE_SHEET_GET] Failed to generate balance sheet", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to generate balance sheet" },
        { status: 500 }
      );
    }
  }
);
