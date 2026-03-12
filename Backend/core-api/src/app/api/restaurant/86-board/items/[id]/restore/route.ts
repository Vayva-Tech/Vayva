import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { z } from "zod";
import { logger } from "@/lib/logger";

const RestoreItemSchema = z.object({
  status: z.enum(["AVAILABLE", "LOW_STOCK"]),
  notes: z.string().optional(),
});

export const PUT = withVayvaAPI(
  PERMISSIONS.RESTAURANT_86_BOARD_MANAGE,
  async (req, { storeId, db, params, user }) => {
    try {
      const { id } = await params;
      const body = await req.json();
      const validatedData = RestoreItemSchema.parse(body);
      
      const boardItem = await db.boardItem.findUnique({
        where: { id, storeId },
      });
      
      if (!boardItem) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "BOARD_ITEM_NOT_FOUND",
              message: "86 board item not found",
            },
          },
          { status: 404 }
        );
      }
      
      const updatedItem = await db.boardItem.update({
        where: { id },
        data: {
          status: validatedData.status,
          notes: validatedData.notes,
          updatedBy: user.id,
        },
        include: {
          category: {
            select: {
              name: true,
            },
          },
          menuItemImpacts: {
            include: {
              menuItem: {
                select: {
                  name: true,
                  isAvailable: true,
                },
              },
            },
          },
        },
      });
      
      // Optionally restore impacted menu items
      if (validatedData.status === "AVAILABLE") {
        const impactedMenuItems = await db.menuItemImpact.findMany({
          where: { boardItemId: id },
          select: {
            menuItemId: true,
          },
        });
        
        if (impactedMenuItems.length > 0) {
          await db.menuItem.updateMany({
            where: {
              id: { in: impactedMenuItems.map(item => item.menuItemId) },
            },
            data: {
              isAvailable: true,
              updatedBy: user.id,
            },
          });
          
          logger.info("[MENU_ITEMS_RESTORED_FROM_86_BOARD]", {
            boardItemId: id,
            menuItemIds: impactedMenuItems.map(item => item.menuItemId),
            storeId,
          });
        }
      }
      
      logger.info("[RESTAURANT_86_BOARD_ITEM_RESTORED]", {
        boardItemId: id,
        newItemStatus: validatedData.status,
        storeId,
        userId: user.id,
      });
      
      return NextResponse.json({
        success: true,
        data: updatedItem,
        message: `Board item restored as ${validatedData.status}`,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid request data",
              details: error.errors,
            },
          },
          { status: 400 }
        );
      }
      
      logger.error("[RESTAURANT_86_BOARD_ITEM_RESTORE_PUT]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "86_BOARD_ITEM_RESTORE_FAILED",
            message: "Failed to restore 86 board item",
          },
        },
        { status: 500 }
      );
    }
  }
);