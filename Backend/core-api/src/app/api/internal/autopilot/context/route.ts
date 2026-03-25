import { NextRequest, NextResponse } from "next/server";
import { prisma, Prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

/**
 * POST /api/internal/autopilot/context
 * Service-to-service: merge `externalBrief` into Store.settings.autopilot (n8n, cron, etc.).
 * Auth: Authorization: Bearer <AUTOPILOT_INBOUND_SECRET> (or CRON_SECRET if AUTOPILOT_INBOUND_SECRET unset).
 */
export async function POST(req: NextRequest) {
  const secret =
    process.env.AUTOPILOT_INBOUND_SECRET || process.env.CRON_SECRET || "";
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const rec = isRecord(body) ? body : {};
  const storeId = getString(rec.storeId);
  const externalBrief = getString(rec.externalBrief);

  if (!storeId || externalBrief === undefined) {
    return NextResponse.json(
      { error: "storeId and externalBrief are required" },
      { status: 400 },
    );
  }

  const trimmed = externalBrief.slice(0, 8000);

  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { settings: true },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const current = isRecord(store.settings) ? store.settings : {};
    const prevAp = isRecord(current.autopilot) ? current.autopilot : {};
    const nextSettings = {
      ...current,
      autopilot: {
        ...prevAp,
        externalBrief: trimmed,
        externalBriefUpdatedAt: new Date().toISOString(),
      },
    };

    await prisma.store.update({
      where: { id: storeId },
      data: { settings: nextSettings as Prisma.InputJsonValue },
    });

    logger.info("[AutopilotContext] Updated external brief", { storeId });

    return NextResponse.json(
      { ok: true, storeId },
      { headers: standardHeaders("") },
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    logger.error("[AutopilotContext] Failed", { storeId, error: msg });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
