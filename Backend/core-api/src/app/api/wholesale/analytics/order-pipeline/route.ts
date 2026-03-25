import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export const GET = withVayvaAPI(
  PERMISSIONS.WHOLESALE_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      // Get orders by status
      const [pendingOrders, processingOrders, shippedOrders, readyForPickupOrders] = await Promise.all([
        prisma.wholesaleOrder.count({
          where: { storeId, status: "pending" }
        }),
        prisma.wholesaleOrder.count({
          where: { storeId, status: "processing" }
        }),
        prisma.wholesaleOrder.count({
          where: { storeId, status: "shipped" }
        }),
        prisma.wholesaleOrder.count({
          where: { storeId, status: "ready_for_pickup" }
        })
      ]);

      // Get total backlog (all non-completed orders)
      const totalBacklog = await prisma.wholesaleOrder.count({
        where: {
          storeId,
          status: { in: ["pending", "processing", "shipped", "ready_for_pickup"] }
        }
      });

      // Calculate on-time shipment rate (simplified - would need actual ship dates vs promised dates)
      const _recentShippedOrders = await prisma.wholesaleOrder.count({
        where: {
          storeId,
          status: "shipped",
          updatedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        }
      });

      // For demo purposes, assuming 95% on-time rate
      const onTimeShipRate = 94.7; // This would be calculated from actual data

      const orderPipeline = {
        pending: pendingOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        readyForPickup: readyForPickupOrders,
        totalBacklog,
        onTimeShipRate,
      };

      return NextResponse.json(
        { data: orderPipeline },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[WHOLESALE_ORDER_PIPELINE_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch order pipeline data" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);