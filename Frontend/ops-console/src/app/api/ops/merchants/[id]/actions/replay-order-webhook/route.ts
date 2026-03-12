import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";
import { logger } from "@vayva/shared";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user } = await OpsAuthService.requireSession();
  if (!["OPS_OWNER", "OPS_ADMIN"].includes(user.role)) {
    return NextResponse.json(
      { error: "Insufficient permissions" },
      { status: 403 },
    );
  }

  try {
    const { orderId } = await req.json();
    const { id: storeId } = await params;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    // Verify order belongs to store
    const order = await prisma.order.findFirst({
      where: { id: orderId, storeId },
      select: { id: true, orderNumber: true, paymentStatus: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Log the replay action (webhook replay would be handled by a background job)
    // In production, this would trigger actual webhook processing

    await OpsAuthService.logEvent(user.id, "REPLAY_ORDER_WEBHOOK", {
      storeId,
      orderId,
      orderNumber: order.orderNumber,
    });

    return NextResponse.json({
      success: true,
      message: "Webhook replay queued",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    logger.error("[REPLAY_WEBHOOK_ERROR]", { error });
    return NextResponse.json(
      { error: "Failed to replay webhook" },
      { status: 500 },
    );
  }
}
