import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger, standardHeaders } from "@vayva/shared";

// GET /api/products/summary - Get product summary statistics
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      // Get total products count
      const totalProducts = await prisma.product.count({
        where: { storeId }
      });

      // Get active products count
      const activeProducts = await prisma.product.count({
        where: { 
          storeId,
          status: "ACTIVE"
        }
      });

      // Get products with low stock (less than 10)
      const lowStockProducts = await prisma.inventoryItem.count({
        where: {
          product: {
            storeId
          },
          available: {
            lt: 10
          }
        }
      });

      // Get total revenue from product sales
      const productRevenueResult = await prisma.$queryRaw<{ total_revenue: number }[]>`
        SELECT COALESCE(SUM(o."total"), 0) as total_revenue
        FROM "Order" o
        JOIN "OrderItem" oi ON o."id" = oi."orderId"
        JOIN "Product" p ON oi."productId" = p."id"
        WHERE p."storeId" = ${storeId}
        AND o."status" = 'DELIVERED'
      `;

      const totalRevenue = Number(productRevenueResult[0]?.total_revenue || 0);

      return NextResponse.json(
        {
          total: totalProducts,
          active: activeProducts,
          lowStock: lowStockProducts,
          totalRevenue: totalRevenue
        },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.error("Failed to fetch product summary", {
        requestId,
        error: msg,
        storeId,
        app: "merchant",
      });
      return NextResponse.json(
        { 
          error: "Failed to fetch product summary",
          total: 0,
          active: 0,
          lowStock: 0,
          totalRevenue: 0
        },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);