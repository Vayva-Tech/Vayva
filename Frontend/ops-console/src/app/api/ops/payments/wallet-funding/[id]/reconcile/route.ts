import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

export const dynamic = "force-dynamic";

/**
 * POST /api/ops/payments/wallet-funding/[id]/reconcile
 * Manually reconcile/credit a wallet via ledger entry
 * Requires: ADMIN role (sensitive financial operation)
 * Body: { reason: string, amountKobo: number }
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
    const { reason, amountKobo } = body;

    if (!reason || reason.trim().length < 10) {
      return NextResponse.json(
        { error: "Reason is required (min 10 characters)" },
        { status: 400 },
      );
    }

    if (!amountKobo || typeof amountKobo !== "number" || amountKobo <= 0) {
      return NextResponse.json(
        { error: "Valid amountKobo (positive number) is required" },
        { status: 400 },
      );
    }

    // Get store and wallet
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { wallet: true },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 },
      );
    }

    if (!store.wallet) {
      return NextResponse.json(
        { error: "Store has no wallet" },
        { status: 404 },
      );
    }

    const wallet = store.wallet;

    // Check if wallet is locked
    if (wallet.isLocked) {
      return NextResponse.json(
        { error: "Wallet is locked - cannot reconcile" },
        { status: 409 },
      );
    }

    // Perform reconciliation as a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          availableKobo: { increment: BigInt(amountKobo) },
        },
      });

      // Create ledger entry for audit trail
      const ledgerEntry = await tx.ledgerEntry.create({
        data: {
          storeId,
          referenceType: "MANUAL_RECONCILE",
          referenceId: `manual-${Date.now()}`,
          direction: "CREDIT",
          account: "WALLET",
          amount: amountKobo / 100, // Convert kobo to naira for ledger
          currency: "NGN",
          description: `Manual reconciliation: ${reason}`,
          metadata: {
            operatorId: user.id,
            operatorEmail: user.email,
            previousBalanceKobo: wallet.availableKobo.toString(),
            newBalanceKobo: updatedWallet.availableKobo.toString(),
          },
        },
      });

      return { updatedWallet, ledgerEntry };
    });

    // Log the reconciliation
    logger.info("[WALLET_MANUAL_RECONCILE]", {
      storeId,
      storeName: store.name,
      walletId: wallet.id,
      amountKobo,
      operatorId: user.id,
      operatorEmail: user.email,
      reason,
      previousBalanceKobo: wallet.availableKobo.toString(),
      newBalanceKobo: result.updatedWallet.availableKobo.toString(),
      ledgerEntryId: result.ledgerEntry.id,
    });

    // Create audit log
    await OpsAuthService.logEvent(user.id, "WALLET_MANUAL_RECONCILE", {
      targetType: "Wallet",
      targetId: wallet.id,
      storeId,
      storeName: store.name,
      amountKobo,
      reason,
      previousBalanceKobo: wallet.availableKobo.toString(),
      newBalanceKobo: result.updatedWallet.availableKobo.toString(),
    });

    return NextResponse.json({
      success: true,
      message: "Wallet reconciled successfully",
      data: {
        storeId,
        storeName: store.name,
        walletId: wallet.id,
        amountKobo,
        previousBalanceKobo: wallet.availableKobo.toString(),
        newBalanceKobo: result.updatedWallet.availableKobo.toString(),
        ledgerEntryId: result.ledgerEntry.id,
        reason,
        reconciledBy: {
          id: user.id,
          email: user.email,
        },
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
    logger.error("[WALLET_MANUAL_RECONCILE_ERROR]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
