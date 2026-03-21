import { PLANS as CONFIG_PLANS } from "@/config/pricing";
export const PLAN_PRICING = {
  STARTER: CONFIG_PLANS.find((p) => p.key === "STARTER")?.monthlyAmount || 25000,
  PRO: CONFIG_PLANS.find((p) => p.key === "PRO")?.monthlyAmount || 40000,
};
export const PLANS = {
  FREE: {
    slug: "FREE",
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
  STARTER: {
    slug: "STARTER",
    name: "Starter",
    priceNgn: PLAN_PRICING.STARTER,
    limits: {
      teamSeats: 1,
      templatesAvailable: "limited",
      monthlyCampaignSends: 1000,
    },
    features: {
      approvals: false,
      inboxOps: true,
      reports: true,
      advancedAnalytics: true,
    },
  },
  PRO: {
    slug: "PRO",
    name: "Pro",
    priceNgn: PLAN_PRICING.PRO,
    limits: {
      teamSeats: 3,
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
