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

    const purchaseOrder = await prisma.wholesalePurchaseOrder.findFirst({
      where: { id, storeId },
      include: {
        supplier: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            contactEmail: true,
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

    if (!purchaseOrder) {
      return NextResponse.json(
        { error: "Purchase order not found" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    // Calculate fulfillment metrics
    const totalItems = purchaseOrder.items.length;
    const receivedItems = purchaseOrder.items.filter(item => item.receivedQuantity > 0).length;
    const fulfillmentRate = totalItems > 0 ? (receivedItems / totalItems) * 100 : 0;
    
    const totalOrderedQuantity = purchaseOrder.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalReceivedQuantity = purchaseOrder.items.reduce((sum, item) => sum + item.receivedQuantity, 0);
    const quantityAccuracy = totalOrderedQuantity > 0 ? (totalReceivedQuantity / totalOrderedQuantity) * 100 : 0;

    const poWithMetrics = {
      ...purchaseOrder,
      fulfillment: {
        totalItems,
        receivedItems,
        fulfillmentRate,
        totalOrderedQuantity,
        totalReceivedQuantity,
        quantityAccuracy,
        isFullyReceived: totalReceivedQuantity >= totalOrderedQuantity,
      },
    };

    return NextResponse.json(
      { data: poWithMetrics },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[WHOLESALE_PURCHASE_ORDER_GET]", { error, poId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch purchase order" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}