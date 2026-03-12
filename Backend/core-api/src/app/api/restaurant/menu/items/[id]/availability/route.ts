import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

export const PUT = withVayvaAPI(
  PERMISSIONS.RESTAURANT_MENU_MANAGE,
  async (req, { storeId, db, params, user }) => {
    try {
      const { id } = await params;
      const body = await req.json();
      
      const menuItem = await db.menuItem.findUnique({
        where: { id, storeId },
        include: {
          category: {
            select: {
              name: true,
            },
          },
        },
      });
      
      if (!menuItem) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "MENU_ITEM_NOT_FOUND",
              message: "Menu item not found",
            },
          },
          { status: 404 }
        );
      }
      
      const updatedMenuItem = await db.menuItem.update({
        where: { id },
        data: {
          ...body,
          updatedBy: user.id,
        },
        include: {
          category: {
            select: {
              name: true,
            },
          },
        },
      });
      
      logger.info("[RESTAURANT_MENU_ITEM_AVAILABILITY_UPDATED]", {
        menuItemId: id,
        oldStatus: menuItem.isAvailable,
        newStatus: updatedMenuItem.isAvailable,
        storeId,
        userId: user.id,
      });
      
      return NextResponse.json({
        success: true,
        data: updatedMenuItem,
        message: `Menu item availability updated to ${updatedMenuItem.isAvailable ? 'available' : 'unavailable'}`,
      });
    } catch (error: any) {
      logger.error("[RESTAURANT_MENU_ITEM_AVAILABILITY_PUT]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MENU_ITEM_AVAILABILITY_UPDATE_FAILED",
            message: "Failed to update menu item availability",
          },
        },
        { status: 500 }
      );
    }
  }
);