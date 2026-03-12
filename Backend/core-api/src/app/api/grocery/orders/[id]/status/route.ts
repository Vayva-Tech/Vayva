import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const StatusUpdateSchema = z.object({
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled", "returned"]),
  notes: z.string().optional(),
  trackingNumber: z.string().optional(),
  deliveredAt: z.string().datetime().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = params;
    const json = await req.json().catch(() => ({}));
    const parseResult = StatusUpdateSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid status update data",
          details: parseResult.error.flatten(),
        },
        { status: 400, headers: standardHeaders(requestId) }
      );
    }

    const { status, notes, trackingNumber, deliveredAt } = parseResult.data;
    
    // Extract storeId from request context
    const storeId = "test-store-id"; // Placeholder

    // Verify order exists
    const order = await prisma.groceryOrder.findFirst({
      where: { id, storeId },
      include: {
        items: {
          select: {
            productId: true,
            quantity: true,
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

    // Validate status transitions
    const validTransitions = {
      pending: ["processing", "cancelled"],
      processing: ["shipped", "delivered", "cancelled"],
      shipped: ["delivered", "returned"],
      delivered: ["returned"],
      cancelled: [],
      returned: [],
    };

    if (!validTransitions[order.status].includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition from ${order.status} to ${status}` },
        { status: 400, headers: standardHeaders(requestId) }
      );
    }

    // Handle inventory adjustments for cancellations/returns
    if (status === "cancelled" || status === "returned") {
      await Promise.all(
        order.items.map(item => 
          prisma.groceryProduct.update({
            where: { id: item.productId },
            data: {
              currentStock: { increment: item.quantity },
            },
          })
        )
      );
    }

    // Update order status
    const updatedOrder = await prisma.groceryOrder.update({
      where: { id },
      data: {
        status,
        trackingNumber,
        deliveredAt: deliveredAt ? new Date(deliveredAt) : null,
        notes: notes || order.notes,
      },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Create status history record
    await prisma.groceryOrderStatusHistory.create({
      data: {
        storeId,
        orderId: id,
        status,
        notes,
      },
    });

    // In a real implementation, you'd send notifications here
    // if (status === "shipped") {
    //   await sendShippingNotification(updatedOrder.customer, trackingNumber);
    // } else if (status === "delivered") {
    //   await sendDeliveryConfirmation(updatedOrder.customer);
    // }

    return NextResponse.json(updatedOrder, {
      headers: standardHeaders(requestId),
    });
  } catch (error: unknown) {
    logger.error("[GROCERY_ORDER_STATUS_PATCH]", { error, orderId: params.id });
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}