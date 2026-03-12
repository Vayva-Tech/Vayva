import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { prisma, Prisma } from "@vayva/db";
import { NotificationManager } from "@vayva/shared/notifications/manager";
import { logger } from "@vayva/shared";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user } = await OpsAuthService.requireSession();
    (OpsAuthService as any).requireRole(user, "OPS_SUPPORT");

    const { id: storeId } = await params;
    const body = await req.json();

    const reason = typeof body?.reason === "string" ? body.reason.trim() : "";
    const message =
      typeof body?.message === "string" ? body.message.trim() : "";

    if (!reason || reason.length < 10) {
      return NextResponse.json(
        { error: "Reason must be at least 10 characters" },
        { status: 400 },
      );
    }

    if (!message || message.length < 5) {
      return NextResponse.json(
        { error: "Message must be at least 5 characters" },
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
    const prevWarnings = Array.isArray(prevSettings.warnings)
      ? prevSettings.warnings
      : [];

    const warning = {
      id: `warn_${Date.now()}`,
      issuedAt: new Date().toISOString(),
      issuedBy: user.id,
      reason,
      message,
    };

    const nextSettings: Record<string, unknown> = {
      ...prevSettings,
      warnings: [...prevWarnings, warning],
    };

    // Automated restriction triggers
    const totalWarnings = (nextSettings.warnings as unknown[]).length;
    const currentRestrictions = (nextSettings.restrictions as Record<string, boolean>) || {};

    if (totalWarnings >= 3 && !currentRestrictions.productsDisabled) {
      // Auto-restrict products after 3 warnings
      nextSettings.restrictions = {
        ...currentRestrictions,
        productsDisabled: true,
      } as unknown;

      // Log the auto-restriction
      await OpsAuthService.logEvent(user.id, "AUTO_RESTRICT_PRODUCTS", {
        targetType: "Store",
        targetId: storeId,
        storeName: store.name,
        reason: "Automatic restriction after 3 warnings",
        totalWarnings,
      });
    }

    await prisma.store.update({
      where: { id: storeId },
      data: { settings: nextSettings as Prisma.InputJsonValue },
    });

    await OpsAuthService.logEvent(user.id, "ISSUE_WARNING", {
      targetType: "Store",
      targetId: storeId,
      storeName: store.name,
      reason,
      message,
    });

    // Trigger notifications
    try {
      await NotificationManager.trigger(storeId, "WARNING_ISSUED", {
        reason,
      });
    } catch (notifError) {
      logger.error("[ISSUE_WARNING_ERROR]", { error: notifError, storeId });
    }

    if (totalWarnings >= 3 && !currentRestrictions.productsDisabled) {
      try {
        await NotificationManager.trigger(storeId, "RESTRICTION_APPLIED", {
          restriction: "Product operations disabled",
        });
      } catch (notifError) {
      logger.error("[RESTRICTION_NOTIFICATION_ERROR]", { error: notifError, storeId });
      }
    }

    return NextResponse.json({
      success: true,
      warning,
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
        { error: "Insufficient permissions." },
        { status: 403 },
      );
    }

    logger.error("[ISSUE_WARNING_ERROR]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
