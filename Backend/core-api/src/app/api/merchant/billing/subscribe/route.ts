import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { PLANS } from "@/lib/billing/plans";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function getErrorMessage(error: unknown): string | undefined {
  if (error instanceof Error) return error.message;
  if (!isRecord(error)) return undefined;
  return getString(error.message);
}

export const POST = withVayvaAPI(
  PERMISSIONS.BILLING_MANAGE,
  async (request, { storeId, user }) => {
    // Session is already validated and user exists via withRBAC -> requireAuth logic
    // storeId is present in session
    const parsedBody: unknown = await request.json().catch(() => ({}));
    const body = isRecord(parsedBody) ? parsedBody : {};
    const plan_slug = getString(body.plan_slug) ?? "";
    const planKey = plan_slug as keyof typeof PLANS;
    if (!plan_slug || !(planKey in PLANS)) {
      return NextResponse.json({ error: "Invalid Plan" }, { status: 400 });
    }
    try {
      const { PaystackService } = await import("@/lib/payment/paystack");
      const payment = await PaystackService.createPaymentForPlanChange(
        user.email,
        plan_slug,
        storeId,
      );
      // Upsert pending subscription
      await prisma.merchantAiSubscription.upsert({
        where: { storeId },
        update: {
          planKey: plan_slug,
          // lastPaymentStatus: "pending", // Removing generic fields if unsure
        },
        create: {
          storeId,
          planKey: plan_slug,
          planId: "paystack_" + plan_slug,
          status: "TRIAL_ACTIVE",
          periodStart: new Date(),
          periodEnd: new Date(),
          trialExpiresAt: new Date(),
          // lastPaymentStatus: "pending",
        },
      });
      const data = { checkout_url: payment.authorization_url };
      return NextResponse.json({
        success: true,
        data,
        ok: true,
        checkout_url: data.checkout_url,
      });
    } catch (e: unknown) {
      return NextResponse.json(
        { error: getErrorMessage(e) || "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
