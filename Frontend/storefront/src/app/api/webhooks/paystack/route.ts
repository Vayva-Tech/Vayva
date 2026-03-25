import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";
import crypto from "crypto";

export const runtime = "nodejs";

const PAYSTACK_SECRET_KEY = process.env.NODE_ENV === "production"
  ? process.env.PAYSTACK_LIVE_SECRET_KEY
  : process.env.PAYSTACK_SECRET_KEY;

interface PaystackWebhookEvent {
  event: string;
  data: {
    reference: string;
    status: string;
    amount: number;
    paid_at?: string;
    transfer_code?: string;
    metadata?: {
      orderRef?: string;
      storeId?: string;
      customerId?: string;
    };
    customer?: {
      email: string;
    };
  };
}

function verifyPaystackSignature(body: string, signature: string | null): boolean {
  if (!signature || !PAYSTACK_SECRET_KEY) return false;
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(body)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
}

async function handleChargeSuccess(event: PaystackWebhookEvent) {
  const { data } = event;
  const reference = data.reference;
  const orderRef = reference.startsWith("order_") ? reference.slice(6) : data.metadata?.orderRef;

  if (!orderRef) {
    logger.warn("[WEBHOOK] No order reference found", { reference });
    return;
  }

  const order = await prisma.order.findFirst({
    where: { refCode: orderRef },
    include: { store: true },
  });

  if (!order) {
    logger.warn("[WEBHOOK] Order not found", { orderRef });
    return;
  }

  const expectedAmountKobo = Math.round(Number(order.total) * 100);
  if (expectedAmountKobo !== data.amount) {
    logger.error("[WEBHOOK] Amount mismatch", {
      orderRef,
      expected: expectedAmountKobo,
      received: data.amount,
    });
    return;
  }

  // Check for affiliate referral code in order metadata
  const orderMetadata = order.metadata as { affiliateReferralCode?: string } | null;
  const referralCode = orderMetadata?.affiliateReferralCode;

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "SUCCESS",
        status: "PAID",
        confirmationEmailSentAt: new Date(),
      },
    });

    await tx.paymentWebhookEvent.create({
      data: {
        storeId: order.storeId,
        provider: "PAYSTACK",
        eventType: "charge.success",
// @ts-expect-error - Json type cast
        payload: event as unknown as { [key: string]: unknown },
        processedAt: new Date(),
      },
    });

    await tx.notificationOutbox.create({
      data: {
        storeId: order.storeId,
        type: "ORDER_CONFIRMATION",
        channel: "EMAIL",
        to: data.customer?.email || order.customerEmail || "",
        payload: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          total: order.total,
        },
        nextRetryAt: new Date(),
      },
    });

    // Confirm affiliate conversion if referral code exists
    if (referralCode) {
      try {
        const affiliate = await tx.affiliate.findFirst({
          where: {
            referralCode,
            storeId: order.storeId,
            status: "ACTIVE",
          },
        });

        if (affiliate) {
          // Find and confirm the pending referral
          const referral = await tx.affiliateReferral.findFirst({
            where: {
              affiliateId: affiliate.id,
              orderId: order.id,
              status: "PENDING",
            },
          });

          if (referral) {
            await tx.affiliateReferral.update({
              where: { id: referral.id },
              data: {
                status: "CONFIRMED",
                convertedAt: new Date(),
              },
            });

            logger.info("[Affiliate] Conversion confirmed via webhook", {
              orderId: order.id,
              affiliateId: affiliate.id,
              referralId: referral.id,
              commission: referral.commission,
            });
          }
        }
      } catch (affiliateError) {
        // Log but don't block the webhook
        logger.error("[Affiliate] Failed to confirm conversion in webhook", {
          orderId: order.id,
          error: affiliateError instanceof Error ? affiliateError.message : String(affiliateError),
        });
      }
    }
  });

  logger.info("[WEBHOOK] Payment processed", { orderRef, reference });
}

async function handleRefund(event: PaystackWebhookEvent) {
  const { data } = event;
  const reference = data.reference;
  const orderRef = reference.startsWith("order_") ? reference.slice(6) : data.metadata?.orderRef;

  if (!orderRef) return;

  const order = await prisma.order.findFirst({
    where: { refCode: orderRef },
  });

  if (!order) return;

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: "REFUNDED",
        paymentStatus: "REFUNDED",
      },
    });

    await tx.refund.create({
      data: {
        storeId: order.storeId,
        orderId: order.id,
        amount: data.amount / 100,
        status: "SUCCESS",
        reason: "Paystack refund processed",
      },
    });
  });

  logger.info("[WEBHOOK] Refund processed", { orderRef, reference });
}

async function handleAffiliateTransfer(event: PaystackWebhookEvent) {
  const reference = event.data.reference || "";
  if (!reference.startsWith("AFF-PAYOUT-")) return;
  const payoutId = reference.replace(/^AFF-PAYOUT-/, "");

  await prisma.$transaction(async (tx) => {
    const payout = await tx.affiliatePayout.findUnique({
      where: { id: payoutId },
      select: {
        id: true,
        affiliateId: true,
        storeId: true,
        amount: true,
        status: true,
        earningIds: true,
      },
    });
    if (!payout) return;

    if (event.event === "transfer.success") {
      if (payout.status !== "PAID") {
        await tx.affiliatePayout.update({
          where: { id: payout.id },
          data: {
            status: "PAID",
            processedAt: new Date(),
            webhookReceivedAt: new Date(),
            webhookData: event as any,
          },
        });

        const amount = Number(payout.amount || 0);
        await tx.affiliate.update({
          where: { id: payout.affiliateId },
          data: {
            pendingEarnings: { decrement: amount },
            paidEarnings: { increment: amount },
          },
        });

        if (Array.isArray(payout.earningIds) && payout.earningIds.length > 0) {
          await tx.affiliateEarning.updateMany({
            where: { id: { in: payout.earningIds } },
            data: { status: "paid", paidAt: new Date(), payoutId: payout.id },
          });
        }
      }
    }

    if (event.event === "transfer.failed") {
      if (payout.status !== "FAILED") {
        await tx.affiliatePayout.update({
          where: { id: payout.id },
          data: {
            status: "FAILED",
            failedAt: new Date(),
            failureReason: "Paystack transfer failed",
            webhookReceivedAt: new Date(),
            webhookData: event as any,
          },
        });
      }
    }
  });
}

export async function POST(req: Request) {
  try {
    const signature = req.headers.get("x-paystack-signature");
    const body = await req.text();

    if (!verifyPaystackSignature(body, signature)) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }

    const event: PaystackWebhookEvent = JSON.parse(body);

    logger.info("[WEBHOOK] Received", { event: event.event, reference: event.data?.reference });

    switch (event.event) {
      case "charge.success":
        await handleChargeSuccess(event);
        break;
      case "transfer.success":
      case "transfer.failed":
        await handleAffiliateTransfer(event);
        break;
      case "refund.processed":
      case "charge.reversed":
        await handleRefund(event);
        break;
      default:
        logger.info("[WEBHOOK] Unhandled event", { event: event.event });
    }

    return NextResponse.json(
      { success: true },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    logger.error("[WEBHOOK] Error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
