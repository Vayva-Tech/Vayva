/**
 * Feature Access Checker - Re-gating Plan V2
 * 
 * Single source of truth for feature gating based on subscription plan.
 * Uses credit system for metering usage.
 */

import { prisma, type SubscriptionPlan } from "@vayva/db";
import { CreditManager } from "@/lib/credits/credit-manager";

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
  
  const plan: SubscriptionPlan = store.plan;
  const creditManager = new CreditManager();

  // ============================================================================
  // 1. COMPLIANCE & KYC GATING (All Plans)
  // ============================================================================
  if (feature === "payouts" || feature === "withdrawals") {
    if (store.kycStatus !== "VERIFIED") {
      return {
        allowed: false,
        reason: "kyc_required",
        message: "Identity verification (BVN/NIN) is required to withdraw funds.",
      };
    }
  }

  // ============================================================================
  // 2. SUBSCRIPTION / TRIAL CHECK (platform schema)
  // ============================================================================
  const billingSub = await prisma.subscription.findUnique({ where: { storeId } });
  if (
    billingSub?.trialEndsAt &&
    billingSub.status === "TRIALING" &&
    new Date() > billingSub.trialEndsAt
  ) {
    return {
      allowed: false,
      reason: "trial_expired",
      message: "Your trial has expired. Please subscribe to continue.",
    };
  }

  // ============================================================================
  // 3. FEATURE-SPECIFIC GATING
  // ============================================================================

  // AUTOPILOT - PRO
  if (feature === "autopilot" || feature === "autopilot_run") {
    if (plan !== "PRO") {
      return {
        allowed: false,
        reason: "plan_restriction",
        message: "AI Autopilot is available on Pro plan and above.",
      };
    }
  }

  // INDUSTRY DASHBOARDS - PRO
  if (feature === "industry_dashboards" || feature === "industry_specific_dashboard") {
    if (plan !== "PRO") {
      return {
        allowed: false,
        reason: "plan_restriction",
        message: "Industry-specific dashboards (35+) are available on Pro plan and above.",
      };
    }
  }

  // MERGED INDUSTRY DASHBOARD - PRO (PRO_PLUS removed from platform plans)
  if (feature === "merged_industry_dashboard") {
    if (plan !== "PRO") {
      return {
        allowed: false,
        reason: "plan_restriction",
        message: "Merged industry dashboard is available on Pro Plus plan only.",
      };
    }
  }

  // VISUAL WORKFLOW BUILDER - PRO (PRO_PLUS removed from platform plans)
  if (feature === "visual_workflow_builder") {
    if (plan !== "PRO") {
      return {
        allowed: false,
        reason: "plan_restriction",
        message: "Visual workflow builder is available on Pro Plus plan only.",
      };
    }
  }

  // CUSTOM DOMAIN - PRO
  if (feature === "custom_domain") {
    if (plan !== "PRO") {
      return {
        allowed: false,
        reason: "plan_restriction",
        message: "Custom domain support is available on Pro plan and above.",
      };
    }
  }

  // DASHBOARD METRICS - Tiered widget limits (STARTER=6, PRO=10)
  if (feature === "dashboard_metrics") {
    const widgetLimits: Record<SubscriptionPlan, number> = { FREE: 0, STARTER: 6, PRO: 10 };
    const maxWidgets = widgetLimits[plan] ?? 0;
    return {
      allowed: true,
      reason: "widget_limit",
      message: `Your plan allows up to ${maxWidgets} dashboard widgets.`,
    };
  }

  // FINANCIAL CHARTS - STARTER+
  if (feature === "financial_charts") {
    // All subscribed plans (STARTER, PRO, PRO_PLUS) have access
  }

  // ADVANCED ANALYTICS - STARTER+
  if (feature === "advanced_analytics") {
    // All subscribed plans (STARTER, PRO, PRO_PLUS) have access
  }

  // PREDICTIVE INSIGHTS - PRO
  if (feature === "predictive_insights") {
    if (plan !== "PRO") {
      return {
        allowed: false,
        reason: "plan_restriction",
        message: "Predictive insights are available on Pro plan and above.",
      };
    }
  }

  // CUSTOM LAYOUTS - PRO
  if (feature === "custom_layouts") {
    if (plan !== "PRO") {
      return {
        allowed: false,
        reason: "plan_restriction",
        message: "Custom dashboard layouts are available on Pro plan and above.",
      };
    }
  }

  // TEMPLATE CHANGING - Tiered template limits
  if (feature === "template_change") {
    const ownedCount = await prisma.templateProject.count({ where: { storeId } });
    if (plan === "STARTER") {
      // 1 template included, can buy extras at ₦5,000 each
      if (ownedCount >= 1) {
        return { allowed: true, reason: "requires_payment" };
      }
      return { allowed: true };
    }

    if (plan === "PRO") {
      // Can own 2 templates free, pay for 3rd+
      if (ownedCount >= 2) {
        return { allowed: true, reason: "requires_payment" };
      }
      return { allowed: true };
    }
  }

  // AI MESSAGING - Check credits for all subscribed plans
  if (feature === "ai_message" || feature === "whatsapp_ai") {
    // All subscribed plans: Check credit balance
    const creditCheck = await creditManager.checkCredits(storeId, 1); // 1 credit per message
    if (!creditCheck.allowed) {
      return {
        allowed: false,
        reason: "insufficient_credits",
        message: `Insufficient credits. You have ${creditCheck.remaining} credits remaining.`,
      };
    }
    return { allowed: true };
  }

  // AUTOPILOT RUN - Costs 100 credits (PRO only feature, but double-check)
  if (feature === "autopilot_run") {
    const creditCheck = await creditManager.checkCredits(storeId, 100);
    if (!creditCheck.allowed) {
      return {
        allowed: false,
        reason: "insufficient_credits",
        message: `Autopilot analysis requires 100 credits. You have ${creditCheck.remaining} credits.`,
      };
    }
    return { allowed: true };
  }

  // TEMPLATE PURCHASE - Costs 5,000 credits for extra templates
  if (feature === "template_purchase") {
    const creditCheck = await creditManager.checkCredits(storeId, 5000);
    if (!creditCheck.allowed) {
      return {
        allowed: false,
        reason: "insufficient_credits",
        message: `Template change requires 5,000 credits. You have ${creditCheck.remaining} credits.`,
      };
    }
    return { allowed: true };
  }

  // ============================================================================
  // 4. DEFAULT ALLOW
  // ============================================================================
  return { allowed: true };
}

/**
 * Count WhatsApp AI messages sent this month
 */
async function _getWhatsAppMessageCount(storeId: string) {
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
