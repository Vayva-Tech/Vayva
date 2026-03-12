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

    const product = await prisma.wholesaleProduct.findFirst({
      where: { id, storeId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        supplier: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    // Get inventory data
    const inventory = await prisma.wholesaleInventory.findFirst({
      where: { productId: id, storeId },
    });

    // Get recent purchase orders
    const recentPurchaseOrders = await prisma.wholesalePurchaseOrderItem.findMany({
      where: {
        productId: id,
        purchaseOrder: {
          status: { in: ["ordered", "received"] },
        },
      },
      include: {
        purchaseOrder: {
          select: {
            id: true,
            poNumber: true,
            status: true,
            createdAt: true,
            expectedDeliveryDate: true,
          },
        },
      },
      orderBy: { purchaseOrder: { createdAt: "desc" } },
      take: 10,
    });

    // Get recent sales
    const recentSales = await prisma.wholesaleOrderItem.findMany({
      where: {
        productId: id,
        order: {
          status: { not: "cancelled" },
        },
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            customer: {
              select: {
                id: true,
                companyName: true,
              },
            },
            createdAt: true,
          },
        },
      },
      orderBy: { order: { createdAt: "desc" } },
      take: 10,
    });

    const productWithDetails = {
      ...product,
      inventory: {
        currentStock: inventory?.currentStock || 0,
        reservedStock: inventory?.reservedStock || 0,
        availableStock: inventory ? inventory.currentStock - inventory.reservedStock : 0,
        reorderPoint: inventory?.reorderPoint || 0,
        lowStockAlert: inventory?.lowStockAlert || false,
      },
      supplyChain: {
        recentPurchaseOrders: recentPurchaseOrders.map(po => ({
          id: po.purchaseOrder.id,
          poNumber: po.purchaseOrder.poNumber,
          status: po.purchaseOrder.status,
          orderedQuantity: po.quantity,
          unitPrice: po.unitPrice,
          orderedDate: po.purchaseOrder.createdAt,
          expectedDelivery: po.purchaseOrder.expectedDeliveryDate,
        })),
        recentSales: recentSales.map(sale => ({
          id: sale.order.id,
          orderNumber: sale.order.orderNumber,
          customer: sale.order.customer.companyName,
          quantity: sale.quantity,
          unitPrice: sale.unitPrice,
          totalPrice: sale.totalPrice,
          saleDate: sale.order.createdAt,
        })),
      },
    };

    return NextResponse.json(
      { data: productWithDetails },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[WHOLESALE_PRODUCT_DETAILS_GET]", { error, productId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch product details" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}