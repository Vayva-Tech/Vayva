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
    
    // Extract storeId from request context
    const storeId = "test-store-id"; // Placeholder

    const supplier = await prisma.wholesaleSupplier.findFirst({
      where: { id, storeId },
      include: {
        _count: {
          select: {
            products: true,
            purchaseOrders: {
              where: { status: { not: "cancelled" } },
            },
          },
        },
      },
    });

    if (!supplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    // Get performance metrics
    const performanceMetrics = await getSupplierPerformance(id, storeId);

    const supplierWithMetrics = {
      ...supplier,
      performance: performanceMetrics,
    };

    return NextResponse.json(
      { data: supplierWithMetrics },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[WHOLESALE_SUPPLIER_GET]", { error, supplierId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch supplier" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}

// Helper function to calculate supplier performance metrics
async function getSupplierPerformance(supplierId: string, storeId: string) {
  const [products, purchaseOrders, deliveries] = await Promise.all([
    prisma.wholesaleProduct.findMany({
      where: { supplierId, storeId },
      select: {
        id: true,
        unitPrice: true,
        costPrice: true,
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    }),
    prisma.wholesalePurchaseOrder.findMany({
      where: { 
        supplierId,
        storeId,
        status: { in: ["ordered", "received", "completed"] },
        createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
      },
      select: {
        id: true,
        totalAmount: true,
        expectedDeliveryDate: true,
        createdAt: true,
      },
    }),
    prisma.wholesalePurchaseOrderItem.findMany({
      where: {
        purchaseOrder: {
          supplierId,
          storeId,
          status: "received",
        },
      },
      select: {
        quantity: true,
        receivedQuantity: true,
        unitPrice: true,
      },
    }),
  ]);

  const totalProducts = products.length;
  const totalSpent = purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0);
  const totalItemsOrdered = purchaseOrders.length;
  
  // Delivery performance
  const onTimeDeliveries = purchaseOrders.filter(po => 
    po.expectedDeliveryDate && new Date() <= po.expectedDeliveryDate
  ).length;
  const deliveryRate = purchaseOrders.length > 0 ? (onTimeDeliveries / purchaseOrders.length) * 100 : 0;
  
  // Quality metrics
  const totalOrderedQuantity = deliveries.reduce((sum, item) => sum + item.quantity, 0);
  const totalReceivedQuantity = deliveries.reduce((sum, item) => sum + (item.receivedQuantity || 0), 0);
  const qualityRate = totalOrderedQuantity > 0 ? (totalReceivedQuantity / totalOrderedQuantity) * 100 : 0;

  return {
    totalProducts,
    totalSpent,
    totalOrders: totalItemsOrdered,
    deliveryPerformance: {
      onTimeRate: deliveryRate,
      averageOrderValue: totalItemsOrdered > 0 ? totalSpent / totalItemsOrdered : 0,
    },
    qualityMetrics: {
      quantityAccuracy: qualityRate,
      itemsPerOrder: totalItemsOrdered > 0 ? totalOrderedQuantity / totalItemsOrdered : 0,
    },
    productPerformance: {
      averageMarkup: products.length > 0 
        ? products.reduce((sum, p) => sum + ((p.unitPrice - p.costPrice) / p.costPrice), 0) / products.length
        : 0,
      totalSales: products.reduce((sum, p) => sum + p._count.orderItems, 0),
    },
    reliabilityScore: (deliveryRate * 0.4) + (qualityRate * 0.3) + (100 * 0.3), // Weighted score
  };
}