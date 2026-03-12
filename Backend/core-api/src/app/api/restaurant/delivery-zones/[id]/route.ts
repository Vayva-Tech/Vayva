import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(
  PERMISSIONS.RESTAURANT_SETTINGS_VIEW,
  async (req, { storeId, db, params }) => {
    try {
      const { id } = await params;
      
      const deliveryZone = await db.deliveryZone.findUnique({
        where: { id, storeId },
      });
      
      if (!deliveryZone) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "DELIVERY_ZONE_NOT_FOUND",
              message: "Delivery zone not found",
            },
          },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: deliveryZone,
      });
    } catch (error: any) {
      logger.error("[RESTAURANT_DELIVERY_ZONE_GET]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DELIVERY_ZONE_FETCH_FAILED",
            message: "Failed to fetch delivery zone",
          },
        },
        { status: 500 }
      );
    }
  }
);

export const PUT = withVayvaAPI(
  PERMISSIONS.RESTAURANT_SETTINGS_MANAGE,
  async (req, { storeId, db, params, user }) => {
    try {
      const { id } = await params;
      const body = await req.json();
      
      const deliveryZone = await db.deliveryZone.findUnique({
        where: { id, storeId },
      });
      
      if (!deliveryZone) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "DELIVERY_ZONE_NOT_FOUND",
              message: "Delivery zone not found",
            },
          },
          { status: 404 }
        );
      }
      
      const updatedZone = await db.deliveryZone.update({
        where: { id },
        data: {
          ...body,
          updatedBy: user.id,
        },
      });
      
      logger.info("[RESTAURANT_DELIVERY_ZONE_UPDATED]", {
        zoneId: id,
        storeId,
        userId: user.id,
      });
      
      return NextResponse.json({
        success: true,
        data: updatedZone,
      });
    } catch (error: any) {
      logger.error("[RESTAURANT_DELIVERY_ZONE_PUT]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DELIVERY_ZONE_UPDATE_FAILED",
            message: "Failed to update delivery zone",
          },
        },
        { status: 500 }
      );
    }
  }
);