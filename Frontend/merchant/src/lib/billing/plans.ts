export const PLANS = {
  FREE: {
    slug: "free",
    name: "Free",
    priceNgn: 0,
    quarterlyPriceNgn: 0,
    limits: {
      teamSeats: 1,
      monthlyCampaignSends: 0,
    },
    features: {
      approvals: false,
    },
  },
  STARTER: {
    slug: "starter",
    name: "Starter",
    priceNgn: 25000,
    quarterlyPriceNgn: 60000, // 3 months @ 20% off vs monthly × 3
    limits: {
      teamSeats: 1,
      monthlyCampaignSends: 1000,
    },
    features: {
      approvals: false,
    },
  },
  PRO: {
    slug: "pro",
    name: "Pro",
    priceNgn: 35000,
    quarterlyPriceNgn: 84000, // 3 months @ 20% off vs monthly × 3
    limits: {
      teamSeats: 3,
      monthlyCampaignSends: 10000,
    },
    features: {
      approvals: true,
    },
  },
  PRO_PLUS: {
    slug: "pro_plus",
    name: "Pro+",
    priceNgn: 50000,
    quarterlyPriceNgn: 120000, // 3 months @ 20% off vs monthly × 3
    limits: {
      teamSeats: 5,
      monthlyCampaignSends: 50000,
    },
    features: {
      approvals: true,
    },
  },
};

export type PlanKey = keyof typeof PLANS;
export type BillingCycle = "monthly" | "quarterly";

export function getPlanPrice(planKey: PlanKey, billingCycle: BillingCycle = "monthly"): number {
  const plan = PLANS[planKey];
  if (!plan) return 0;
  return billingCycle === "quarterly" ? plan.quarterlyPriceNgn : plan.priceNgn;
}
