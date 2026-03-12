import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@vayva/db";

export type SubscriptionTier = "free" | "starter" | "pro" | "enterprise";

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
  enterprise: 3,
};

/**
 * Map planKey from Subscription model to SubscriptionTier
 */
function mapPlanKeyToTier(planKey: string): SubscriptionTier {
  const key = planKey.toLowerCase();
  if (key === "free") return "free";
  if (key === "starter" || key === "growth") return "starter";
  if (key === "pro") return "pro";
  if (key === "enterprise") return "enterprise";
  return "free";
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
      maxProducts: 20,
      maxOrders: 50,
      maxTeamMembers: 1,
      features: ["basic_dashboard", "paystack_payments"],
    },
    starter: {
      maxProducts: 100,
      maxOrders: 500,
      maxTeamMembers: 2,
      features: [
        "basic_dashboard",
        "paystack_payments",
        "csv_import",
        "basic_analytics",
        "email_support",
      ],
    },
    pro: {
      maxProducts: 1000,
      maxOrders: 10000,
      maxTeamMembers: 10,
      features: [
        "basic_dashboard",
        "paystack_payments",
        "csv_import",
        "advanced_analytics",
        "accounting",
        "multi_store",
        "priority_support",
        "api_access",
        "webhooks",
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
        "api_access",
        "webhooks",
        "custom_integrations",
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

  const tier = subscription ? mapPlanKeyToTier(subscription.planKey) : "free";
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
  trialDays = 14
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
