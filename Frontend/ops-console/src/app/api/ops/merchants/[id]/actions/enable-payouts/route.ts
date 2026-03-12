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
    // Require authentication and SUPERVISOR role
    const { user } = await OpsAuthService.requireSession();
    (OpsAuthService as any).requireRole(user, "SUPERVISOR");

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
      select: { id: true, name: true, payoutsEnabled: true },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Check if already enabled
    if (store.payoutsEnabled) {
      return NextResponse.json(
        { error: "Payouts are already enabled for this store" },
        { status: 400 },
      );
    }

    // Enable payouts
    await prisma.store.update({
      where: { id: storeId },
      data: { payoutsEnabled: true },
    });

    // Create audit log
    // Create audit log
    await OpsAuthService.logEvent(user.id, "ENABLE_PAYOUTS", {
      targetType: "Store",
      targetId: storeId,
      reason: reason.trim(),
      storeName: store.name,
      previousState: { payoutsEnabled: false },
      newState: { payoutsEnabled: true },
    });

    return NextResponse.json({
      success: true,
      message: "Payouts enabled successfully",
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
        { error: "Insufficient permissions. SUPERVISOR role required." },
        { status: 403 },
      );
    }
    logger.error("[ENABLE_PAYOUTS_ERROR]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
