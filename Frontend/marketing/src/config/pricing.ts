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

export type PlanKey = "free" | "starter" | "pro";

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
    key: "free",
    name: "Free",
    monthlyAmount: 0,
    tagline: "Perfect for testing ideas.",
    bullets: [
      "4 Included Templates",
      "Basic Storefront",
      "Vayva Branding",
      "Standard Analytics",
    ],
    ctaLabel: "Start Free",
  },
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
    featured: true,
  },
  {
    key: "pro",
    name: "Pro",
    monthlyAmount: 40000,
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
