/**
 * Vayva Pricing Configuration
 * DO NOT MODIFY PRICING WITHOUT EXPLICIT PRODUCT APPROVAL.
 *
 * This file is the single source of truth for all pricing, plans, and fees
 * across the Vayva platform (marketing, dashboard, and legal).
 */
export const PRICING_VERSION = "2026-03-25_v5";
export const CURRENCY = "NGN";
// Transaction Fees
export const FEES = {
  WITHDRAWAL_PERCENTAGE: 3, // 3% fee on every withdrawal
};
export const PLANS = [
  {
    key: "STARTER",
    name: "Starter",
    monthlyAmount: 25000,
    baseAmount: 25000,
    trialDays: 7,
    tagline: "Grow without the busywork. AI handles your orders 24/7.",
    bullets: [
      "1 Staff Seat",
      "Up to 100 Products",
      "WhatsApp & Instagram Automation",
      "Remove Vayva Branding (Custom Domain from Pro)",
    ],
    ctaLabel: "Upgrade to Starter",
    featured: true,
  },
  {
    key: "PRO",
    name: "Pro",
    monthlyAmount: 35000,
    baseAmount: 35000,
    trialDays: 7,
    tagline: "Scale with AI doing the heavy lifting. Your team, unlimited growth.",
    bullets: [
      "3 Staff Seats",
      "Up to 300 Products",
      "Multi-Location & API Access",
      "Dedicated Account Manager",
      "Custom Integrations",
    ],
    ctaLabel: "Upgrade to Pro",
  },
  {
    key: "PRO_PLUS",
    name: "Pro+",
    monthlyAmount: 50000,
    baseAmount: 50000,
    trialDays: 0,
    tagline: "Everything unlocked. Maximum power for serious businesses.",
    bullets: [
      "5 Staff Seats",
      "Up to 500 Products",
      "Visual Workflow Builder",
      "Merged Industry View",
      "Priority Support & AI Autopilot",
    ],
    ctaLabel: "Upgrade to Pro+",
  },
];
export function formatNGN(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}
export function calculateWithdrawalFee(amount: number) {
  return (amount * FEES.WITHDRAWAL_PERCENTAGE) / 100;
}
