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

    // Only OPS_OWNER and OPS_ADMIN can suspend accounts
    if (!["OPS_OWNER", "OPS_ADMIN"].includes(user.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions. Admin role required." },
        { status: 403 },
      );
    }

    const { id: storeId } = await params;
    const { reason } = await req.json();

    // Validate reason
    if (!reason || reason.trim().length < 10) {
      return NextResponse.json(
        { error: "Reason must be at least 10 characters" },
        { status: 400 },
      );
    }

    // Check if store exists
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { id: true, name: true, isActive: true, isLive: true },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Check if already suspended
    if (!store.isActive) {
      return NextResponse.json(
        { error: "Store is already suspended" },
        { status: 400 },
      );
    }

    // Suspend the store (set isActive to false, isLive to false)
    await prisma.store.update({
      where: { id: storeId },
      data: {
        isActive: false,
        isLive: false,
      },
    });

    // Create audit log
    await OpsAuthService.logEvent(user.id, "SUSPEND_STORE", {
      targetType: "Store",
      targetId: storeId,
      reason: reason.trim(),
      storeName: store.name,
      previousState: { isActive: true, isLive: store.isLive },
      newState: { isActive: false, isLive: false },
    });

    return NextResponse.json({
      success: true,
      message: "Store suspended successfully",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    if (
      error instanceof Error ? error.message : String(error) === "Unauthorized"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("[SUSPEND_STORE_ERROR]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
