import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

export const dynamic = "force-dynamic";

/**
 * POST /api/ops/payments/paystack-webhooks/[id]/reprocess
 * Reprocess a Paystack webhook event with idempotency protection
 * Requires: OPERATOR role or higher
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user } = await OpsAuthService.requireSession();
    (OpsAuthService as any).requireRole(user, "OPERATOR");

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { reason = "Manual reprocessing by operator" } = body;

    // Find the webhook event using PaymentWebhookEvent model
    const webhookEvent = await prisma.paymentWebhookEvent.findUnique({
      where: { id },
    });

    if (!webhookEvent) {
      return NextResponse.json(
        { error: "Webhook event not found" },
        { status: 404 },
      );
    }

    // Check if already processed successfully
    if (webhookEvent.status === "PROCESSED") {
      return NextResponse.json(
        {
          error: "Event already processed",
          message: "This webhook event has already been processed successfully",
          event: {
            id: webhookEvent.id,
            provider: webhookEvent.provider,
            eventType: webhookEvent.eventType,
            status: webhookEvent.status,
            processedAt: webhookEvent.processedAt,
          },
        },
        { status: 409 },
      );
    }

    // Update status to PENDING for reprocessing
    await prisma.paymentWebhookEvent.update({
      where: { id },
      data: {
        status: "RECEIVED",
        error: null,
      },
    });

    // Log the reprocessing request
    logger.info("[PAYSTACK_WEBHOOK_REPROCESS]", {
      eventId: id,
      providerEventId: webhookEvent.providerEventId,
      eventType: webhookEvent.eventType,
      storeId: webhookEvent.storeId,
      operatorId: user.id,
      operatorEmail: user.email,
      reason,
      previousStatus: webhookEvent.status,
    });

    // Create audit log
    await OpsAuthService.logEvent(user.id, "WEBHOOK_REPROCESS", {
      targetType: "PaymentWebhookEvent",
      targetId: id,
      provider: webhookEvent.provider,
      eventType: webhookEvent.eventType,
      storeId: webhookEvent.storeId,
      reason,
      previousStatus: webhookEvent.status,
    });

    return NextResponse.json({
      success: true,
      message: "Webhook event queued for reprocessing",
      event: {
        id: webhookEvent.id,
        provider: webhookEvent.provider,
        providerEventId: webhookEvent.providerEventId,
        eventType: webhookEvent.eventType,
        status: "QUEUED",
        storeId: webhookEvent.storeId,
        receivedAt: webhookEvent.receivedAt,
      },
      reprocessedBy: {
        id: user.id,
        email: user.email,
      },
      reason,
    });
    } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message?.includes("Insufficient permissions")) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }
    logger.error("[PAYSTACK_WEBHOOK_REPROCESS_ERROR]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
