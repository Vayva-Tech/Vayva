/**
 * CMA Detail API Routes
 * GET /api/realestate/cma/[id] - Get CMA report details
 * DELETE /api/realestate/cma/[id] - Delete CMA report
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// GET CMA Report Details
export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (request, { storeId, params }) => {
    try {
      const { id } = params;

      const report = await prisma.cMAReport.findFirst({
        where: {
          id,
          merchantId: storeId,
        },
        include: {
          property: true,
          comparables: true,
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
      logger.error("[CMA_DETAIL_GET]", error, { storeId, id: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);

// DELETE CMA Report
export const DELETE = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (request, { storeId, params }) => {
    try {
      const { id } = params;

      await prisma.cMAReport.deleteMany({
        where: {
          id,
          merchantId: storeId,
        },
      });

      return NextResponse.json({
        success: true,
        message: "CMA report deleted",
      });
    } catch (error: unknown) {
      logger.error("[CMA_DELETE]", error, { storeId, id: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);
