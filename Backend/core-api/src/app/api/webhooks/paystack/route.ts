import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { prisma, WebhookEventStatus, type Prisma } from "@vayva/db";
import crypto from "crypto";

function safeString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function safeNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function verifyPaystackSignature(args: {
  rawBody: string;
  signature: string;
  secretKey: string;
}): boolean {
  const { rawBody, signature, secretKey } = args;
  if (!signature || !secretKey) return false;
  const computed = crypto
    .createHmac("sha512", secretKey)
    .update(rawBody)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(computed, "utf8"),
      Buffer.from(signature, "utf8"),
    );
  } catch {
    return false;
  }
}

function extractDedicatedAccountNumber(payload: Record<string, unknown>): string {
  const data = payload.data;
  if (!data || typeof data !== "object") return "";

  const dataRecord = data as Record<string, unknown>;
  const authorization = dataRecord.authorization;
  if (authorization && typeof authorization === "object") {
    const authRecord = authorization as Record<string, unknown>;
    const accountNumber = safeString(authRecord.account_number);
    if (accountNumber) return accountNumber;

    const receiverAccountNumber = safeString(
      authRecord.receiver_bank_account_number,
    );
    if (receiverAccountNumber) return receiverAccountNumber;
  }

  const account = dataRecord.account;
  if (account && typeof account === "object") {
    const accountRecord = account as Record<string, unknown>;
    const number = safeString(accountRecord.number);
    if (number) return number;
  }

  return "";
}

