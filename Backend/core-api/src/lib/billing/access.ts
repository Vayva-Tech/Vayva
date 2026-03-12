import { prisma } from "@vayva/db";
export async function checkFeatureAccess(
  storeId: string,
  feature: string,
): Promise<{ allowed: boolean; reason?: string; message?: string }> {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: {
      aiSubscription: true,
    },
  });
  if (!store) {
    throw new Error("Store not found");
  }
  const subscription = store.aiSubscription;
  const plan = (store.plan as string) || "STARTER";

  // 0. Compliance & KYC Gating
  if (feature === "payouts" || feature === "withdrawals") {
    if (store.kycStatus !== "VERIFIED") {
      return {
        allowed: false,
        reason: "kyc_required",
        message:
          "Identity verification (BVN/NIN) is required to withdraw funds.",
      };
    }
  }

  // 1. Check Trial Expiry
  if (plan === "STARTER" && subscription?.trialExpiresAt) {
    if (new Date() > subscription.trialExpiresAt) {
      return {
        allowed: false,
        reason: "trial_expired",
        message:
          "Your 7-day free trial has expired. Please upgrade to continue.",
      };
    }
  }
  // 2. Usage Limits
  if (plan === "STARTER") {
    if (feature === "whatsapp_ai") {
      const messagesSent = await getWhatsAppMessageCount(storeId);
      if (messagesSent >= 100) {
        return {
          allowed: false,
          reason: "limit_reached",
          message:
            "You've reached your free limit of 100 AI messages. Upgrade to Growth for 500.",
        };
      }
    }
    if (feature === "template_usage") {
      const storeWithCount = await prisma.store.findUnique({
        where: { id: storeId },
        include: { _count: { select: { notificationTemplates: true } } },
      });
      if ((storeWithCount?._count?.notificationTemplates || 0) >= 2) {
        return {
          allowed: false,
          reason: "limit_reached",
          message:
            "Free plan is limited to 2 templates. Upgrade to Growth for more.",
        };
      }
    }
  }
  if (plan === "GROWTH") {
    if (feature === "order_creation") {
      const ordersThisMonth = await prisma.order.count({
        where: {
          storeId,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      });
      if (ordersThisMonth >= 100) {
        return {
          allowed: false,
          reason: "limit_reached",
          message:
            "You've reached your limit of 100 orders this month. Upgrade to Pro for unlimited.",
        };
      }
    }
    if (feature === "whatsapp_ai") {
      const messagesSent = await getWhatsAppMessageCount(storeId);
      if (messagesSent >= 500) {
        return {
          allowed: false,
          reason: "limit_reached",
          message:
            "You've reached your limit of 500 AI messages this month. Upgrade to Pro for unlimited.",
        };
      }
    }
    if (feature === "template_usage") {
      const storeWithCount = await prisma.store.findUnique({
        where: { id: storeId },
        include: { _count: { select: { notificationTemplates: true } } },
      });
      if ((storeWithCount?._count?.notificationTemplates || 0) >= 5) {
        return {
          allowed: false,
          reason: "limit_reached",
          message:
            "Growth plan is limited to 5 templates. Upgrade to Pro for unlimited.",
        };
      }
    }
  }
  // 3. Feature Gating
  if (feature === "ai_profile_edit" && plan === "STARTER") {
    return {
      allowed: false,
      reason: "trial_restricted",
      message:
        "During your free trial, your AI assistant uses a default persona. Upgrade to Growth to fully customize it.",
    };
  }
  if (feature === "vavya_cut_pro" && plan !== "PRO") {
    return {
      allowed: false,
      reason: "feature_locked",
      message: "Vayva Cut Pro is only available on the Pro plan.",
    };
  }

  // Marketplace publishing requires paid subscription
  if (feature === "marketplace_publish" && plan === "STARTER") {
    return {
      allowed: false,
      reason: "feature_locked",
      message:
        "Publishing to the Vayva Marketplace requires a Growth or Pro subscription.",
    };
  }

  if (plan === "STARTER" || plan === "GROWTH") {
    if (feature === "custom_domain" || feature === "advanced_analytics") {
      if (plan === "STARTER") {
        return {
          allowed: false,
          reason: "feature_locked",
          message: "This feature is only available on paid plans.",
        };
      }
      if (feature === "custom_domain" && plan === "GROWTH") {
        return {
          allowed: false,
          reason: "feature_locked",
          message: "Custom domains are only available on the Pro plan.",
        };
      }
    }
  }
  return { allowed: true };
}
async function getWhatsAppMessageCount(storeId: string) {
  return prisma.notification.count({
    where: {
      storeId,
      type: "WHATSAPP",
      createdAt: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    },
  });
}
