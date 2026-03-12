import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(
  PERMISSIONS.FASHION_SIZE_GUIDES_VIEW,
  async (req, { storeId, db, params }) => {
    try {
      const { id } = await params;
      
      // Get size guide with detailed measurements
      const sizeGuide = await db.sizeGuide.findUnique({
        where: { id, storeId },
      });
      
      if (!sizeGuide) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "SIZE_GUIDE_NOT_FOUND",
              message: "Size guide not found",
            },
          },
          { status: 404 }
        );
      }
      
      // Return measurements data
      return NextResponse.json({
        success: true,
        data: sizeGuide.measurements || [],
      });
    } catch (error: any) {
      logger.error("[FASHION_SIZE_GUIDE_MEASUREMENTS_GET]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MEASUREMENTS_FETCH_FAILED",
            message: "Failed to fetch size guide measurements",
          },
        },
        { status: 500 }
      );
    }
  }
);