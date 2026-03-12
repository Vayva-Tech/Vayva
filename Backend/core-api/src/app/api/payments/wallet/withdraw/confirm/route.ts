import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { calculateWithdrawalFee } from "@/config/pricing";

export const POST = withVayvaAPI(
  PERMISSIONS.PAYMENTS_MANAGE,
  async (req, { db, storeId }) => {
    try {
      const body = await req.json();
      const { withdrawalId, otpCode } = body;

      const withdrawal = await db.withdrawal.findUnique({
        where: { id: withdrawalId },
      });

      if (!withdrawal || withdrawal.storeId !== storeId) {
        return NextResponse.json(
          { error: "Withdrawal request not found" },
          { status: 404 },
        );
      }

      if (withdrawal.status !== "PENDING") {
        return NextResponse.json(
          { error: "Invalid withdrawal status" },
          { status: 400 },
        );
      }

      if (
        withdrawal.otpCode !== otpCode ||
        (withdrawal.otpExpiresAt && withdrawal.otpExpiresAt < new Date())
      ) {
        return NextResponse.json(
          { error: "Invalid or expired OTP" },
          { status: 400 },
        );
      }

      // Calculate fee based on configured percentage
      const amountKobo = BigInt(withdrawal.amountKobo);
      const feeNaira = calculateWithdrawalFee(Number(amountKobo) / 100);
      const feeKobo = BigInt(Math.round(feeNaira * 100));
      const netKobo = amountKobo > feeKobo ? amountKobo - feeKobo : BigInt(0);

      // Transactional update: Deduct balance, Update Withdrawal
      await db.$transaction(async (tx: any) => {
        // Re-check balance lock
        const wallet = await tx.wallet.findUnique({ where: { storeId } });
        if (wallet.availableKobo < amountKobo) {
          throw new Error("Insufficient funds during processing");
        }

        // Deduct funds
        await tx.wallet.update({
          where: { storeId },
          data: {
            availableKobo: { decrement: amountKobo },
          },
        });

        // Update Withdrawal
        await tx.withdrawal.update({
          where: { id: withdrawalId },
          data: {
            status: "PENDING",
            otpCode: null, // Clear OTP
            feeKobo,
            amountNetKobo: netKobo,
          },
        });

        // Create Ledger Entry
        await tx.ledgerEntry.create({
          data: {
            storeId,
            referenceType: "WITHDRAWAL",
            referenceId: withdrawal.id,
            direction: "DEBIT",
            account: "WALLET",
            amount: Number(amountKobo) / 100, // Convert to decimal for ledger
            currency: "NGN",
            description: `Withdrawal to bank account`,
            metadata: { withdrawalId: withdrawal.id },
          },
        });
      });

      return NextResponse.json({
        success: true,
        message: "Withdrawal queued successfully",
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json(
        { error: msg || "Failed to confirm withdrawal" },
        { status: 500 },
      );
    }
  },
);
