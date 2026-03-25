import { NextRequest as _NextRequest, NextResponse } from "next/server";
import { prisma, type Prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { z } from "zod";
import { PERMISSIONS } from "@/lib/team/permissions";

// GET /api/subscriptions - List subscriptions with filters
export const GET = withVayvaAPI(
  PERMISSIONS.BILLING_VIEW,
  async (req, { storeId }) => {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as
      | "TRIALING"
      | "ACTIVE"
      | "CANCELED"
      | "PAST_DUE"
      | "UNPAID"
      | null;
    const provider = searchParams.get("provider") as "STRIPE" | "PAYSTACK" | null;
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const where: Record<string, unknown> = { storeId };

    if (status) {
      where.status = status;
    }

    if (provider) {
      where.provider = provider;
    }

    const subscriptions = await prisma.subscription.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });

    const totalCount = await prisma.subscription.count({ where });

    return NextResponse.json({
      subscriptions: subscriptions.map((s) => ({
        storeId: s.storeId,
        planKey: s.planKey,
        status: s.status,
        provider: s.provider,
        providerSubscriptionId: s.providerSubscriptionId,
        currentPeriodStart: s.currentPeriodStart,
        currentPeriodEnd: s.currentPeriodEnd,
        cancelAtPeriodEnd: s.cancelAtPeriodEnd,
        trialEndsAt: s.trialEndsAt,
        recentInvoices: [],
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      })),
      pagination: {
        total: totalCount,
        limit,
        offset,
      },
    });
  }
);

