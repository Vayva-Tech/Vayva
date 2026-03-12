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
    (OpsAuthService as any).requireRole(user, "OPS_SUPPORT");

    const { id: storeId } = await params;
    const body = await req.json();

    const reason = typeof body?.reason === "string" ? body.reason.trim() : "";
    const message =
      typeof body?.message === "string" ? body.message.trim() : "";
    const channel =
      typeof body?.channel === "string" ? body.channel.trim() : "";
    const severity =
      typeof body?.severity === "string" ? body.severity.trim() : "MEDIUM";
    const customerEmail =
      typeof body?.customerEmail === "string" ? body.customerEmail.trim() : "";
    const customerPhone =
      typeof body?.customerPhone === "string" ? body.customerPhone.trim() : "";
    const evidenceUrls = Array.isArray(body?.evidenceUrls)
      ? body.evidenceUrls
      : [];

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
    const prevAppeals = Array.isArray(prevSettings.appeals)
      ? prevSettings.appeals
      : [];

    const appealId = `appeal_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const nowIso = new Date().toISOString();

    const appeal = {
      id: appealId,
      status: "OPEN",
      createdAt: nowIso,
      createdBy: user.id,
      severity,
      channel: channel || undefined,
      reason,
      message,
      customerEmail: customerEmail || undefined,
      customerPhone: customerPhone || undefined,
      evidenceUrls,
      history: [
        {
          at: nowIso,
          by: user.id,
          type: "OPEN",
          status: "OPEN",
          notes: message,
        },
      ],
    };

    const nextSettings = {
      ...prevSettings,
      appeals: [...prevAppeals, appeal],
    };

    await prisma.store.update({
      where: { id: storeId },
      data: { settings: nextSettings },
    });

    await OpsAuthService.logEvent(user.id, "OPEN_APPEAL_CASE", {
      targetType: "Store",
      targetId: storeId,
      storeName: store.name,
      appealId,
      severity,
      channel: channel || undefined,
      reason,
    });

    return NextResponse.json({ success: true, appeal });
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

    logger.error("[OPEN_APPEAL_CASE_ERROR]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
