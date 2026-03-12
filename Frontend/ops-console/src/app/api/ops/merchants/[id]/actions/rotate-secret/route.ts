import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";
import crypto from "crypto";
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
    const { id: storeId } = await params;

    // Generate new webhook secret
    const newSecret = `whsec_${crypto.randomBytes(32).toString("hex")}`;

    // Update store settings with new secret
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { settings: true, name: true },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const currentSettings = (store.settings as Record<string, unknown>) || {};

    await prisma.store.update({
      where: { id: storeId },
      data: {
        settings: {
          ...currentSettings,
          webhookSecret: newSecret,
          webhookSecretRotatedAt: new Date().toISOString(),
        },
      },
    });

    await OpsAuthService.logEvent(user.id, "ROTATE_WEBHOOK_SECRET", {
      storeId,
      storeName: store.name,
    });

    return NextResponse.json({
      success: true,
      message: "Webhook secret rotated successfully",
      secretPreview: `${newSecret.slice(0, 12)}...`,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    logger.error("[ROTATE_SECRET_ERROR]", { error });
    return NextResponse.json(
      { error: "Failed to rotate secret" },
      { status: 500 },
    );
  }
}
