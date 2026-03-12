import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

export const dynamic = "force-dynamic";

/**
 * POST /api/ops/merchants/[id]/wallet/lock
 * Lock or unlock a merchant's wallet
 * Requires: ADMIN role (sensitive financial operation)
 * Body: { locked: boolean, reason: string }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user } = await OpsAuthService.requireSession();
    (OpsAuthService as any).requireRole(user, "ADMIN");

    const { id: storeId } = await params;
    const body = await req.json().catch(() => ({}));
    const { locked, reason } = body;

    if (typeof locked !== "boolean") {
      return NextResponse.json(
        { error: "locked (boolean) is required" },
        { status: 400 },
      );
    }

    if (!reason || reason.trim().length < 5) {
      return NextResponse.json(
        { error: "Reason is required (min 5 characters)" },
        { status: 400 },
      );
    }

    // Fetch the store and wallet
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        wallet: true,
      },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    if (!store.wallet) {
      return NextResponse.json(
        { error: "Store has no wallet" },
        { status: 404 },
      );
    }

    const wallet = store.wallet;
    const previousStatus = wallet.isLocked ? "frozen" : "active";

    // Determine new status based on lock action
    const newStatus = locked ? "frozen" : "active";

    // Prevent redundant operations
    if (wallet.isLocked === locked) {
      return NextResponse.json(
        {
          error: `Wallet already ${newStatus}`,
          message: `The wallet is already ${locked ? "locked" : "unlocked"}`,
        },
        { status: 409 },
      );
    }

    // Update wallet lock status
    const updatedWallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        isLocked: locked,
        lockedUntil: locked ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null, // 1 year if locked
      },
    });

    // Create audit log entry
    await OpsAuthService.logEvent(
      user.id,
      locked ? "WALLET_LOCK" : "WALLET_UNLOCK",
      {
        targetType: "Wallet",
        targetId: wallet.id,
        storeId,
        storeName: store.name,
        previousStatus,
        newStatus,
        reason,
        balanceKobo: wallet.availableKobo,
      },
    );

    logger.info(`[WALLET_${locked ? "LOCK" : "UNLOCK"}]`, {
      walletId: wallet.id,
      storeId,
      storeName: store.name,
      previousStatus,
      newStatus,
      operatorId: user.id,
      operatorEmail: user.email,
      reason,
    });

    return NextResponse.json({
      success: true,
      message: `Wallet ${locked ? "locked" : "unlocked"} successfully`,
      data: {
        walletId: wallet.id,
        storeId,
        storeName: store.name,
        previousStatus,
        status: newStatus,
        balanceKobo: wallet.availableKobo,
        isLocked: updatedWallet.isLocked,
        locked,
        reason,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (errorMessage?.includes("Insufficient permissions")) {
      return NextResponse.json(
        { error: "Insufficient permissions - ADMIN required" },
        { status: 403 },
      );
    }
    logger.error("[WALLET_LOCK_ERROR]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
