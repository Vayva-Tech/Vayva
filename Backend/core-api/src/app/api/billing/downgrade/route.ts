import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";
import { Prisma } from "@prisma/client";

interface DowngradeRequest {
  targetPlan: string;
  effectiveDate?: string;
}

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

// POST /api/billing/downgrade - Process plan downgrade with validation
export const POST = withVayvaAPI(
  PERMISSIONS.BILLING_MANAGE,
  async (req, { storeId, user }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const targetPlan = getString(body.targetPlan);
      const effectiveDate = getString(body.effectiveDate) || "next_billing_cycle";

      if (!isPlanKey(targetPlan)) {
        return NextResponse.json({ error: "Invalid target plan" }, { status: 400 });
      }

      // Get current store and subscription details
      const [store, currentSubscription] = await Promise.all([
        prisma.store.findUnique({
          where: { id: storeId },
          include: {
            memberships: {
              where: { status: "ACTIVE" },
            },
            products: {
              select: { id: true },
            },
            customers: {
              select: { id: true },
            },
          },
        }),
        prisma.merchantAiSubscription.findUnique({
          where: { storeId },
        }),
      ]);

      if (!store) {
        return NextResponse.json({ error: "Store not found" }, { status: 404 });
      }

      const currentPlan = store.plan || "STARTER";
      
      // Validate that this is actually a downgrade
      const planOrder = { FREE: 0, STARTER: 1, PRO: 2, PRO_PLUS: 3 };
      if (planOrder[targetPlan] >= planOrder[currentPlan as keyof typeof planOrder]) {
        return NextResponse.json(
          { error: "Target plan must be lower than current plan" },
          { status: 400 }
        );
      }

      // Count usage
      const productsCount = store.products.length;
      const customersCount = store.customers.length;
      const staffCount = store.memberships.length;

      // Get tier limits for target plan
      const PLAN_LIMITS = {
        FREE: {
          products: 20,
          ordersPerMonth: 0,
          customers: 100,
          staffSeats: 0,
          teamMembers: 1,
        },
        STARTER: {
          products: 100,
          ordersPerMonth: 500,
          customers: 500,
          staffSeats: 1,
          teamMembers: 1,
        },
        PRO: {
          products: 300,
          ordersPerMonth: 10000,
          customers: 5000,
          staffSeats: 3,
          teamMembers: 3,
        },
        PRO_PLUS: {
          products: 500,
          ordersPerMonth: Number.MAX_SAFE_INTEGER,
          customers: Number.MAX_SAFE_INTEGER,
          staffSeats: 5,
          teamMembers: 5,
        },
      };

      const targetLimits = PLAN_LIMITS[targetPlan];

      // Validate usage against new limits
      const violations = [];

      if (productsCount > targetLimits.products) {
        violations.push({
          feature: "products",
          current: productsCount,
          limit: targetLimits.products,
        });
      }

      if (customersCount > targetLimits.customers) {
        violations.push({
          feature: "customers",
          current: customersCount,
          limit: targetLimits.customers,
        });
      }

      if (staffCount > targetLimits.staffSeats) {
        violations.push({
          feature: "staff_seats",
          current: staffCount,
          limit: targetLimits.staffSeats,
        });
      }

      // Check orders this month
      const ordersThisMonth = await prisma.order.count({
        where: {
          storeId,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      });

      if (ordersThisMonth > targetLimits.ordersPerMonth) {
        violations.push({
          feature: "orders",
          current: ordersThisMonth,
          limit: targetLimits.ordersPerMonth,
        });
      }

      // If there are violations, return them
      if (violations.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Cannot downgrade due to usage limits exceeded",
            violations,
            requiresAction: true,
            message: `Please reduce your usage before downgrading. You need to remove: ${violations.map(v => `${v.current - v.limit} ${v.feature}`).join(", ")}.`,
          },
          { status: 400 }
        );
      }

      // Calculate proration based on billing cycle
      let prorationCredit = 0;
      let nextBillingDate: Date;
      
      if (currentSubscription && currentSubscription.periodEnd) {
        const periodEnd = new Date(currentSubscription.periodEnd);
        const now = new Date();
        const daysRemaining = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const totalDaysInCycle = 30; // Approximate
        
        // Calculate daily rate difference
        const currentPlanPrice = PLAN_LIMITS[currentPlan as keyof typeof PLAN_LIMITS].ordersPerMonth === 10000 ? 35000 : 
                                 PLAN_LIMITS[currentPlan as keyof typeof PLAN_LIMITS].ordersPerMonth === Number.MAX_SAFE_INTEGER ? 50000 : 25000;
        const targetPlanPrice = PLAN_LIMITS[targetPlan].ordersPerMonth === 0 ? 0 :
                               PLAN_LIMITS[targetPlan].ordersPerMonth === 500 ? 25000 :
                               PLAN_LIMITS[targetPlan].ordersPerMonth === 10000 ? 35000 : 50000;
        
        const dailyDifference = (currentPlanPrice - targetPlanPrice) / totalDaysInCycle;
        prorationCredit = Math.round(dailyDifference * daysRemaining);
        
        nextBillingDate = periodEnd;
      } else {
        // No active subscription, immediate downgrade
        nextBillingDate = new Date();
      }

      // Schedule the downgrade
      let effectiveDateObj: Date;
      
      if (effectiveDate === "immediate") {
        effectiveDateObj = new Date();
      } else if (effectiveDate === "next_billing_cycle") {
        effectiveDateObj = nextBillingDate;
      } else {
        // Custom date
        effectiveDateObj = new Date(effectiveDate);
        if (isNaN(effectiveDateObj.getTime())) {
          return NextResponse.json(
            { error: "Invalid effective date format" },
            { status: 400 }
          );
        }
      }

      // Create downgrade record in database
      await prisma.subscriptionChange.create({
        data: {
          storeId,
          fromPlan: currentPlan,
          toPlan: targetPlan,
          status: "SCHEDULED",
          scheduledDate: effectiveDateObj,
          prorationCredit,
          requestedBy: user.id,
          metadata: {
            productsCount,
            customersCount,
            staffCount,
            ordersThisMonth,
          },
        },
      });

      // If immediate downgrade, apply it now
      if (effectiveDate === "immediate") {
        await prisma.store.update({
          where: { id: storeId },
          data: { plan: targetPlan },
        });

        // Deactivate excess team members if any
        if (staffCount > targetLimits.teamMembers) {
          const excessCount = staffCount - targetLimits.teamMembers;
          await prisma.membership.updateMany({
            where: {
              storeId,
              status: "ACTIVE",
              role: { not: "OWNER" }, // Don't deactivate owner
            },
            data: { status: "INACTIVE" },
            take: excessCount,
            orderBy: { createdAt: "desc" }, // Deactivate most recent first
          });
        }

        logger.info("[IMMEDIATE_DOWNGRADE]", {
          storeId,
          fromPlan: currentPlan,
          toPlan: targetPlan,
          userId: user.id,
        });
      } else {
        logger.info("[SCHEDULED_DOWNGRADE]", {
          storeId,
          fromPlan: currentPlan,
          toPlan: targetPlan,
          effectiveDate: effectiveDateObj,
          userId: user.id,
          prorationCredit,
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          fromPlan: currentPlan,
          toPlan: targetPlan,
          effectiveDate: effectiveDateObj.toISOString(),
          prorationCredit,
          nextBillingDate: nextBillingDate.toISOString(),
          newAmount: targetPlan === "FREE" ? 0 : 
                    targetPlan === "STARTER" ? 25000 :
                    targetPlan === "PRO" ? 35000 : 50000,
        },
        message: `Downgrade to ${targetPlan} ${effectiveDate === "immediate" ? "completed" : "scheduled"} successfully`,
      });
    } catch (error: unknown) {
      logger.error("[DOWNGRADE_POST]", error, { storeId });
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return NextResponse.json(
          { error: "Database error", details: error.message },
          { status: 500 }
        );
      }
      
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);
