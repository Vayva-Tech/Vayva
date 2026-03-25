import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { PaystackService } from "@/lib/payment/paystack";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const runtime = "nodejs";

async function handler(req: NextRequest, ctx: { storeId?: string }) {
  const storeId = ctx.storeId;
  if (!storeId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const bodyUnknown: unknown = await req.json().catch(() => ({}));
    const body = isRecord(bodyUnknown) ? bodyUnknown : {};
    const reference = getString(body.reference) || "";
    if (!reference) {
      return NextResponse.json({ error: "reference is required" }, { status: 400 });
    }

    // Verify Paystack transaction
    const verified = await PaystackService.verifyTransaction(reference);
    const data = isRecord(verified.data) ? verified.data : {};
    if (String(data.status || "") !== "success") {
      return NextResponse.json(
        { error: "Payment not successful" },
        { status: 402, headers: { "Cache-Control": "no-store" } },
      );
    }

    const metadata = isRecord(data.metadata) ? data.metadata : {};
    const metaStoreId = getString(metadata.storeId) || "";
    if (!metaStoreId || metaStoreId !== storeId) {
      return NextResponse.json({ error: "Payment does not belong to this store" }, { status: 403 });
    }

    const messagesAddedRaw = metadata.messagesAdded;
    const messagesAdded = typeof messagesAddedRaw === "number" ? messagesAddedRaw : Number(messagesAddedRaw || 0);
    const packId = getString(metadata.packId) || "AI_MESSAGES_TOPUP";
    const amountKobo = Number(data.amount || 0);

    if (!Number.isFinite(messagesAdded) || messagesAdded <= 0) {
      return NextResponse.json({ error: "Invalid top-up metadata" }, { status: 400 });
    }

    // Idempotency: if we've already applied this reference, return success
    const existing = await prisma.aiAddonPurchase.findUnique({
      where: { transactionId: reference },
      select: { id: true, messagesAdded: true },
    });
    if (existing) {
      return NextResponse.json(
        { success: true, data: { applied: true, messagesAdded: existing.messagesAdded } },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    const sub = await prisma.merchantAiSubscription.findUnique({
      where: { storeId },
      select: { id: true },
    });
    if (!sub) {
      return NextResponse.json({ error: "No AI subscription found" }, { status: 404 });
    }

    await prisma.aiAddonPurchase.create({
      data: {
        storeId,
        subscriptionId: sub.id,
        packType: packId,
        priceKobo: BigInt(Math.max(0, Math.floor(amountKobo))),
        transactionId: reference,
        messagesAdded,
        imagesAdded: 0,
      },
    });

    return NextResponse.json(
      { success: true, data: { applied: true, messagesAdded } },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e: unknown) {
    logger.error("[AI_TOPUP_VERIFY]", e, { storeId });
    return NextResponse.json(
      { error: "Failed to verify AI top-up" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}

export const POST = withVayvaAPI(PERMISSIONS.BILLING_MANAGE, handler);

