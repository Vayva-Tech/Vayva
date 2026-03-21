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
export const PLANS = [
  {
    key: "FREE",
    name: "Free",
    monthlyAmount: 0,
    tagline: "Start selling in minutes. Zero commitment.",
    bullets: [
      "1 Staff Seat",
      "4 Included Templates",
      "Basic Storefront",
      "Vayva Branding",
    ],
    ctaLabel: "Start Free",
  },
  {
    key: "STARTER",
    name: "Starter",
    monthlyAmount: 25000,
    baseAmount: 25000,
    trialDays: 7,
    tagline: "Grow without the busywork. AI handles your orders 24/7.",
    bullets: [
      "1 Staff Seat",
      "Up to 500 Products",
      "WhatsApp & Instagram Automation",
      "Remove Branding & Custom Domain",
    ],
    ctaLabel: "Upgrade to Starter",
    featured: true,
  },
  {
    key: "PRO",
    name: "Pro",
    monthlyAmount: 40000,
    baseAmount: 40000,
    trialDays: 7,
    tagline: "Scale with AI doing the heavy lifting. Your team, unlimited growth.",
    bullets: [
      "3 Staff Seats",
      "Multi-Location & API Access",
      "Dedicated Account Manager",
      "Custom Integrations",
    ],
    ctaLabel: "Upgrade to Pro",
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
