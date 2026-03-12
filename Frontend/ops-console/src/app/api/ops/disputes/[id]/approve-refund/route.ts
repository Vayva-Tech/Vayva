import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";
import { logger } from "@/lib/logger";

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  try {
    const sessionData = await OpsAuthService.requireSession();
    const { user } = sessionData;

    try {
      (OpsAuthService as any).requireRole(user, "OPS_ADMIN");
    } catch (e) {
      return NextResponse.json(
        {
          error:
            e instanceof Error
              ? e instanceof Error
                ? e.message
                : String(e)
              : String(e),
        },
        { status: 403 },
      );
    }

    const disputeId = params.id;
    const body = await request.json();
    const { refundAmount, reason } = body;

    // Fetch dispute
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        order: true,
      },
    });

    if (!dispute) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
    }

    // Check if already resolved
    if (["WON", "LOST", "CANCELLED"].includes(dispute.status)) {
      return NextResponse.json(
        { error: "Dispute is already resolved" },
        { status: 400 },
      );
    }

    // Update dispute status
    const updatedDispute = await prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: "LOST", // Refund approved = Merchant Lost
        updatedAt: new Date(),
      },
    });

    // Create ledger entry for refund
    // If refundAmount is provided, use it, else default logic
    const amount =
      refundAmount ||
      dispute.amount ||
      (dispute.order ? dispute.order.total : 0);

    await prisma.ledgerEntry.create({
      data: {
        storeId: dispute.merchantId, // Using merchantId as storeId context
        account: "MERCHANT_AVAILABLE", // Defaulting to an account type, checking schema
        direction: "DEBIT",
        referenceType: "DISPUTE_REFUND",
        referenceId: dispute.id,
        amount: Number(amount),
        currency: "NGN",
        description: `Refund for dispute ${dispute.id} - Order ${dispute.orderId}`,
        metadata: {
          disputeId: dispute.id,
          orderId: dispute.orderId,
          approvedBy: user.id,
          reason,
        },
      },
    });

    // Create timeline event
    await prisma.disputeTimelineEvent.create({
      data: {
        disputeId,
        eventType: "ADMIN_ACTION",
        payload: {
          action: "APPROVE_REFUND",
          amount: Number(amount),
          adminId: user.id,
          description: `Refund approved by Ops Admin: ${user.email}`,
        },
      },
    });

    // Log audit event
    await OpsAuthService.logEvent(user.id, "REFUND_APPROVED", {
      disputeId,
      orderId: dispute.orderId,
      amount: Number(amount),
      merchantId: dispute.merchantId,
      reason,
    });

    return NextResponse.json({
      success: true,
      dispute: updatedDispute,
      message: "Refund approved successfully",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    logger.error("Approve refund error", error);
    return NextResponse.json(
      { error: "Failed to approve refund" },
      { status: 500 },
    );
  }
}
