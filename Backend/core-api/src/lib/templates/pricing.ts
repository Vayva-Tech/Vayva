export type PlanTier = "free" | "growth" | "pro";
export type TemplateTier = "free" | "growth" | "pro";

export interface TemplateSwitchPrice {
  amount: number; // in kobo
  requiresPayment: boolean;
  reason: "first_selection" | "same_template" | "upgrade" | "switch";
}

export function calculateTemplateSwitchPrice(
  storePlan: PlanTier,
  currentTemplateId: string | null,
  newTemplateId: string,
  newTemplateTier: TemplateTier,
  firstTemplateSelectedAt: Date | null,
): TemplateSwitchPrice {
  // First template selection is always free
  if (!firstTemplateSelectedAt) {
    return {
      amount: 0,
      requiresPayment: false,
      reason: "first_selection",
    };
  }

  // Switching to same template is free
  if (currentTemplateId === newTemplateId) {
    return {
      amount: 0,
      requiresPayment: false,
      reason: "same_template",
    };
  }

  // Pro users pay ₦5,000 for any template
  if (storePlan === "pro") {
    return {
      amount: 500000, // ₦5,000 in kobo
      requiresPayment: true,
      reason: "switch",
    };
  }

  // Growth users
  if (storePlan === "growth") {
    // Switching to Pro template costs ₦10,000
    if (newTemplateTier === "pro") {
      return {
        amount: 1000000, // ₦10,000 in kobo
        requiresPayment: true,
        reason: "upgrade",
      };
    }

    // Switching to Growth template costs ₦5,000
    return {
      amount: 500000, // ₦5,000 in kobo
      requiresPayment: true,
      reason: "switch",
    };
  }

  // Free users cannot switch templates (should upgrade first)
  return {
    amount: 0,
    requiresPayment: false,
    reason: "same_template",
  };
}

export function formatPrice(amountInKobo: number): string {
  const naira = amountInKobo / 100;
  return `₦${naira.toLocaleString()}`;
}

export function normalizePlan(plan: string | null): PlanTier {
  const p = String(plan || "free").toLowerCase();
  if (p === "pro" || p === "business" || p === "enterprise") return "pro";
  if (p === "growth" || p === "starter") return "growth";
  return "free";
}