// POST /api/subscriptions - Create new subscription
export const POST = withVayvaAPI(
  PERMISSIONS.BILLING_MANAGE,
  async (req, { storeId }) => {
    const body = await req.json();

    const schema = z.object({
      planKey: z.string().min(1),
      provider: z.enum(["STRIPE", "PAYSTACK"]).default("PAYSTACK"),
      trialDays: z.number().int().min(0).max(30).optional(),
      paymentMethod: z.enum(["card", "bank_transfer", "ussd"]).default("card"),
    });

    const validated = schema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { planKey, provider, trialDays } = validated.data;

    // Check if store already has a subscription
    const existing = await prisma.subscription.findUnique({
      where: { storeId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Store already has an active subscription" },
        { status: 409 }
      );
    }

    const now = new Date();
    const trialEndsAt = trialDays ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000) : null;
    const currentPeriodEnd = trialEndsAt
      ? new Date(trialEndsAt.getTime() + 30 * 24 * 60 * 60 * 1000)
      : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Create subscription record
    const subscription = await prisma.subscription.create({
      data: {
        storeId,
        planKey,
        provider,
        status: trialDays ? "TRIALING" : "ACTIVE",
        currentPeriodStart: now,
        currentPeriodEnd,
        trialEndsAt,
      },
    });

    // Create initial invoice for non-trial subscriptions
    if (!trialDays) {
      await prisma.invoiceV2.create({
        data: {
          store: { connect: { id: storeId } },
          subscription: { connect: { id: subscription.id } },
          invoiceNumber: `INV-${Date.now()}`,
          subtotalKobo: getPlanAmount(planKey),
          taxKobo: BigInt(0),
          totalKobo: getPlanAmount(planKey),
          status: "DRAFT",
          dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          items: [] as unknown as Prisma.InputJsonValue,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        subscription,
        message: trialDays
          ? `Subscription created with ${trialDays}-day trial`
          : "Subscription created successfully",
      },
      { status: 201 }
    );
  }
);

// PATCH /api/subscriptions - Update subscription (change plan, cancel, etc.)
export const PATCH = withVayvaAPI(
  PERMISSIONS.BILLING_MANAGE,
  async (req, { storeId }) => {
    const body = await req.json();

    const schema = z.object({
      id: z.string().uuid(),
      action: z.enum(["change_plan", "cancel", "reactivate", "pause", "resume"]),
      planKey: z.string().optional(),
      cancelAtPeriodEnd: z.boolean().optional(),
    });

    const validated = schema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { id, action, planKey, cancelAtPeriodEnd } = validated.data;

    // Find subscription
    const subscription = await prisma.subscription.findFirst({
      where: { id, storeId },
    });

    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    switch (action) {
      case "change_plan": {
        if (!planKey) {
          return NextResponse.json(
            { error: "planKey is required for plan change" },
            { status: 400 }
          );
        }

        if (subscription.status === "CANCELED") {
          return NextResponse.json(
            { error: "Cannot change plan for canceled or unpaid subscription" },
            { status: 400 }
          );
        }

        const planWrite = await prisma.subscription.updateMany({
          where: { id, storeId },
          data: {
            planKey,
            updatedAt: new Date(),
          },
        });
        if (planWrite.count === 0) {
          return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
        }
        const updatedSubscription = await prisma.subscription.findFirst({
          where: { id, storeId },
        });
        if (!updatedSubscription) {
          return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
        }

        // Create prorated invoice if needed
        const daysRemaining = Math.ceil(
          (subscription.currentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        if (daysRemaining > 0) {
          const newPlanAmount = Number(getPlanAmount(planKey));
          const oldPlanAmount = Number(getPlanAmount(subscription.planKey));
          const proratedAmount = Math.max(0, newPlanAmount - oldPlanAmount);

          if (proratedAmount > 0) {
            await prisma.invoiceV2.create({
              data: {
                store: { connect: { id: storeId } },
                subscription: { connect: { id: subscription.id } },
                invoiceNumber: `INV-${Date.now()}`,
                subtotalKobo: BigInt(Math.round(proratedAmount)),
                taxKobo: BigInt(0),
                totalKobo: BigInt(Math.round(proratedAmount)),
                status: "DRAFT",
                dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                items: [] as unknown as Prisma.InputJsonValue,
              },
            });
          }
        }

        return NextResponse.json({
          success: true,
          subscription: updatedSubscription,
          message: `Plan changed to ${planKey}`,
        });
      }

      case "cancel": {
        if (subscription.status === "CANCELED") {
          return NextResponse.json(
            { error: "Subscription is already canceled" },
            { status: 400 }
          );
        }

        if (cancelAtPeriodEnd) {
          const w = await prisma.subscription.updateMany({
            where: { id, storeId },
            data: {
              cancelAtPeriodEnd: true,
              updatedAt: new Date(),
            },
          });
          if (w.count === 0) {
            return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
          }
          const canceled = await prisma.subscription.findFirst({ where: { id, storeId } });
          if (!canceled) {
            return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
          }

          return NextResponse.json({
            success: true,
            subscription: canceled,
            message: "Subscription will cancel at period end",
          });
        } else {
          const w = await prisma.subscription.updateMany({
            where: { id, storeId },
            data: {
              status: "CANCELED",
              updatedAt: new Date(),
            },
          });
          if (w.count === 0) {
            return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
          }
          const canceled = await prisma.subscription.findFirst({ where: { id, storeId } });
          if (!canceled) {
            return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
          }

          return NextResponse.json({
            success: true,
            subscription: canceled,
            message: "Subscription canceled immediately",
          });
        }
      }

      case "reactivate": {
        if (subscription.status === "CANCELED") {
          const now = new Date();
          const rw = await prisma.subscription.updateMany({
            where: { id, storeId },
            data: {
              status: "ACTIVE",
              currentPeriodStart: now,
              currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
              cancelAtPeriodEnd: false,
              updatedAt: new Date(),
            },
          });
          if (rw.count === 0) {
            return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
          }
          const reactivated = await prisma.subscription.findFirst({ where: { id, storeId } });
          if (!reactivated) {
            return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
          }

          // Create new invoice
          await prisma.invoiceV2.create({
            data: {
              store: { connect: { id: storeId } },
              subscription: { connect: { id: id } },
              invoiceNumber: `INV-${Date.now()}`,
              subtotalKobo: getPlanAmount(subscription.planKey),
              taxKobo: BigInt(0),
              totalKobo: getPlanAmount(subscription.planKey),
              status: "DRAFT",
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              items: [] as unknown as Prisma.InputJsonValue,
            },
          });

          return NextResponse.json({
            success: true,
            subscription: reactivated,
            message: "Subscription reactivated",
          });
        }
        break;
      }

      case "pause": {
        // Pause subscription (set grace period)
        const gracePeriodDays = 7;
        const pw = await prisma.subscription.updateMany({
          where: { id, storeId },
          data: {
            status: "PAST_DUE",
            gracePeriodEndsAt: new Date(Date.now() + gracePeriodDays * 24 * 60 * 60 * 1000),
            updatedAt: new Date(),
          },
        });
        if (pw.count === 0) {
          return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
        }
        const paused = await prisma.subscription.findFirst({ where: { id, storeId } });
        if (!paused) {
          return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
        }

        return NextResponse.json({
          success: true,
          subscription: paused,
          message: `Subscription paused with ${gracePeriodDays}-day grace period`,
        });
      }

      case "resume": {
        if (subscription.status !== "PAST_DUE") {
          return NextResponse.json(
            { error: "Can only resume paused subscriptions" },
            { status: 400 }
          );
        }

        const resW = await prisma.subscription.updateMany({
          where: { id, storeId },
          data: {
            status: "ACTIVE",
            gracePeriodEndsAt: null,
            updatedAt: new Date(),
          },
        });
        if (resW.count === 0) {
          return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
        }
        const resumed = await prisma.subscription.findFirst({ where: { id, storeId } });
        if (!resumed) {
          return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
        }

        return NextResponse.json({
          success: true,
          subscription: resumed,
          message: "Subscription resumed",
        });
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
);

// DELETE /api/subscriptions - Cancel subscription
export const DELETE = withVayvaAPI(
  PERMISSIONS.BILLING_MANAGE,
  async (req, { storeId }) => {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 }
      );
    }

    const subscription = await prisma.subscription.findFirst({
      where: { id, storeId },
    });

    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    const delW = await prisma.subscription.updateMany({
      where: { id, storeId },
      data: {
        status: "CANCELED",
        cancelAtPeriodEnd: false,
        updatedAt: new Date(),
      },
    });
    if (delW.count === 0) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Subscription canceled",
    });
  }
);

// Helper function to get plan amount in kobo
function getPlanAmount(planKey: string): bigint {
  const plans: Record<string, bigint> = {
    STARTER: BigInt(500000), // ₦5,000
    GROWTH: BigInt(1500000), // ₦15,000
    PRO: BigInt(3500000), // ₦35,000
    ENTERPRISE: BigInt(10000000), // ₦100,000
  };
  return plans[planKey] || BigInt(500000);
}
