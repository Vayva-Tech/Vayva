import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(
  PERMISSIONS.RETAIL_TRANSFERS_VIEW,
  async (req, { storeId, db }) => {
    try {
      // Get pending inventory transfers
      const pendingTransfers = await db.inventoryTransfer.findMany({
        where: {
          storeId,
          status: "PENDING",
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          fromStore: {
            select: {
              id: true,
              name: true,
            },
          },
          toStore: {
            select: {
              id: true,
              name: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                },
              },
            },
          },
        },
      });
      
      // Get summary statistics
      const summary = await db.inventoryTransfer.groupBy({
        by: ["status"],
        where: { storeId },
        _count: true,
      });
      
      return NextResponse.json({
        success: true,
        data: pendingTransfers,
        summary: summary.reduce((acc: any, item: any) => {
          acc[item.status] = item._count;
          return acc;
        }, {}),
      });
    } catch (error: any) {
      logger.error("[RETAIL_TRANSFERS_PENDING_GET]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PENDING_TRANSFERS_FETCH_FAILED",
            message: "Failed to fetch pending transfers",
          },
        },
        { status: 500 }
      );
    }
  }
);