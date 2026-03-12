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
    trialDays: 7,
    tagline: "Start selling in minutes. Zero commitment.",
    bullets: [
      "No staff seats",
      "2 Included Templates",
      "Basic Storefront",
      "Standard Analytics",
    ],
    ctaLabel: "Start Free",
  },
  {
    key: "STARTER",
    name: "Starter",
    monthlyAmount: 25000,
    baseAmount: 25000,
    tagline: "Grow without the busywork. AI handles your orders 24/7.",
    bullets: [
      "1 Staff Seat",
      "5 Included Templates",
      "Service & Digital Modules",
      "Remove Branding",
    ],
    ctaLabel: "Upgrade to Starter",
    featured: true,
  },
  {
    key: "PRO",
    name: "Pro",
    monthlyAmount: 40000,
    baseAmount: 40000,
    tagline: "Scale with AI doing the heavy lifting. Your team, unlimited growth.",
    bullets: [
      "3 Staff Seats",
      "All Templates (Any Choice)",
      "Unlimited Everything",
      "Vayva Cut Pro Included",
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
