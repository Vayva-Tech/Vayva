import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { z } from "zod";
import { logger } from "@/lib/logger";

const QuerySchema = z.object({
  status: z.enum(["AVAILABLE", "UNAVAILABLE", "LOW_STOCK"]).optional(),
  categoryId: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.RESTAURANT_86_BOARD_VIEW,
  async (req, { storeId, db }) => {
    try {
      const { searchParams } = new URL(req.url);
      
      const status = searchParams.get("status") as any;
      const categoryId = searchParams.get("categoryId");
      
      QuerySchema.parse({ status, categoryId });
      
      const where: any = { storeId };
      
      if (status) {
        where.status = status;
      }
      
      if (categoryId) {
        where.categoryId = categoryId;
      }
      
      const boardItems = await db.boardItem.findMany({
        where,
        orderBy: [
          { status: "asc" },
          { itemName: "asc" },
        ],
        include: {
          category: {
            select: {
              name: true,
              id: true,
            },
          },
          _count: {
            select: {
              menuItemImpacts: true,
            },
          },
        },
      });
      
      // Get summary statistics
      const statusSummary = await db.boardItem.groupBy({
        by: ["status"],
        where: { storeId },
        _count: true,
      });
      
      // Get recently updated items
      const recentUpdates = await db.boardItem.findMany({
        where: { storeId },
        orderBy: { updatedAt: "desc" },
        take: 10,
        select: {
          id: true,
          itemName: true,
          status: true,
          updatedAt: true,
          updatedBy: true,
        },
      });
      
      return NextResponse.json({
        success: true,
        data: boardItems,
        summary: {
          statusCounts: statusSummary.reduce((acc: any, item: any) => {
            acc[item.status] = item._count;
            return acc;
          }, {}),
          recentUpdates,
        },
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid query parameters",
              details: error.errors,
            },
          },
          { status: 400 }
        );
      }
      
      logger.error("[RESTAURANT_86_BOARD_GET]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "86_BOARD_FETCH_FAILED",
            message: "Failed to fetch 86 board items",
          },
        },
        { status: 500 }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.RESTAURANT_86_BOARD_MANAGE,
  async (req, { storeId, db, user }) => {
    try {
      const body = await req.json();
      
      const boardItem = await db.boardItem.create({
        data: {
          ...body,
          storeId,
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
      
      logger.info("[RESTAURANT_86_BOARD_ITEM_CREATED]", {
        boardItemId: boardItem.id,
        itemName: boardItem.itemName,
        status: boardItem.status,
        storeId,
        userId: user.id,
      });
      
      return NextResponse.json({
        success: true,
        data: boardItem,
      });
    } catch (error: any) {
      logger.error("[RESTAURANT_86_BOARD_POST]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "86_BOARD_ITEM_CREATE_FAILED",
            message: "Failed to create 86 board item",
          },
        },
        { status: 500 }
      );
    }
  }
);