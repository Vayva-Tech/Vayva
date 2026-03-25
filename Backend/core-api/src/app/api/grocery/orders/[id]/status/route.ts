import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const StatusUpdateSchema = z.object({
  status: z.enum([
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "returned",
  ]),
  notes: z.string().optional(),
  trackingNumber: z.string().optional(),
  deliveredAt: z.string().datetime().optional(),
});

export const PATCH = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { id } = await params;
      const json = await req.json().catch(() => ({}));
      const parseResult = StatusUpdateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid status update data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      const { status, notes, trackingNumber, deliveredAt } = parseResult.data;

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
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      const validTransitions: Record<string, string[]> = {
        pending: ["processing", "cancelled"],
        processing: ["shipped", "delivered", "cancelled"],
        shipped: ["delivered", "returned"],
        delivered: ["returned"],
        cancelled: [],
        returned: [],
      };

      if (!validTransitions[order.status]?.includes(status)) {
        return NextResponse.json(
          { error: `Cannot transition from ${order.status} to ${status}` },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      if (status === "cancelled" || status === "returned") {
        await Promise.all(
          order.items.map((item) =>
            prisma.groceryProduct.updateMany({
              where: { id: item.productId, storeId },
              data: {
                currentStock: { increment: item.quantity },
              },
            }),
          ),
        );
      }

      const updateResult = await prisma.groceryOrder.updateMany({
        where: { id, storeId },
        data: {
          status,
          trackingNumber,
          deliveredAt: deliveredAt ? new Date(deliveredAt) : null,
          notes: notes || order.notes,
        },
      });

      if (!updateResult.count) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      const updatedOrder = await prisma.groceryOrder.findFirst({
        where: { id, storeId },
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

      if (!updatedOrder) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      await prisma.groceryOrderStatusHistory.create({
        data: {
          storeId,
          orderId: id,
          status,
          notes,
        },
      });

      return NextResponse.json(updatedOrder, {
        headers: standardHeaders(requestId),
      });
    } catch (error: unknown) {
      const { id: orderId } = await params;
      logger.error("[GROCERY_ORDER_STATUS_PATCH]", { error, orderId });
      return NextResponse.json(
        { error: "Failed to update order status" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
