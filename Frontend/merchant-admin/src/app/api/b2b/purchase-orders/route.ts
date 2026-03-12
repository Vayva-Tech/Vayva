import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

const orderSchema = z.object({
  customerId: z.string(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
    variantId: z.string().optional(),
  })).min(1),
  deliveryDate: z.string().datetime(),
  deliveryAddress: z.string().min(1),
  specialInstructions: z.string().max(2000).optional(),
});

const statusUpdateSchema = z.object({
  status: z.enum(["draft", "sent", "acknowledged", "shipped", "delivered", "invoiced", "paid", "cancelled"]),
});

function generatePONumber(): string {
  const prefix = "PO";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * GET /api/b2b/purchase-orders?storeId=xxx&status=xxx
 * List purchase orders
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");
    const status = searchParams.get("status");
    const customerId = searchParams.get("customerId");

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID required" },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { storeId };
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;

    const orders = await prisma.purchaseOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const stats = {
      total: orders.length,
      totalValue: orders.reduce((sum: any, o: any) => sum + Number(o.total), 0),
      byStatus: {
        draft: orders.filter((o: any) => o.status === "draft").length,
        sent: orders.filter((o: any) => o.status === "sent").length,
        acknowledged: orders.filter((o: any) => o.status === "acknowledged").length,
        shipped: orders.filter((o: any) => o.status === "shipped").length,
        delivered: orders.filter((o: any) => o.status === "delivered").length,
        invoiced: orders.filter((o: any) => o.status === "invoiced").length,
        paid: orders.filter((o: any) => o.status === "paid").length,
      },
    };

    return NextResponse.json({ orders, stats });
  } catch (error: unknown) {
    logger.error("[PURCHASE_ORDERS_GET] Failed to fetch", { error });
    return NextResponse.json(
      { error: "Failed to fetch purchase orders" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/b2b/purchase-orders
 * Create purchase order
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const validated = orderSchema.parse(body);

    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID required" },
        { status: 400 }
      );
    }

    // Calculate totals
    const items = validated.items.map((item: any) => ({
      ...item,
      total: item.quantity * item.unitPrice,
    }));

    const subtotal = items.reduce((sum: any, item: any) => sum + item.total, 0);
    const tax = subtotal * 0.075; // 7.5% VAT
    const total = subtotal + tax;

    const order = await prisma.purchaseOrder.create({
      data: {
        storeId,
        customerId: validated.customerId,
        poNumber: generatePONumber(),
        items: items as never[],
        subtotal,
        tax,
        total,
        status: "draft",
        deliveryDate: new Date(validated.deliveryDate),
        deliveryAddress: validated.deliveryAddress,
        specialInstructions: validated.specialInstructions,
      },
    });

    logger.info("[PURCHASE_ORDER_POST] Created", {
      orderId: order.id,
      storeId,
      customerId: validated.customerId,
      total,
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[PURCHASE_ORDER_POST] Failed", { error });
    return NextResponse.json(
      { error: "Failed to create purchase order" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/b2b/purchase-orders?id=xxx
 * Update order status
 */
export async function PATCH(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Order ID required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = statusUpdateSchema.parse(body);

    const order = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: validated.status,
        updatedAt: new Date(),
      },
    });

    // Credit restoration disabled - model does not exist in schema
    // if (validated.status === "cancelled" && order.creditLineId) {
    //   await prisma.creditLine.update({
    //     where: { id: order.creditLineId },
    //     data: {
    //       availableCredit: { increment: Number(order.total) },
    //       totalUsed: { decrement: Number(order.total) },
    //       updatedAt: new Date(),
    //     },
    //   });
    // }

    logger.info("[PURCHASE_ORDER_PATCH] Updated", {
      orderId: id,
      status: validated.status,
    });

    return NextResponse.json({ order });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[PURCHASE_ORDER_PATCH] Failed", { error });
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/b2b/purchase-orders?id=xxx
 * Delete/cancel order (admin only)
 */
export async function DELETE(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Order ID required" },
        { status: 400 }
      );
    }

    // Soft delete by marking as cancelled
    const order = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: "cancelled",
        updatedAt: new Date(),
      },
    });

    // Credit restoration disabled - model does not exist in schema
    // if (order.creditLineId) {
    //   await prisma.creditLine.update({
    //     where: { id: order.creditLineId },
    //     data: {
    //       availableCredit: { increment: Number(order.total) },
    //       totalUsed: { decrement: Number(order.total) },
    //       updatedAt: new Date(),
    //     },
    //   });
    // }

    logger.info("[PURCHASE_ORDER_DELETE] Cancelled", { orderId: id });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    logger.error("[PURCHASE_ORDER_DELETE] Failed", { error });
    return NextResponse.json(
      { error: "Failed to cancel order" },
      { status: 500 }
    );
  }
}
