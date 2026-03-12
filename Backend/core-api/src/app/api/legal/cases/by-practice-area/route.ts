import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

/**
 * GET /api/legal/cases/by-practice-area
 * Get cases grouped by practice area
 */
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (request: NextRequest) => {
    try {
      const storeId = request.headers.get("x-store-id") || "default";
      
      const cases = await prisma.case.findMany({
        where: { storeId, status: 'active' },
        include: { practiceArea: true },
      });

      const grouped = cases.reduce((acc, caseItem) => {
        const pa = caseItem.practiceArea;
        if (!acc[pa.code]) {
          acc[pa.code] = {
            practiceArea: pa.name,
            code: pa.code,
            count: 0,
            totalValue: 0,
          };
        }
        acc[pa.code].count++;
        if (caseItem.actualValue) {
          acc[pa.code].totalValue += caseItem.actualValue;
        }
        return acc;
      }, {} as Record<string, any>);

      const result = Object.values(grouped).map((item: any) => ({
        ...item,
        percentage: Math.round((item.count / cases.length) * 100),
        avgValue: item.count > 0 ? item.totalValue / item.count : 0,
      }));

      return NextResponse.json({ success: true, data: result });
    } catch (error) {
      logger.error('[LEGAL_CASES_BY_PRACTICE_AREA_ERROR]', error);
      return NextResponse.json(
        { success: false, error: 'Failed to load cases by practice area' },
        { status: 500 }
      );
    }
  }
);
