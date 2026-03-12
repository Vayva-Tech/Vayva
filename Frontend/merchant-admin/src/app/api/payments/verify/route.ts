import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
// Define status constants since enums don't exist in Prisma client
const SubscriptionStatus = {
  ACTIVE: "ACTIVE",
  PENDING_PAYMENT: "PENDING_PAYMENT",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED",
} as const;

const verifySchema = z.object({
  reference: z.string().min(1, "Reference is required"),
});

type PaymentType = "order" | "subscription" | "template_purchase" | "unknown";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reference } = verifySchema.parse(body);

    // Call Paystack to verify the transaction
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackData.status || paystackData.data.status !== "success") {
      return NextResponse.json(
        { success: false, message: "Payment verification failed", type: "unknown" as PaymentType },
        { status: 400 }
      );
    }

    const { data } = paystackData;
    const metadata = data.metadata || {};
    const paymentType = metadata.type as PaymentType || "unknown";

    // Handle different payment types
    switch (paymentType) {
      case "subscription": {
        return await handleSubscriptionPayment(data, metadata, reference);
      }
      case "order": {
        return await handleOrderPayment(data, metadata, reference);
      }
      case "template_purchase": {
        return await handleTemplatePurchase(data, metadata, reference);
      }
      default: {
        // Try to detect type from metadata
        if (metadata.orderId) {
          return await handleOrderPayment(data, metadata, reference);
        }
        if (metadata.storeId && metadata.newPlan) {
          return await handleSubscriptionPayment(data, metadata, reference);
        }
        
        return NextResponse.json({
          success: true,
          message: "Payment verified successfully",
          type: "unknown" as PaymentType,
          amount: data.amount / 100,
        });
      }
    }
  } catch (error) {
    logger.error("[PaymentVerification] Error:", { error });
    return NextResponse.json(
      { success: false, message: "Failed to verify payment", type: "unknown" as PaymentType },
      { status: 500 }
    );
  }
}

async function handleSubscriptionPayment(
  data: any,
  metadata: any,
  reference: string
) {
  const storeId = metadata.storeId;
  const newPlan = metadata.newPlan;
  const billingCycle = metadata.billingCycle || "monthly";

  if (!storeId || !newPlan) {
    return NextResponse.json(
      { success: false, message: "Invalid subscription metadata", type: "subscription" },
      { status: 400 }
    );
  }

  // Calculate period dates based on billing cycle
  const now = new Date();
  const periodEnd = new Date(now);
  if (billingCycle === "quarterly") {
    periodEnd.setMonth(periodEnd.getMonth() + 3);
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  }

  // Update subscription in database
  const subscription = await prisma.subscription.upsert({
    where: { storeId },
    update: {
      planKey: newPlan.toUpperCase(),
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      providerSubscriptionId: reference,
      updatedAt: now,
    },
    create: {
      storeId,
      planKey: newPlan.toUpperCase(),
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      provider: "PAYSTACK",
      providerSubscriptionId: reference,
    },
  });

  // Update store plan
  await prisma.store.update({
    where: { id: storeId },
    data: { plan: newPlan.toUpperCase() },
  });

  return NextResponse.json({
    success: true,
    message: "Subscription activated successfully",
    type: "subscription",
    subscriptionId: subscription.id,
    planKey: newPlan,
    billingCycle,
    amount: data.amount / 100,
    nextBillingDate: periodEnd.toISOString(),
  });
}

async function handleOrderPayment(
  data: any,
  metadata: any,
  reference: string
) {
  const orderId = metadata.orderId;

  if (!orderId) {
    return NextResponse.json(
      { success: false, message: "Invalid order metadata", type: "order" },
      { status: 400 }
    );
  }

  // Update order status in database
  await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: "PAID" as any,
    },
  });

  return NextResponse.json({
    success: true,
    message: "Order payment verified successfully",
    type: "order",
    orderId,
    amount: data.amount / 100,
  });
}

async function handleTemplatePurchase(
  data: any,
  metadata: any,
  reference: string
) {
  // Template purchases are handled asynchronously via webhooks
  // This endpoint just confirms the payment was successful
  return NextResponse.json({
    success: true,
    message: "Template purchase payment verified",
    type: "template_purchase",
    templateId: metadata.templateId,
    amount: data.amount / 100,
  });
}
