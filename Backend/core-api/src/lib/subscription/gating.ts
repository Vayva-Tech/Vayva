import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@vayva/db";

export type SubscriptionTier = "free" | "starter" | "pro" | "pro_plus" | "enterprise";

interface SubscriptionCheckResult {
  hasAccess: boolean;
  currentTier: SubscriptionTier;
  requiredTier: SubscriptionTier;
  isTrialing: boolean;
  expiresAt: Date | null;
}

const tierHierarchy: Record<SubscriptionTier, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  pro_plus: 3,
  enterprise: 4,
};

/**
 * Map planKey from Subscription model to SubscriptionTier
 */
function mapPlanKeyToTier(planKey: string): SubscriptionTier {
  const key = planKey.toLowerCase();
  if (key === "free") return "starter"; // Legacy: map free to starter with no active subscription
  if (key === "starter" || key === "growth") return "starter";
  if (key === "pro") return "pro";
  if (key === "pro_plus") return "pro_plus";
  if (key === "enterprise") return "enterprise";
  return "starter";
}

/**
 * Check if user has required subscription tier
 */
export async function checkSubscription(
  userId: string,
  requiredTier: SubscriptionTier
): Promise<SubscriptionCheckResult> {
  // Find store for this user
  const membership = await prisma.membership.findFirst({
    where: { userId },
    select: { storeId: true },
    orderBy: { createdAt: "desc" },
  });

  if (!membership) {
    return {
      hasAccess: requiredTier === "free",
      currentTier: "free",
      requiredTier,
      isTrialing: false,
      expiresAt: null,
    };
  }

  const subscription = await prisma.subscription.findUnique({
    where: { storeId: membership.storeId },
  });

  if (!subscription) {
    return {
      hasAccess: requiredTier === "free",
      currentTier: "free",
      requiredTier,
      isTrialing: false,
      expiresAt: null,
    };
  }

  const currentTier = mapPlanKeyToTier(subscription.planKey);
  const isActive = subscription.status === "ACTIVE" || subscription.status === "TRIALING";
  const hasRequiredTier = tierHierarchy[currentTier] >= tierHierarchy[requiredTier];
  // Use trialEndsAt if trialing, otherwise currentPeriodEnd
  const expiresAt = subscription.status === "TRIALING" 
    ? subscription.trialEndsAt 
    : subscription.currentPeriodEnd;
  const isExpired = expiresAt && expiresAt < new Date();

  return {
    hasAccess: isActive && !isExpired && hasRequiredTier,
    currentTier,
    requiredTier,
    isTrialing: subscription.status === "TRIALING",
    expiresAt,
  };
}

/**
 * Middleware to enforce subscription tiers on API routes
 */
export function withSubscription(requiredTier: SubscriptionTier) {
  return async function subscriptionMiddleware(
    req: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const check = await checkSubscription(session.user.id, requiredTier);

    if (!check.hasAccess) {
      return NextResponse.json(
        {
          error: "Subscription required",
          currentTier: check.currentTier,
          requiredTier: check.requiredTier,
          upgradeUrl: "/dashboard/settings/subscription",
        },
        { status: 403 }
      );
    }

    // Add subscription info to request for downstream use
    (req as NextRequest & { subscription: SubscriptionCheckResult }).subscription = check;

    return handler(req);
  };
}

/**
 * Get subscription limits for a tier
 */
