import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { prisma } from "@vayva/db";

export async function GET(_req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();

    // Fetch latest active announcement
    const latestInfo = await prisma.opsAuditEvent.findFirst({
      where: {
        eventType: "OPS_GLOBAL_ANNOUNCEMENT",
      },
      orderBy: { createdAt: "desc" },
      take: 1,
    });

    if (!latestInfo || !latestInfo.metadata) {
      return NextResponse.json({ announcement: null });
    }

    // Check if "deleted" (we will model delete as posting an empty announcement or active:false)
    const announcement = latestInfo.metadata as Record<string, unknown>;
    if (!announcement.active) {
      return NextResponse.json({ announcement: null });
    }

    return NextResponse.json({ announcement });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch announcement" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();
    if (!["OPS_OWNER", "OPS_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { message, color, active } = body;

    // "Store" config by logging it as an event.
    // This is a hacky but effective way to persist simple config without a new table.
    await OpsAuthService.logEvent(user.id, "OPS_GLOBAL_ANNOUNCEMENT", {
      message,
      color: color || "indigo",
      active: active ?? true,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to set announcement" },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();
    if (!["OPS_OWNER", "OPS_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Soft delete by posting inactive state
    await OpsAuthService.logEvent(user.id, "OPS_GLOBAL_ANNOUNCEMENT", {
      active: false,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
