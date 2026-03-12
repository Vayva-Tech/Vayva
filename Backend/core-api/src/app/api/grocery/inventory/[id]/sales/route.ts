import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);
    
    // Extract storeId from request context
    const storeId = "test-store-id"; // Placeholder

    // Verify product exists
    const product = await prisma.groceryProduct.findFirst({
      where: { id, storeId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    // Get sales data
    const salesData = await prisma.groceryOrderItem.findMany({
      where: {
        productId: id,
        order: {
          status: "delivered",
          createdAt: {
            gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
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

    // Calculate sales metrics
    const totalSales = salesData.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalQuantity = salesData.reduce((sum, item) => sum + item.quantity, 0);
    const uniqueCustomers = new Set(salesData.map(item => item.order.customer.id)).size;
    
    const salesMetrics = {
      totalRevenue: totalSales,
      totalQuantitySold: totalQuantity,
      averageOrderValue: totalSales / salesData.length || 0,
      uniqueCustomers,
      salesCount: salesData.length,
      recentSales: salesData.slice(0, 10), // Last 10 sales
    };

    return NextResponse.json(
      { data: salesMetrics },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[GROCERY_SALES_GET]", { error, productId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch sales data" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}