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

    const order = await prisma.groceryOrder.findFirst({
      where: { id, storeId },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        items: {
          select: {
            id: true,
            productId: true,
            quantity: true,
            unitPrice: true,
            notes: true,
            product: {
              select: {
                name: true,
                sku: true,
                unit: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    // Calculate order metrics
    const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const itemsValue = order.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    
    const daysSinceOrder = Math.floor((Date.now() - order.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const isOverdue = order.deliveryDate && new Date(order.deliveryDate) < new Date() && 
                     !['delivered', 'cancelled'].includes(order.status);

    // Parse JSON fields
    const orderWithDetails = {
      ...order,
      shippingAddress: JSON.parse(order.shippingAddress || "{}"),
      billingAddress: JSON.parse(order.billingAddress || "{}"),
      customerName: `${order.customer.firstName} ${order.customer.lastName}`,
      items: order.items.map(item => ({
        ...item,
        total: item.quantity * item.unitPrice,
      })),
      metrics: {
        itemCount,
        itemsValue: Math.round(itemsValue * 100) / 100,
        daysSinceOrder,
        isOverdue,
        isHighValue: order.totalAmount > 100,
        fulfillmentStatus: this.getFulfillmentStatus(order.status, order.deliveryDate),
      },
      timeline: {
        created: order.createdAt,
        lastUpdated: order.updatedAt,
        deliveryDate: order.deliveryDate,
        estimatedDelivery: order.deliveryDate || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
    };

    return NextResponse.json(
      { data: orderWithDetails },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[GROCERY_ORDER_GET]", { error, orderId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}

// Determine fulfillment status
function getFulfillmentStatus(status: string, deliveryDate: Date | null): string {
  if (status === "delivered") return "completed";
  if (status === "cancelled") return "cancelled";
  if (deliveryDate && new Date(deliveryDate) < new Date()) return "delayed";
  if (status === "shipped") return "in_transit";
  return "processing";
}