import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export const GET = withVayvaAPI(
  PERMISSIONS.INVENTORY_VIEW,
  async (_req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { id } = await params;

      const product = await prisma.groceryProduct.findFirst({
        where: { id, storeId },
      });

      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      const salesData = await prisma.groceryOrderItem.findMany({
        where: {
          productId: id,
          order: {
            storeId,
            status: "delivered",
            createdAt: {
              gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            },
          },
        },
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              createdAt: true,
              totalAmount: true,
              customer: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: { order: { createdAt: "desc" } },
      });

      const totalSales = salesData.reduce((sum, item) => sum + item.totalPrice, 0);
      const totalQuantity = salesData.reduce((sum, item) => sum + item.quantity, 0);
      const uniqueCustomers = new Set(
        salesData.map((item) => item.order.customer.id),
      ).size;

      const salesMetrics = {
        totalRevenue: totalSales,
        totalQuantitySold: totalQuantity,
        averageOrderValue:
          salesData.length > 0 ? totalSales / salesData.length : 0,
        uniqueCustomers,
        salesCount: salesData.length,
        recentSales: salesData.slice(0, 10),
      };

      return NextResponse.json(
        { data: salesMetrics },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      const { id: productId } = await params;
      logger.error("[GROCERY_SALES_GET]", { error, productId });
      return NextResponse.json(
        { error: "Failed to fetch sales data" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
