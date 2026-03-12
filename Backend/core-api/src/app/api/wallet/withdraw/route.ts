import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { Paystack } from "@vayva/payments";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

function toDecimalFromKobo(kobo: bigint | number): number {
  const n = typeof kobo === "number" ? Math.trunc(kobo) : Number(kobo);
  return Math.round(n) / 100;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getObject(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

async function initiateTransferIfNeeded(withdrawalId: string) {
  const w = await prisma.withdrawal.findUnique({ where: { id: withdrawalId } });
  if (!w) return;
  if (String(w.status).toUpperCase() !== "PROCESSING") return;

  const bank = w.bankAccountId
    ? await prisma.bankBeneficiary.findFirst({
        where: { id: w.bankAccountId, storeId: w.storeId },
      })
    : await prisma.bankBeneficiary.findFirst({
        where: { storeId: w.storeId, isDefault: true },
      });
  if (!bank) return;

  try {
    const recipient = await Paystack.createTransferRecipient({
      name: bank.accountName,
      accountNumber: bank.accountNumber,
      bankCode: bank.bankCode,
    });

    const recipientData = getObject(recipient);
    const recipientCode = getString(recipientData.recipientCode);
    if (!recipientCode) return;

    const t = await Paystack.initiateTransfer({
      amountKobo: Number(w.amountNetKobo),
      recipientCode,
      reference: w.referenceCode,
      reason: "Merchant payout",
    });

    const transferData = getObject(t);
    const providerRef =
      getString(transferData.transferCode) ||
      getString(transferData.status) ||
      "initiated";

    await prisma.withdrawal.update({
      where: { id: w.id },
      data: { providerRef },
    });
  } catch (err) {
    await prisma.$transaction(async (tx) => {
      await tx.withdrawal.update({
        where: { id: w.id },
        data: { status: "FAILED" },
      });
      await tx.wallet.update({
        where: { storeId: w.storeId },
        data: {
          pendingKobo: { decrement: w.amountKobo },
          availableKobo: { increment: w.amountKobo },
        },
      });
      await tx.ledgerEntry.create({
        data: {
          storeId: w.storeId,
          referenceType: "PAYOUT",
          referenceId: w.id,
          direction: "CREDIT",
          account: "WALLET_CASH",
          amount: toDecimalFromKobo(Number(w.amountKobo)),
          currency: "NGN",
          description: "Withdrawal failed - funds released",
          metadata: { error: err instanceof Error ? err.message : String(err) },
        },
      });
    });
  }
}

export const POST = withVayvaAPI(
  PERMISSIONS.PAYOUTS_MANAGE,
  async (req, { storeId, user }) => {
    const correlationId = crypto.randomUUID();
    try {
      const body = getObject(await req.json().catch(() => ({})));
      const key = (
        req.headers.get("Idempotency-Key") ||
        getString(body.idempotencyKey) ||
        ""
      ).toString();
      const amountKoboRaw = body.amountKobo;
      const bankAccountId = getString(body.bankAccountId) || "";

      const amountKobo = Number(amountKoboRaw);
      if (!Number.isFinite(amountKobo) || amountKobo <= 0) {
        return NextResponse.json(
          { error: "Invalid amount", correlationId },
          { status: 400, headers: { "Cache-Control": "no-store" } },
        );
      }
      if (!bankAccountId) {
        return NextResponse.json(
          { error: "bankAccountId required", correlationId },
          { status: 400, headers: { "Cache-Control": "no-store" } },
        );
      }
      if (!key) {
        return NextResponse.json(
          { error: "Idempotency key required", correlationId },
          { status: 400, headers: { "Cache-Control": "no-store" } },
        );
      }

      const referenceCode = `payout_${storeId}_${key}`;

      const existing = await prisma.withdrawal.findFirst({
        where: { storeId, referenceCode },
      });
      if (existing) {
        return NextResponse.json(
          { payoutId: existing.id, status: existing.status, correlationId },
          { headers: { "Cache-Control": "no-store" } },
        );
      }

      const created = await prisma.$transaction(async (tx) => {
        const bank = await tx.bankBeneficiary.findFirst({
          where: { id: bankAccountId, storeId },
        });
        if (!bank) throw new Error("Bank account not found");

        const wallet = await tx.wallet.findUnique({ where: { storeId } });
        if (!wallet) throw new Error("Wallet not found");

        const feeKobo = BigInt(0);
        const netKobo = BigInt(Math.trunc(amountKobo)) - feeKobo;
        if (netKobo <= 0) throw new Error("Amount too low after fees");

        if (wallet.availableKobo < BigInt(Math.trunc(amountKobo)))
          throw new Error("Insufficient balance");

        await tx.wallet.update({
          where: { storeId },
          data: {
            availableKobo: { decrement: BigInt(Math.trunc(amountKobo)) },
            pendingKobo: { increment: BigInt(Math.trunc(amountKobo)) },
          },
        });

        const w = await tx.withdrawal.create({
          data: {
            storeId,
            requestedByUserId: user.id,
            amountKobo: BigInt(Math.trunc(amountKobo)),
            feeKobo,
            amountNetKobo: netKobo,
            bankAccountId: bank.id,
            status: "PROCESSING",
            referenceCode,
          },
        });

        await tx.ledgerEntry.create({
          data: {
            storeId,
            referenceType: "PAYOUT",
            referenceId: w.id,
            direction: "DEBIT",
            account: "WALLET_CASH",
            amount: toDecimalFromKobo(Math.trunc(amountKobo)),
            currency: "NGN",
            description: "Withdrawal reserved",
            metadata: { referenceCode },
          },
        });

        return w;
      });

      initiateTransferIfNeeded(created.id).catch(() => {});

      return NextResponse.json(
        { payoutId: created.id, status: created.status, correlationId },
        { headers: { "Cache-Control": "no-store" } },
      );
    } catch (err: unknown) {
      logger.error("[WALLET_WITHDRAW_POST]", err, { storeId, correlationId });
      return NextResponse.json(
        {
          error: err instanceof Error ? err.message : "Withdrawal failed",
          correlationId,
        },
        { status: 500, headers: { "Cache-Control": "no-store" } },
      );
    }
  },
);
