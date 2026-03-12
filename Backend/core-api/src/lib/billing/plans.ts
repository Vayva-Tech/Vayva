import { PLANS as CONFIG_PLANS } from "@/config/pricing";
export const PLAN_PRICING = {
  GROWTH: CONFIG_PLANS.find((p) => p.key === "GROWTH")?.monthlyAmount || 30000,
  PRO: CONFIG_PLANS.find((p) => p.key === "PRO")?.monthlyAmount || 40000,
};
export const PLANS = {
  STARTER: {
    slug: "STARTER",
    name: "Free",
    priceNgn: 0,
    limits: {
      teamSeats: 1,
      templatesAvailable: "limited",
      monthlyCampaignSends: 100,
    },
    features: {
      approvals: false,
      inboxOps: true,
      reports: true,
      advancedAnalytics: false,
    },
  },
  GROWTH: {
    slug: "GROWTH",
    name: "Starter",
    priceNgn: PLAN_PRICING.GROWTH,
    limits: {
      teamSeats: 2,
      templatesAvailable: "limited",
      monthlyCampaignSends: 1000,
    },
    features: {
      approvals: false,
      inboxOps: true,
      reports: true,
      advancedAnalytics: false,
    },
  },
  PRO: {
    slug: "PRO",
    name: "₦40,000",
    priceNgn: PLAN_PRICING.PRO,
    limits: {
      teamSeats: 5,
      templatesAvailable: "all",
      monthlyCampaignSends: 10000,
    },
    features: {
      approvals: true,
      inboxOps: true,
      reports: true,
      advancedAnalytics: true,
    },
  },
};
