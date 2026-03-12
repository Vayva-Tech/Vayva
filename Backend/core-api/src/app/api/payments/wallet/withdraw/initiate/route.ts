import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { NotificationService } from "@vayva/ai-agent";
import { logger } from "@/lib/logger";
import crypto from "crypto";

export const POST = withVayvaAPI(
  PERMISSIONS.PAYMENTS_MANAGE,
  async (req, { db, storeId, user }) => {
    try {
      const body = await req.json();
      const { amount, bankAccountId, _description } = body;

      const amountKobo = BigInt(Math.round(Number(amount) * 100)); // Convert Naira to Kobo

      if (amountKobo <= 0) {
        return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
      }

      // 1. Check Wallet Balance
      const wallet = await db.wallet.findUnique({ where: { storeId } });
      if (!wallet || wallet.availableKobo < amountKobo) {
        return NextResponse.json(
          { error: "Insufficient funds" },
          { status: 400 },
        );
      }

      if (wallet.isLocked) {
        return NextResponse.json(
          { error: "Wallet is locked" },
          { status: 403 },
        );
      }

      // 2. Generate Reference & OTP
      const referenceCode = `WDR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const otpCode = crypto.randomInt(100000, 999999).toString();

      // 3. Create Withdrawal Request
      const withdrawal = await db.withdrawal.create({
        data: {
          storeId,
          requestedByUserId: user.id,
          amountKobo,
          bankAccountId,
          referenceCode,
          status: "PENDING", // Custom status for flow
          otpCode,
          otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
        },
      });

      // 4. Send OTP via email
      try {
        await NotificationService.queueEmail({
          to: user.email,
          template: "withdrawal_otp",
          data: {
            otpCode,
            expiresIn: "10 minutes",
            amount: (Number(amountKobo) / 100).toFixed(2),
            referenceCode,
          },
        });
      } catch (error) {
        logger.error("[WITHDRAWAL_OTP_SEND_FAILED]", error, { storeId, userId: user.id });
        return NextResponse.json(
          { error: "Failed to send OTP. Please try again." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        withdrawalId: withdrawal.id,
        message: "OTP sent to your email",
      });
    } catch {
      return NextResponse.json(
        { error: "Failed to initiate withdrawal" },
        { status: 500 },
      );
    }
  },
);
