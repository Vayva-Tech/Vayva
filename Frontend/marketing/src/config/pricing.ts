/**
 * Vayva Pricing Configuration
 * DO NOT MODIFY PRICING WITHOUT EXPLICIT PRODUCT APPROVAL.
 *
 * This file is the single source of truth for all pricing, plans, and fees
 * across the Vayva platform (marketing, dashboard, and legal).
 */

export const PRICING_VERSION = "2025-12-26_v2";
export const CURRENCY = "NGN";

// Transaction Fees
export const FEES = {
  WITHDRAWAL_PERCENTAGE: 3, // 3% fee on every withdrawal
};

export type PlanKey = "starter" | "pro" | "pro_plus";

export type Plan = {
  key: PlanKey;
  name: string;
  monthlyAmount: number; // NGN (Total)
  tagline: string;
  trialDays?: number;
  bullets: string[];
  ctaLabel: string;
  featured?: boolean;
};

export const PLANS: Plan[] = [
  {
    key: "starter",
    name: "Starter",
    monthlyAmount: 25000,
    tagline: "For growing brands.",
    trialDays: 7,
    bullets: [
      "Up to 500 Products",
      "Vayva Automation (WhatsApp and Instagram)",
      "Storefront Setup",
      "Conversation Customization",
      "Remove Branding",
    ],
    ctaLabel: "Start Growing",
  },
  {
    key: "pro",
    name: "Pro",
    monthlyAmount: 35000,
    tagline: "High volume scaling.",
    bullets: [
      "Everything in Starter",
      "Advanced Conversation Customization",
      "Multi-Location Support",
      "API Access",
      "Dedicated Account Manager",
      "Custom Integrations",
    ],
    ctaLabel: "Scale Your Business",
    featured: true,
  },
  {
    key: "pro_plus",
    name: "Pro Plus",
    monthlyAmount: 50000,
    tagline: "Full power for operations-heavy businesses.",
    bullets: [
      "Everything in Pro",
      "Industry-specific operational tools",
      "Merged industry dashboard",
      "Visual workflow builder",
      "25,000 AI credits/mo",
      "5 team seats",
      "5 templates",
      "Priority support",
    ],
    ctaLabel: "Unlock Full Power",
  },
];

export function formatNGN(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateWithdrawalFee(amount: number): number {
  return (amount * FEES.WITHDRAWAL_PERCENTAGE) / 100;
}
