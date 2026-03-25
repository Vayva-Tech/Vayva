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

export type PlanKey = "starter" | "pro" | "pro_plus";

/** How often the customer pays at checkout (public marketing checkout). */
export type BillingCycle = "monthly" | "quarterly";

/** Discount on the 3-month bundle vs paying monthly × 3. */
export const QUARTERLY_DISCOUNT_PERCENT = 20;

export type Plan = {
  key: PlanKey;
  name: string;
  monthlyAmount: number; // NGN (Total)
  tagline: string;
  trialDays?: number;
  promoBadge?: string;
  promoMonths?: number; // Number of free months
  bullets: string[];
  ctaLabel: string;
  checkoutHref: string;
  featured?: boolean;
};

/** When `STARTER_FIRST_MONTH_FREE` flag is off in Ops (Feature Flags). */
export const OFFER_COPY_CLASSIC = {
  primaryCta: "Start 7-day free trial",
  trialBadge: "7-day free trial on Starter & Pro",
  noCard: "No credit card required",
  cancelAnytime: "Cancel anytime",
  trialFootnote:
    "7-day free trial on Starter and Pro. Pro+ has no trial. Cancel anytime. No credit card required for trials. Starter and Pro are paid at checkout after trial when applicable.",
} as const;

/** When `STARTER_FIRST_MONTH_FREE` flag is on (default if flag row missing). */
export const OFFER_COPY_EXTENDED = {
  primaryCta: "Start your first month free",
  trialBadge: "First month free on Starter",
  noCard: "No credit card for Starter monthly",
  cancelAnytime: "Cancel anytime",
  trialFootnote:
    "Starter (monthly): first month free—create a merchant account at signup; no Paystack charge. Starter (quarterly), Pro, and Pro+ are paid at checkout. Pro includes a 7-day trial where our signup flow applies. Pro+ has no trial.",
} as const;

export type OfferCopyBundle =
  | typeof OFFER_COPY_CLASSIC
  | typeof OFFER_COPY_EXTENDED;

export function getOfferCopy(starterFirstMonthFree: boolean): OfferCopyBundle {
  return starterFirstMonthFree ? OFFER_COPY_EXTENDED : OFFER_COPY_CLASSIC;
}

const PRICING_FAQ_PAUSE_SUFFIX =
  " If you don't subscribe after a trial ends, your account is paused until you choose a plan.";

/** First FAQ on pricing (matches ops flag: extended vs 7-day trial). */
export function getPricingPrimaryFaq(starterFirstMonthFree: boolean): {
  question: string;
  answer: string;
} {
  const o = getOfferCopy(starterFirstMonthFree);
  return {
    question: starterFirstMonthFree
      ? "How does the Starter first month free work?"
      : "How does the Starter and Pro trial work?",
    answer: `${o.trialFootnote}${PRICING_FAQ_PAUSE_SUFFIX}`,
  };
}

/** JSON-LD `Offer.description` when the page highlights signup pricing. */
export function getSchemaOfferLine(starterFirstMonthFree: boolean): string {
  return starterFirstMonthFree
    ? "First month free on Starter (monthly) via merchant signup"
    : "7-day free trial on Starter and Pro via merchant signup; paid plans at checkout";
}

export function getLandingHeroTrustChips(starterFirstMonthFree: boolean): readonly string[] {
  const o = getOfferCopy(starterFirstMonthFree);
  return [o.trialBadge, o.noCard, "AI-powered automation"];
}

/** @deprecated Use getOfferCopy(useMarketingOffer().starterFirstMonthFree) in client UI */
export const OFFER_COPY = OFFER_COPY_EXTENDED;

/** Starter row presentation on pricing cards (ops flag drives mode). */
export function getStarterPlanPresentation(starterFirstMonthFree: boolean): Pick<
  Plan,
  "trialDays" | "promoBadge" | "ctaLabel"
> {
  if (starterFirstMonthFree) {
    return {
      trialDays: 30,
      promoBadge: "First month free",
      ctaLabel: "Start first month free",
    };
  }
  return {
    trialDays: 7,
    promoBadge: undefined,
    ctaLabel: "Start with Starter",
  };
}

export const PLANS: Plan[] = [
  {
    key: "starter",
    name: "Starter",
    monthlyAmount: 25000,
    tagline: "Grow without the busywork. AI handles your orders 24/7.",
    trialDays: 7,
    bullets: [
      "1 staff seat",
      "Up to 100 products",
      "WhatsApp and Instagram automation",
      "Remove Vayva branding (custom domain on Pro and above)",
    ],
    ctaLabel: "Start with Starter",
    checkoutHref: "/signup?plan=starter",
    featured: true,
  },
  {
    key: "pro",
    name: "Pro",
    monthlyAmount: 35000,
    tagline: "Scale with AI doing the heavy lifting. Your team, unlimited growth.",
    trialDays: 7,
    bullets: [
      "3 staff seats",
      "Up to 300 products",
      "Multi-location and API access",
      "Custom domain, dedicated account manager, and custom integrations",
    ],
    ctaLabel: "Choose Pro",
    checkoutHref: "/signup?plan=pro",
  },
  {
    key: "pro_plus",
    name: "Pro+",
    monthlyAmount: 50000,
    trialDays: 0,
    tagline: "Everything unlocked. Maximum power for serious businesses.",
    bullets: [
      "5 staff seats",
      "Up to 500 products",
      "Industry dashboards and merged industry view",
      "Visual workflow builder",
      "Priority support and higher AI credits",
    ],
    ctaLabel: "Choose Pro+",
    checkoutHref: "/signup?plan=pro_plus",
  },
];

export function formatNGN(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Total NGN charged for one quarter (3 months) after quarterly discount. */
export function getQuarterlyTotalNgn(monthlyNgn: number): number {
  return Math.round(
    monthlyNgn * 3 * (1 - QUARTERLY_DISCOUNT_PERCENT / 100),
  );
}

/** Amount due at checkout for this plan and billing cadence. */
export function getPlanPriceForCycle(
  monthlyAmount: number,
  cycle: BillingCycle,
): number {
  return cycle === "quarterly"
    ? getQuarterlyTotalNgn(monthlyAmount)
    : monthlyAmount;
}

/**
 * Amount charged through marketing Paystack checkout.
 * Starter + monthly is ₦0 only when ops flag `STARTER_FIRST_MONTH_FREE` is on (signup path).
 */
export function getCheckoutDueNgn(
  planKey: PlanKey,
  billingCycle: BillingCycle,
  starterFirstMonthFree: boolean,
): number {
  if (starterFirstMonthFree && planKey === "starter" && billingCycle === "monthly") {
    return 0;
  }
  const plan = PLANS.find((p) => p.key === planKey);
  if (!plan) return 0;
  return getPlanPriceForCycle(plan.monthlyAmount, billingCycle);
}

export function calculateWithdrawalFee(amount: number): number {
  return (amount * FEES.WITHDRAWAL_PERCENTAGE) / 100;
}
