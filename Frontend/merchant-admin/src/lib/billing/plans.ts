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
    quarterlyPriceNgn: 67500, // 3 months at ₦22,500/month (10% discounted)
    limits: {
      teamSeats: 1,
      monthlyCampaignSends: 100,
    },
    features: {
      approvals: false,
    },
  },
  PRO: {
    slug: "pro",
    name: "Pro",
    priceNgn: 40000,
    quarterlyPriceNgn: 108000, // 3 months at ₦36,000/month (10% discounted)
    limits: {
      teamSeats: 5,
      monthlyCampaignSends: 1000,
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
