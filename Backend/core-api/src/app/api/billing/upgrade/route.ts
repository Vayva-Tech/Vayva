import { NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const POST = withVayvaAPI(
  PERMISSIONS.BILLING_MANAGE,
  async (request: Request, ctx: APIContext) => {
    try {
      const parsedBody: unknown = await request.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const plan = getString(body.plan);

      if (!plan || !["STARTER", "PRO"].includes(plan)) {
        return NextResponse.json(
          { error: "Invalid plan. Must be STARTER or PRO." },
          { status: 400 },
        );
      }

      const store = await prisma.store.findUnique({
        where: { id: ctx.storeId },
        select: { plan: true },
      });

      if (store?.plan === plan) {
        return NextResponse.json(
          { error: "Already on this plan" },
          { status: 400 },
        );
      }

      const { PaystackService } = await import("@/lib/payment/paystack");

      const payment = await PaystackService.createPaymentForPlanChange(
        ctx.user.email,
        plan,
        ctx.storeId,
      );

      return NextResponse.json({
        success: true,
        paymentUrl: payment.authorization_url,
        reference: payment.reference,
      });
    } catch (error: unknown) {
      logger.error("[BILLING_UPGRADE]", error, {
        storeId: ctx.storeId,
        userId: ctx.user?.id,
      });
      return NextResponse.json(
        { error: "Failed to initiate upgrade" },
        { status: 500 },
      );
    }
  },
);
