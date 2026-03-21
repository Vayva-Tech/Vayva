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
  
  const plan = (store.plan as string) || "FREE";
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
  // 2. TRIAL EXPIRATION CHECK (FREE Plan Only)
  // ============================================================================
  if (plan === "FREE" && store.trialEndDate) {
    if (new Date() > store.trialEndDate && !store.trialExpired) {
      // Mark as expired
      await prisma.store.update({
        where: { id: storeId },
        data: { trialExpired: true },
      });
      
      return {
        allowed: false,
        reason: "trial_expired",
        message: "Your free trial has expired. Please upgrade to continue.",
      };
    }
    
    // If already expired
    if (store.trialExpired) {
      return {
        allowed: false,
        reason: "trial_expired",
        message: "Your free trial has ended. Upgrade to restore access.",
      };
    }
  }

  // ============================================================================
  // 3. FEATURE-SPECIFIC GATING
  // ============================================================================

  // AUTOPILOT - PRO ONLY
  if (feature === "autopilot" || feature === "autopilot_run") {
    if (plan !== "PRO") {
      return {
        allowed: false,
        reason: "plan_restriction",
        message: "AI Autopilot is available on Pro plan only.",
      };
    }
  }

  // INDUSTRY DASHBOARDS - STARTER+
  if (feature === "industry_dashboards" || feature === "industry_specific_dashboard") {
    if (plan === "FREE") {
      return {
        allowed: false,
        reason: "plan_restriction",
        message: "Industry-specific dashboards are available on Starter plan and above.",
      };
    }
  }

  // CUSTOM DOMAIN - STARTER+
  if (feature === "custom_domain") {
    if (plan === "FREE") {
      return {
        allowed: false,
        reason: "plan_restriction",
        message: "Custom domain support is available on Starter plan and above.",
      };
    }
  }

  // ADVANCED ANALYTICS - STARTER+
  if (feature === "advanced_analytics") {
    if (plan === "FREE") {
      return {
        allowed: false,
        reason: "plan_restriction",
        message: "Advanced analytics are available on Starter plan and above.",
      };
    }
  }

  // PREDICTIVE INSIGHTS - PRO ONLY
  if (feature === "predictive_insights") {
    if (plan !== "PRO") {
      return {
        allowed: false,
        reason: "plan_restriction",
        message: "Predictive insights are available on Pro plan only.",
      };
    }
  }

  // CUSTOM LAYOUTS - PRO ONLY
  if (feature === "custom_layouts") {
    if (plan !== "PRO") {
      return {
        allowed: false,
        reason: "plan_restriction",
        message: "Custom dashboard layouts are available on Pro plan only.",
      };
    }
  }

  // TEMPLATE CHANGING - FREE users cannot change after initial selection
  if (feature === "template_change") {
    if (plan === "FREE") {
      if (store.currentTemplateId) {
        return {
          allowed: false,
          reason: "plan_restriction",
          message: "Template changes require Starter plan or higher.",
        };
      }
      // First template selection is OK for FREE
      return { allowed: true };
    }
    
    if (plan === "STARTER") {
      // Can own max 2 templates (1 included + 1 paid)
      const ownedCount = store.ownedTemplates?.length || 0;
      if (ownedCount >= 2) {
        return {
          allowed: false,
          reason: "template_limit",
          message: "Maximum 2 templates on Starter plan. Upgrade to Pro for more.",
        };
      }
      // Second template costs credits
      return { allowed: true, reason: "requires_payment" };
    }
    
    if (plan === "PRO") {
      // Can own 2 templates free, pay for 3rd+
      const ownedCount = store.ownedTemplates?.length || 0;
      if (ownedCount >= 2) {
        return { allowed: true, reason: "requires_payment" };
      }
      return { allowed: true };
    }
  }

  // AI MESSAGING - Check credits for all plans except FREE trial
  if (feature === "ai_message" || feature === "whatsapp_ai") {
    if (plan === "FREE") {
      // FREE users get 100 messages during trial via Evolution API only
      const messagesSent = await getWhatsAppMessageCount(storeId);
      if (messagesSent >= 100) {
        return {
          allowed: false,
          reason: "limit_reached",
          message: "Free plan includes 100 AI messages. Upgrade to Starter for 5,000/month.",
        };
      }
      return { allowed: true };
    }
    
    // STARTER and PRO: Check credit balance
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