/**
 * Paystack Webhook Handler (Asynchronous)
 * Purely responsible for verification, persistence, and hand-off to background worker.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature") || "";

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      logger.error("[PAYSTACK_WEBHOOK] PAYSTACK_SECRET_KEY not configured", {});
      return NextResponse.json({ received: true }, { status: 200 });
    }
    const isValidSignature = verifyPaystackSignature({
      rawBody,
      signature,
      secretKey,
    });

    if (!isValidSignature) {
      logger.warn("[PAYSTACK_WEBHOOK] Invalid signature");
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const payload = JSON.parse(rawBody) as Record<string, unknown>;
    const payloadJson = payload as unknown as Prisma.InputJsonValue;
    const eventType = safeString(payload.event);
    const data = payload.data;

    const dataRecord =
      data && typeof data === "object" ? (data as Record<string, unknown>) : null;

    // Handle transfer events (for affiliate payouts and wallet withdrawals)
    if (eventType.startsWith("transfer.")) {
      const reference = safeString(dataRecord?.reference);
      const transferCode = safeString(dataRecord?.transfer_code);
      
      // Handle affiliate payout transfers
      if (reference.startsWith("AFF-PAYOUT-")) {
        await prisma.paymentWebhookEvent.create({
          data: {
            provider: "paystack",
            providerEventId: reference || transferCode || crypto.randomUUID(),
            eventType,
            payload: payload as unknown as Prisma.InputJsonValue,
            status: "PROCESSED" as WebhookEventStatus,
          },
        });
        
        return NextResponse.json({ received: true }, { status: 200 });
      }
      
      // Handle wallet withdrawal transfers
      if (reference.startsWith("WALLET-WITHDRAW-")) {
        const withdrawIdMatch = reference.match(/WALLET-WITHDRAW-(.+)/);
        if (withdrawIdMatch) {
          const withdrawalId = withdrawIdMatch[1];
          
          switch (eventType) {
            case "transfer.success":
              await prisma.withdrawal.update({
                where: { id: withdrawalId },
                data: {
                  status: "COMPLETED",
                  providerRef: transferCode,
                },
              });
              logger.info(`[Paystack Webhook] Wallet withdrawal ${withdrawalId} completed`);
              break;
            
            case "transfer.failed":
              await prisma.withdrawal.update({
                where: { id: withdrawalId },
                data: {
                  status: "FAILED",
                  providerRef: transferCode,
                },
              });
              break;
          }
        }
        
        await prisma.paymentWebhookEvent.create({
          data: {
            provider: "paystack",
            providerEventId: reference || transferCode || crypto.randomUUID(),
            eventType,
            payload: payload as unknown as Prisma.InputJsonValue,
            status: "PROCESSED" as WebhookEventStatus,
          },
        });
        
        return NextResponse.json({ received: true }, { status: 200 });
      }
    }

    const providerEventId =
      safeString(dataRecord?.id) ||
      safeString(dataRecord?.reference) ||
      crypto.createHash("sha256").update(rawBody).digest("hex");

    const providerReference = safeString(dataRecord?.reference);

    // Create webhook event record (idempotent by unique constraint)
    const existing = await prisma.paymentWebhookEvent.findUnique({
      where: {
        provider_providerEventId: {
          provider: "paystack",
          providerEventId,
        },
      },
      select: { id: true, status: true, storeId: true },
    });

    if (existing) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // We only credit wallet for successful charges paid into a dedicated account.
    const status = safeString(dataRecord?.status);
    if (eventType !== "charge.success" || status !== "success") {
      await prisma.paymentWebhookEvent.create({
        data: {
          provider: "paystack",
          providerEventId,
          eventType: eventType || "unknown",
          payload: payloadJson,
          status: "IGNORED" as WebhookEventStatus,
        },
      });
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const accountNumber = extractDedicatedAccountNumber(payload);
    if (!accountNumber) {
      await prisma.paymentWebhookEvent.create({
        data: {
          provider: "paystack",
          providerEventId,
          eventType,
          payload: payloadJson,
          status: "IGNORED_NO_ACCOUNT_NUMBER" as WebhookEventStatus,
        },
      });
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const wallet = await prisma.wallet.findFirst({
      where: { vaAccountNumber: accountNumber },
      select: { id: true, storeId: true },
    });

    if (!wallet) {
      await prisma.paymentWebhookEvent.create({
        data: {
          provider: "paystack",
          providerEventId,
          eventType,
          payload: payloadJson,
          status: "IGNORED_UNKNOWN_ACCOUNT" as WebhookEventStatus,
        },
      });
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const amountKobo = safeNumber(dataRecord?.amount);
    if (!amountKobo || amountKobo <= 0) {
      await prisma.paymentWebhookEvent.create({
        data: {
          provider: "paystack",
          providerEventId,
          eventType,
          payload: payloadJson,
          status: "ERROR_INVALID_AMOUNT" as WebhookEventStatus,
          storeId: wallet.storeId,
        },
      });
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const amountNgn = amountKobo / 100;
    const txReference = providerReference || `paystack-${providerEventId}`;

    await prisma.$transaction(async (tx) => {
      // Persist event first (locks idempotency at DB level)
      await tx.paymentWebhookEvent.create({
        data: {
          provider: "paystack",
          providerEventId,
          eventType,
          payload: payloadJson,
          status: "PROCESSING",
          storeId: wallet.storeId,
        },
      });

      // If we already have a transaction with this reference, treat it as processed.
      const existingTx = await tx.paymentTransaction.findUnique({
        where: { reference: txReference },
        select: { id: true },
      });

      if (existingTx) {
        await tx.paymentWebhookEvent.update({
          where: {
            provider_providerEventId: { provider: "paystack", providerEventId },
          },
          data: { status: "PROCESSED", processedAt: new Date() },
        });
        return;
      }

      await tx.paymentTransaction.create({
        data: {
          storeId: wallet.storeId,
          reference: txReference,
          provider: "paystack",
          amount: amountNgn,
          currency: safeString(dataRecord?.currency) || "NGN",
          status: "SUCCESS",
          type: "WALLET_FUNDING",
          metadata: {
            event: eventType,
            providerEventId,
            accountNumber,
          },
        },
      });

      await tx.ledgerEntry.create({
        data: {
          storeId: wallet.storeId,
          referenceType: "WALLET_FUNDING",
          referenceId: txReference,
          direction: "CREDIT",
          account: "MERCHANT_AVAILABLE",
          amount: amountNgn,
          currency: safeString(dataRecord?.currency) || "NGN",
          description: "Wallet funding via Paystack dedicated virtual account",
          metadata: {
            provider: "paystack",
            providerEventId,
            accountNumber,
          },
        },
      });

      await tx.wallet.update({
        where: { id: wallet.id },
        data: { availableKobo: { increment: BigInt(amountKobo) } },
      });

      await tx.paymentWebhookEvent.update({
        where: {
          provider_providerEventId: { provider: "paystack", providerEventId },
        },
        data: { status: "PROCESSED", processedAt: new Date() },
      });
    });

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: unknown) {
    logger.error("[PAYSTACK_WEBHOOK_PROXY] Unhandled webhook error", { error });
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
