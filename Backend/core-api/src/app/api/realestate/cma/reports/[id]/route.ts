/**
 * Individual CMA Report API Route
 * GET /api/realestate/cma/reports/[id] - Get CMA report details
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// GET CMA Report by ID
export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (request, { storeId, params }) => {
    try {
      const { id: reportId } = await params;
      
      if (!reportId) {
        return NextResponse.json(
          { error: "Report ID required" },
          { status: 400 }
        );
      }

      const report = await prisma.cMAReport.findFirst({
        where: {
          id: reportId,
          merchantId: storeId,
        },
        include: {
          property: true,
          comparables: {
            include: {
              comparableProperty: true,
            },
          },
        },
      });

      if (!report) {
        return NextResponse.json(
          { error: "CMA report not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: report,
      });
    } catch (error: unknown) {
      logger.error("[CMA_REPORT_GET]", error, { storeId, reportId: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);