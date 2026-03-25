import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function isPlanKey(value: unknown): value is "FREE" | "STARTER" | "PRO" | "PRO_PLUS" {
  return (
    value === "FREE" ||
    value === "STARTER" ||
    value === "PRO" ||
    value === "PRO_PLUS"
  );
}

const PLAN_LIMITS = {
  FREE: {
    ordersPerMonth: 0,
    whatsappMessages: 100,
    staffSeats: 0,
    templates: 2,
    price: 0,
    isTrial: true,
  },
  STARTER: {
    ordersPerMonth: 100,
    whatsappMessages: 500,
    staffSeats: 1,
    templates: 5,
    price: 25000,
  },
  PRO: {
    ordersPerMonth: "unlimited",
    whatsappMessages: "unlimited",
    staffSeats: 3,
    templates: "unlimited",
    price: 35000,
  },
  PRO_PLUS: {
    ordersPerMonth: "unlimited",
    whatsappMessages: "unlimited",
    staffSeats: 5,
    templates: "unlimited",
    price: 50000,
  },
};

export const GET = withVayvaAPI(
  PERMISSIONS.BILLING_MANAGE,
  async (req, { storeId }) => {
    try {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
      });

      if (!store) {
        return NextResponse.json({ error: "Store not found" }, { status: 404 });
      }

      const currentPlan = store.plan || "FREE";
      const subscription = await prisma.merchantAiSubscription.findUnique({
        where: { storeId },
      });

      const [ordersThisMonth, staffCount, productsCount, leadsCount] =
        await Promise.all([
          prisma.order.count({
            where: {
              storeId,
              createdAt: {
                gte: new Date(
                  new Date().getFullYear(),
                  new Date().getMonth(),
                  1,
                ),
              },
            },
          }),
          prisma.membership.count({
            where: {
              storeId,
              status: "ACTIVE",
            },
          }),
          prisma.product.count({
            where: { storeId },
          }),
          prisma.customer.count({
            where: { storeId },
          }),
        ]);

      return NextResponse.json(
        {
          currentPlan,
          limits: PLAN_LIMITS[currentPlan as keyof typeof PLAN_LIMITS],
          usage: {
            orders: ordersThisMonth,
            whatsappMessages: 0,
            staffSeats: staffCount,
            products: productsCount,
            leads: leadsCount,
          },
          subscription,
          availablePlans: Object.entries(PLAN_LIMITS).map(([name, limits]) => ({
            name,
            ...limits,
          })),
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[SUBSCRIPTION_GET]", error, { storeId });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);

export const POST = withVayvaAPI(
  PERMISSIONS.BILLING_MANAGE,
  async (req, { storeId, user }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const newPlan = getString(body.newPlan);

      if (!isPlanKey(newPlan)) {
        return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
      }

      // Get current plan
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { plan: true },
      });

      const _currentPlan = store?.plan || "STARTER";

      // If downgrading to starter, no payment needed
      if (newPlan === "STARTER") {
        await prisma.store.update({
          where: { id: storeId },
          data: { plan: newPlan },
        });

        return NextResponse.json(
          {
            success: true,
            message: "Plan downgraded to Starter",
          },
          {
            headers: {
              "Cache-Control": "no-store",
            },
          },
        );
      }

      // For paid plans, initiate Paystack payment
      const { PaystackService } = await import("@/lib/payment/paystack");

      const payment = await PaystackService.createPaymentForPlanChange(
        user.email,
        newPlan,
        storeId,
      );

      return NextResponse.json({
        success: true,
        message: "Payment initiated",
        paymentUrl: payment.authorization_url,
        reference: payment.reference,
      });
    } catch (error: unknown) {
      logger.error("[SUBSCRIPTION_POST]", error, { storeId });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);