export function getSubscriptionLimits(tier: SubscriptionTier) {
  const limits: Record<
    SubscriptionTier,
    {
      maxProducts: number;
      maxOrders: number;
      maxTeamMembers: number;
      features: string[];
    }
  > = {
    free: {
      // Legacy backward compat — mapped to starter with expired state
      maxProducts: 20,
      maxOrders: 50,
      maxTeamMembers: 1,
      features: ["basic_dashboard", "paystack_payments", "dashboard_metrics_4"],
    },
    starter: {
      maxProducts: 500,
      maxOrders: 500,
      maxTeamMembers: 1,
      features: [
        "basic_dashboard",
        "paystack_payments",
        "csv_import",
        "basic_analytics",
        "advanced_analytics",
        "email_support",
        "remove_branding",
        "automation",
        "financial_charts",
        "dashboard_metrics_6",
      ],
    },
    pro: {
      maxProducts: -1, // Unlimited
      maxOrders: 10000,
      maxTeamMembers: 3,
      features: [
        "basic_dashboard",
        "paystack_payments",
        "csv_import",
        "basic_analytics",
        "advanced_analytics",
        "accounting",
        "multi_store",
        "api_access",
        "webhooks",
        "industry_dashboards",
        "custom_domain",
        "remove_branding",
        "automation",
        "custom_integrations",
        "financial_charts",
        "dashboard_metrics_10",
        "ai_autopilot",
      ],
    },
    pro_plus: {
      maxProducts: -1, // Unlimited
      maxOrders: -1, // Unlimited
      maxTeamMembers: 5,
      features: [
        "basic_dashboard",
        "paystack_payments",
        "csv_import",
        "basic_analytics",
        "advanced_analytics",
        "accounting",
        "multi_store",
        "priority_support",
        "api_access",
        "webhooks",
        "industry_dashboards",
        "merged_industry_dashboard",
        "visual_workflow_builder",
        "custom_domain",
        "remove_branding",
        "automation",
        "custom_integrations",
        "financial_charts",
        "dashboard_metrics_unlimited",
        "ai_autopilot",
      ],
    },
    enterprise: {
      maxProducts: -1, // Unlimited
      maxOrders: -1,
      maxTeamMembers: -1,
      features: [
        "basic_dashboard",
        "paystack_payments",
        "csv_import",
        "advanced_analytics",
        "accounting",
        "multi_store",
        "dedicated_support",
        "priority_support",
        "api_access",
        "webhooks",
        "industry_dashboards",
        "merged_industry_dashboard",
        "visual_workflow_builder",
        "custom_domain",
        "remove_branding",
        "custom_integrations",
        "ai_autopilot",
        "sla",
      ],
    },
  };

  return limits[tier];
}

/**
 * Check if user is within subscription limits
 */
export async function checkSubscriptionLimits(
  userId: string,
  resource: "products" | "orders" | "team"
): Promise<{ withinLimit: boolean; current: number; limit: number }> {
  // Find store for this user
  const membership = await prisma.membership.findFirst({
    where: { userId },
    select: { storeId: true },
    orderBy: { createdAt: "desc" },
  });

  if (!membership) {
    return { withinLimit: false, current: 0, limit: 0 };
  }

  const subscription = await prisma.subscription.findUnique({
    where: { storeId: membership.storeId },
  });

  const tier = subscription ? mapPlanKeyToTier(subscription.planKey) : "starter";
  const limits = getSubscriptionLimits(tier);

  let current = 0;

  switch (resource) {
    case "products":
      current = await prisma.product.count({
        where: { storeId: membership.storeId },
      });
      return {
        withinLimit: limits.maxProducts === -1 || current < limits.maxProducts,
        current,
        limit: limits.maxProducts,
      };

    case "orders":
      current = await prisma.order.count({
        where: { storeId: membership.storeId },
      });
      return {
        withinLimit: limits.maxOrders === -1 || current < limits.maxOrders,
        current,
        limit: limits.maxOrders,
      };

    case "team":
      current = await prisma.membership.count({
        where: { storeId: membership.storeId },
      });
      return {
        withinLimit: limits.maxTeamMembers === -1 || current < limits.maxTeamMembers,
        current,
        limit: limits.maxTeamMembers,
      };

    default:
      return { withinLimit: false, current: 0, limit: 0 };
  }
}

/**
 * Start a trial for a store
 */
export async function startTrial(
  storeId: string,
  tier: SubscriptionTier = "pro",
  trialDays = 7
): Promise<void> {
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

  await prisma.subscription.create({
    data: {
      storeId,
      planKey: tier.toUpperCase(),
      status: "TRIALING",
      currentPeriodStart: new Date(),
      currentPeriodEnd: trialEndsAt,
      trialEndsAt,
      provider: "PAYSTACK",
    },
  });
}

/**
 * Check and send trial expiry reminders
 */
export async function checkTrialExpirations(): Promise<void> {
  const expiringTrials = await prisma.subscription.findMany({
    where: {
      status: "TRIALING",
      trialEndsAt: {
        lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Expires in 3 days or less
        gt: new Date(),
      },
    },
    include: {
      store: {
        include: {
          memberships: {
            where: { role_enum: "OWNER" },
            take: 1,
            include: { user: { select: { email: true, firstName: true } } },
          },
        },
      },
    },
  });

  for (const trial of expiringTrials) {
    // Get first owner email
    const owner = trial.store.memberships[0];
    if (!owner?.user?.email) continue;

    // Queue email notification
    await prisma.notificationLog.create({
      data: {
        storeId: trial.storeId,
        type: "TRIAL_EXPIRING",
        channel: "email",
        status: "PENDING",
        metadata: {
          email: owner.user.email,
          firstName: owner.user.firstName,
          trialEndsAt: trial.trialEndsAt,
          daysLeft: Math.ceil(
            (trial.trialEndsAt!.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
          ),
        },
      },
    });
  }
}
