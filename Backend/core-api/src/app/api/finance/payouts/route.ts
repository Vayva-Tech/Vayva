import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { Prisma, prisma } from "@vayva/db";
import { logger } from "@/lib/logger";
import { PayoutCreateSchema } from "@/lib/validations/finance-ops";
import { Paystack } from "@vayva/payments";
import _crypto from "crypto";

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
  async (req, { storeId, _user }) => {
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
      const amountKobo = BigInt(Math.round(Number(amount) * 100));
      if (amountKobo <= 0n) {
        return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
      }

      // This endpoint is used for affiliate payouts (paid from the store wallet).
      // Reserve funds by moving available -> pending, then settle via Paystack webhook.
      const wallet = await prisma.wallet.findUnique({ where: { storeId } });
      if (!wallet || wallet.availableKobo < amountKobo) {
        return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 });
      }

      // Convert bankDetails to InputJsonValue
      const destination = bankDetails as unknown as Prisma.InputJsonValue;

      const payout = await prisma.$transaction(async (tx) => {
        if (instant) {
          await tx.wallet.update({
            where: { storeId },
            data: {
              availableKobo: { decrement: amountKobo },
              pendingKobo: { increment: amountKobo },
            },
          });
        }

        const created = await tx.payout.create({
          data: {
            storeId,
            provider: instant ? "paystack" : "manual",
            providerPayoutId: instant ? `pending_${Date.now()}` : `manual_${Date.now()}`,
            status: "PENDING",
            amount,
            currency,
            // Webhook handler expects this prefix for affiliate settlements.
            reference: null,
            destination,
            // Note: Payout model in db does not include requestedBy; keep destination metadata for audit.
          },
        });

        // Make reference deterministic and webhook-parseable.
        return await tx.payout.update({
          where: { id: created.id },
          data: { reference: `AFF-PAYOUT-${created.id}` },
        });
      });

      // If instant withdrawal, process via Paystack Transfer API
      if (instant) {
        try {
          const recipientCode =
            typeof bankDetails.recipientCode === "string" && bankDetails.recipientCode
              ? bankDetails.recipientCode
              : (
                  await Paystack.createTransferRecipient({
                    name: bankDetails.accountName,
                    accountNumber: bankDetails.accountNumber,
                    bankCode: bankDetails.bankCode,
                  })
                ).recipientCode;

          const transfer = await Paystack.initiateTransfer({
            amountKobo: Number(amountKobo),
            recipientCode,
            reference: payout.reference || `AFF-PAYOUT-${payout.id}`,
            reason: `Affiliate payout - ${payout.id}`,
          });

          const transferCode =
            typeof (transfer as any)?.transferCode === "string"
              ? (transfer as any).transferCode
              : `paystack_${Date.now()}`;

          await prisma.payout.update({
            where: { id: payout.id },
            data: {
              providerPayoutId: transferCode,
              provider: "paystack",
              status: "PENDING",
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
          
          // Rollback reserved funds
          await prisma.wallet.update({
            where: { storeId },
            data: {
              pendingKobo: { decrement: amountKobo },
              availableKobo: { increment: amountKobo },
            },
          });

          // Mark payout as failed
          await prisma.payout.update({
            where: { id: payout.id },
            data: { status: "FAILED", provider: "paystack" },
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
