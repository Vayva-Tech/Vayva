interface PlanLimits {
  slug: string;
  name: string;
  priceNgn: number;
  limits: {
    teamSeats: number;
    templatesAvailable: string;
    monthlyCampaignSends: number;
  };
  features: {
    approvals: boolean;
    inboxOps: boolean;
    reports: boolean;
    advancedAnalytics: boolean;
  };
}

interface PlanMap {
  STARTER: PlanLimits;
  GROWTH: PlanLimits;
  PRO: PlanLimits;
}

export const PLAN_LIMITS: PlanMap = {
    STARTER: {
        slug: "STARTER",
        name: "Starter",
        priceNgn: 0,
        limits: {
            teamSeats: 1,
            templatesAvailable: "basic_only",
            monthlyCampaignSends: 100,
        },
        features: {
            approvals: false,
            inboxOps: false,
            reports: false,
            advancedAnalytics: false,
        }
    },
    GROWTH: {
        slug: "GROWTH",
        name: "Growth",
        priceNgn: 15000,
        limits: {
            teamSeats: 5,
            templatesAvailable: "all",
            monthlyCampaignSends: 5000,
        },
        features: {
            approvals: false,
            inboxOps: true,
            reports: true,
            advancedAnalytics: true,
        }
    },
    PRO: {
        slug: "PRO",
        name: "Pro",
        priceNgn: 45000,
        limits: {
            teamSeats: 20,
            templatesAvailable: "all",
            monthlyCampaignSends: 50000,
        },
        features: {
            approvals: true,
            inboxOps: true,
            reports: true,
            advancedAnalytics: true,
        }
    }
};

export const getPlanLimits = (slug: keyof PlanMap | string): PlanLimits => {
    return PLAN_LIMITS[slug as keyof PlanMap] || PLAN_LIMITS.STARTER;
};
