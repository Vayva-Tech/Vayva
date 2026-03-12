import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

export const PUT = withVayvaAPI(
  PERMISSIONS.RESTAURANT_KDS_MANAGE,
  async (req, { storeId, db, params, user }) => {
    try {
      const { id } = await params;
      const body = await req.json();
      
      const station = await db.kitchenStation.findUnique({
        where: { id, storeId },
      });
      
      if (!station) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "STATION_NOT_FOUND",
              message: "Kitchen station not found",
            },
          },
          { status: 404 }
        );
      }
      
      const updatedStation = await db.kitchenStation.update({
        where: { id },
        data: {
          ...body,
          updatedBy: user.id,
        },
      });
      
      logger.info("[RESTAURANT_KDS_STATION_UPDATED]", {
        stationId: id,
        storeId,
        userId: user.id,
      });
      
      return NextResponse.json({
        success: true,
        data: updatedStation,
      });
    } catch (error: any) {
      logger.error("[RESTAURANT_KDS_STATION_PUT]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "KDS_STATION_UPDATE_FAILED",
            message: "Failed to update kitchen station",
          },
        },
        { status: 500 }
      );
    }
  }
);