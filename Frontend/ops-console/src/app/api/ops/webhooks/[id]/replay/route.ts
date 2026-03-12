import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user } = await OpsAuthService.requireSession();
    (OpsAuthService as any).requireRole(user, "OPERATOR");

    const { id } = await params;

    const webhook = await prisma.webhookEvent?.findUnique({
      where: { id },
    });

    if (!webhook) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
    }

    // Reset webhook to raw state
    await prisma.webhookEvent?.update({
      where: { id },
      data: {
        status: "RECEIVED",
        error: null,
        processedAt: null,
        // receivedAt is NOT reset to preserve history order
      },
    });

    // Create audit log
    await OpsAuthService.logEvent(user.id, "WEBHOOK_REPLAY", {
      targetType: "WebhookEvent",
      targetId: id,
      reason: "Manual replay triggered by operator",
      storeName: webhook.merchantId ?? undefined,
      webhookType: webhook.eventType,
    });

    return NextResponse.json({
      success: true,
      message: "Webhook queued for reprocessing",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    if (
      error instanceof Error ? error.message : String(error) === "Unauthorized"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (
      error instanceof Error
        ? error.message
        : String(error)?.includes("Insufficient permissions")
    ) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }
    logger.error("[WEBHOOK_REPLAY_ERROR]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
