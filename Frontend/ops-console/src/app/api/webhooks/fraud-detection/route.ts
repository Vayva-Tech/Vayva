import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";
import { NotificationManager } from "@vayva/shared/notifications/manager";

export const dynamic = "force-dynamic";

/**
 * POST /api/webhooks/fraud-detection
 * Webhook endpoint for external fraud detection services
 * Automatically applies restrictions based on fraud alerts
 */
export async function POST(req: NextRequest) {
  try {
    // Basic auth check - in production, use API key validation
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = authHeader.substring(7);
    const expectedKey = process.env.FRAUD_WEBHOOK_SECRET;
    if (!expectedKey || apiKey !== expectedKey) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 403 });
    }

    const body = await req.json();
    const { storeId, reason, riskLevel, evidence } = body;

    if (!storeId || !reason) {
      return NextResponse.json(
        { error: "storeId and reason required" },
        { status: 400 },
      );
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { id: true, name: true, settings: true },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const prevSettings = (store.settings as Record<string, unknown>) || {};
    const currentRestrictions = prevSettings.restrictions || {};

    // Apply restrictions based on risk level
    let newRestrictions = { ...currentRestrictions };
    if (riskLevel === "HIGH") {
      // High risk: restrict all operations
      newRestrictions = {
        ...currentRestrictions,
        ordersDisabled: true,
        productsDisabled: true,
        marketingDisabled: true,
        settingsEditsDisabled: true,
        salesDisabled: true,
        paymentsDisabled: true,
        uploadsDisabled: true,
        aiDisabled: true,
      };
    } else if (riskLevel === "MEDIUM") {
      // Medium risk: restrict financial operations
      newRestrictions = {
        ...currentRestrictions,
        paymentsDisabled: true,
        ordersDisabled: true,
      };
    }

    const nextSettings = {
      ...prevSettings,
      restrictions: newRestrictions,
    };

    await prisma.store.update({
      where: { id: storeId },
      data: { settings: nextSettings },
    });

    // Log the event
    await OpsAuthService.logEvent("SYSTEM", "AUTO_RESTRICT_FRAUD", {
      targetType: "Store",
      targetId: storeId,
      storeName: store.name,
      reason,
      riskLevel,
      evidence: evidence || undefined,
    });

    // Notify merchant
    try {
      await NotificationManager.trigger(storeId, "RESTRICTION_APPLIED", {
        restriction: `Account restricted due to fraud alert: ${reason}`,
      });
    } catch (notifError) {
      console.error(
        "Failed to send fraud restriction notification:",
        notifError,
      );
    }

    return NextResponse.json({
      success: true,
      message: "Fraud alert processed and restrictions applied",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    console.error("Fraud detection webhook error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
