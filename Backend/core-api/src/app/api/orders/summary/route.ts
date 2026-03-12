import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger, standardHeaders } from "@vayva/shared";

// GET /api/orders/summary - Get order summary statistics
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      // Get total orders count
      const totalOrders = await prisma.order.count({
        where: { storeId }
      });

      // Get orders by status
      const pendingOrders = await prisma.order.count({
        where: { 
          storeId,
          status: "PENDING_PAYMENT"
        }
      });

      const processingOrders = await prisma.order.count({
        where: { 
          storeId,
          fulfillmentStatus: "PROCESSING"
        }
      });

      const shippedOrders = await prisma.order.count({
        where: { 
          storeId,
          fulfillmentStatus: "OUT_FOR_DELIVERY"
        }
      });

      const deliveredOrders = await prisma.order.count({
        where: { 
          storeId,
          status: "DELIVERED"
        }
      });

      const cancelledOrders = await prisma.order.count({
        where: { 
          storeId,
          status: "CANCELLED"
        }
      });

      // Get total revenue from all orders
      const revenueResult = await prisma.$queryRaw<{ total_revenue: number }[]>`
        SELECT COALESCE(SUM("total"), 0) as total_revenue
        FROM "Order"
        WHERE "storeId" = ${storeId}
        AND "status" = 'DELIVERED'
      `;

      const totalRevenue = Number(revenueResult[0]?.total_revenue || 0);

      return NextResponse.json(
        {
          total: totalOrders,
          pending: pendingOrders,
          processing: processingOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
          totalRevenue: totalRevenue
        },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.error("Failed to fetch order summary", {
        requestId,
        error: msg,
        storeId,
        app: "merchant",
      });
      return NextResponse.json(
        { 
          error: "Failed to fetch order summary",
          total: 0,
          pending: 0,
          processing: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
          totalRevenue: 0
        },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);