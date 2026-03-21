import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { Prisma, prisma } from "@vayva/db";
import { logger } from "@/lib/logger";
import { PayoutCreateSchema } from "@/lib/validations/finance-ops";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (isRecord(error) && typeof error.message === "string")
    return error.message as string;
  return "Failed to request payout";
}

export const GET = withVayvaAPI(
  PERMISSIONS.PAYOUTS_VIEW,
  async (_req, { storeId }) => {
    try {
      const payouts = await prisma.payout.findMany({
        where: { storeId },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      return NextResponse.json(payouts, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    } catch (error: unknown) {
      logger.error("[FINANCE_PAYOUTS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to load payouts" },
        { status: 500 },
      );
    }
  },
);

export const POST = withVayvaAPI(
  PERMISSIONS.PAYOUTS_MANAGE,
  async (req, { storeId, user }) => {
    try {
      const body = await req.json().catch(() => ({}));
      const validation = PayoutCreateSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: validation.error.format(),
          },
          { status: 400 },
        );
      }

      const { amount, currency, bankDetails, instant } = validation.data;

      // Verify wallet balance before processing
      const wallet = await prisma.wallet.findFirst({
        where: { storeId },
      });

      if (!wallet || wallet.balance < amount) {
        return NextResponse.json(
          { error: "Insufficient wallet balance" },
          { status: 400 },
        );
      }

      // Convert bankDetails to InputJsonValue
      const destination = bankDetails as unknown as Prisma.InputJsonValue;

      // Create payout record
      const payout = await prisma.payout.create({
        data: {
          storeId,
          provider: instant ? "PAYSTACK" : "MANUAL",
          providerPayoutId: instant ? `paystack_${Date.now()}` : `manual_${Date.now()}`,
          status: instant ? "PROCESSING" : "PENDING",
          amount,
          currency,
          reference: `payout_${Date.now()}`,
          destination,
          requestedBy: user.id,
        },
      });

      // If instant withdrawal, process via Paystack Transfer API
      if (instant) {
        try {
          // Deduct from wallet immediately
          await prisma.wallet.update({
            where: { id: wallet.id },
            data: { balance: { decrement: amount } },
          });

          // Call Paystack Transfer API
          const paystackResponse = await fetch("https://api.paystack.co/transfer", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              source: "balance",
              amount: amount * 100, // Convert to kobo
              recipient: bankDetails?.recipientCode,
              reason: `Withdrawal - ${payout.reference}`,
            }),
          });

          const paystackData = await paystackResponse.json();

          if (!paystackData.status) {
            throw new Error(paystackData.message || "Paystack transfer failed");
          }

          // Update payout with Paystack response
          await prisma.payout.update({
            where: { id: payout.id },
            data: {
              providerPayoutId: paystackData.data?.transfer_code,
              status: "COMPLETED",
              completedAt: new Date(),
            },
          });

          logger.info("[INSTANT_PAYOUT_SUCCESS]", { 
            payoutId: payout.id, 
            amount, 
            reference: payout.reference,
            storeId 
          });
        } catch (paystackError: unknown) {
          logger.error("[INSTANT_PAYOUT_FAILED]", paystackError, { storeId });
          
          // Rollback wallet balance
          await prisma.wallet.update({
            where: { id: wallet.id },
            data: { balance: { increment: amount } },
          });

          // Mark payout as failed
          await prisma.payout.update({
            where: { id: payout.id },
            data: { status: "FAILED" },
          });

          return NextResponse.json(
            { 
              error: "Instant transfer failed. Please try again or use standard withdrawal.",
              details: paystackError instanceof Error ? paystackError.message : "Unknown error"
            },
            { status: 500 },
          );
        }
      }

      return NextResponse.json({ ...payout, instant });
    } catch (error: unknown) {
      logger.error("[FINANCE_PAYOUTS_POST]", error, { storeId });
      return NextResponse.json(
        { error: getErrorMessage(error) },
        { status: 500 },
      );
    }
  },
);
