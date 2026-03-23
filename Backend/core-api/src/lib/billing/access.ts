/**
 * Feature Access Checker - Re-gating Plan V2
 * 
 * Single source of truth for feature gating based on subscription plan.
 * Uses credit system for metering usage.
 */

import { prisma } from "@vayva/db";
import { CreditManager } from "@/lib/credits/credit-manager";

export async function checkFeatureAccess(
  storeId: string,
  feature: string,
): Promise<{ allowed: boolean; reason?: string; message?: string }> {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: {
      aiSubscription: true,
      creditAllocation: true,
    },
  });
  
  if (!store) {
    throw new Error("Store not found");
  }
  
  const plan = (store.plan as string) || null;
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
  // 2. NO ACTIVE SUBSCRIPTION CHECK
  // ============================================================================
  if (!plan && store.trialEndDate) {
    if (new Date() > store.trialEndDate && !store.trialExpired) {
      // Mark as expired
      await prisma.store.update({
        where: { id: storeId },
        data: { trialExpired: true },
      });

      return {
        allowed: false,
        reason: "trial_expired",
        message: "Your trial has expired. Please subscribe to continue.",
      };
    }

    // If already expired
    if (store.trialExpired) {
      return {
        allowed: false,
        reason: "trial_expired",
        message: "Your trial has ended. Subscribe to restore access.",
      };
    }
  }

  if (!plan) {
    return {
      allowed: false,
      reason: "no_subscription",
      message: "An active subscription is required. Please choose a plan.",
    };
  }

  // ============================================================================
  // 3. FEATURE-SPECIFIC GATING
  // ============================================================================

  // AUTOPILOT - PRO and PRO_PLUS
  if (feature === "autopilot" || feature === "autopilot_run") {
    if (!["PRO", "PRO_PLUS"].includes(plan)) {
      return {
        allowed: false,
        reason: "plan_restriction",
        message: "AI Autopilot is available on Pro plan and above.",
      };
    }
  }

  // INDUSTRY DASHBOARDS - PRO and PRO_PLUS
  if (feature === "industry_dashboards" || feature === "industry_specific_dashboard") {
    if (!["PRO", "PRO_PLUS"].includes(plan)) {
      return {
        allowed: false,
        reason: "plan_restriction",
        message: "Industry-specific dashboards (35+) are available on Pro plan and above.",
      };
    }
  }

  // MERGED INDUSTRY DASHBOARD - PRO_PLUS ONLY
  if (feature === "merged_industry_dashboard") {
    if (plan !== "PRO_PLUS") {
      return {
        allowed: false,
        reason: "plan_restriction",
        message: "Merged industry dashboard is available on Pro Plus plan only.",
      };
    }
  }

  // VISUAL WORKFLOW BUILDER - PRO_PLUS ONLY
  if (feature === "visual_workflow_builder") {
    if (plan !== "PRO_PLUS") {
      return {
        allowed: false,
        reason: "plan_restriction",
        message: "Visual workflow builder is available on Pro Plus plan only.",
      };
    }
  }

  // CUSTOM DOMAIN - PRO and PRO_PLUS
  if (feature === "custom_domain") {
    if (!["PRO", "PRO_PLUS"].includes(plan)) {
      return {
        allowed: false,
        reason: "plan_restriction",
        message: "Custom domain support is available on Pro plan and above.",
      };
    }
  }

  // DASHBOARD METRICS - Tiered widget limits (STARTER=6, PRO=10, PRO_PLUS=50)
  if (feature === "dashboard_metrics") {
    const widgetLimits: Record<string, number> = { STARTER: 6, PRO: 10, PRO_PLUS: 50 };
    const maxWidgets = widgetLimits[plan] || 6;
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

  // PREDICTIVE INSIGHTS - PRO and PRO_PLUS
  if (feature === "predictive_insights") {
    if (!["PRO", "PRO_PLUS"].includes(plan)) {
      return {
        allowed: false,
        reason: "plan_restriction",
        message: "Predictive insights are available on Pro plan and above.",
      };
    }
  }

  // CUSTOM LAYOUTS - PRO and PRO_PLUS
  if (feature === "custom_layouts") {
    if (!["PRO", "PRO_PLUS"].includes(plan)) {
      return {
        allowed: false,
        reason: "plan_restriction",
        message: "Custom dashboard layouts are available on Pro plan and above.",
      };
    }
  }

  // TEMPLATE CHANGING - Tiered template limits
  if (feature === "template_change") {
    if (plan === "STARTER") {
      // 1 template included, can buy extras at ₦5,000 each
      const ownedCount = store.ownedTemplates?.length || 0;
      if (ownedCount >= 1) {
        return { allowed: true, reason: "requires_payment" };
      }
      return { allowed: true };
    }

    if (plan === "PRO") {
      // Can own 2 templates free, pay for 3rd+
      const ownedCount = store.ownedTemplates?.length || 0;
      if (ownedCount >= 2) {
        return { allowed: true, reason: "requires_payment" };
      }
      return { allowed: true };
    }

    if (plan === "PRO_PLUS") {
      // Can own 5 templates free, pay for 6th+
      const ownedCount = store.ownedTemplates?.length || 0;
      if (ownedCount >= 5) {
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
