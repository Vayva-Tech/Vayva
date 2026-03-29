/**
 * Plan Definitions and Feature Matrix
 * 
 * Subscription tiers, features, and usage limits
 */

export type PlanType = 'starter' | 'pro' | 'pro_plus';

export interface PlanFeature {
  id: string;
  name: string;
  description?: string;
  available: boolean;
  limit?: number;
}

export interface PlanDefinition {
  id: PlanType;
  name: string;
  slug: string;
  description: string;
  price: {
    monthly: number;
    annual: number;
    currency: string;
  };
  features: Record<string, PlanFeature>;
  limits: {
    products?: number;
    orders?: number;
    storage?: number; // in GB
    teamMembers?: number;
    apiCalls?: number; // per month
  };
  badge?: string;
  popular?: boolean;
}

/**
 * Plan definitions
 */
export const PLANS: Record<PlanType, PlanDefinition> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    slug: 'starter-plan',
    description: 'Essential tools for small businesses getting started online',
    price: {
      monthly: 0,
      annual: 0,
      currency: 'NGN',
    },
    features: {
      basicDashboard: {
        id: 'basic_dashboard',
        name: 'Basic Dashboard',
        description: 'Revenue and orders tracking',
        available: true,
      },
      analytics: {
        id: 'analytics',
        name: 'Analytics',
        available: false,
      },
      aiInsights: {
        id: 'ai_insights',
        name: 'AI Insights',
        available: false,
      },
      realtimeUpdates: {
        id: 'realtime_updates',
        name: 'Real-time Updates',
        available: false,
      },
      customDomain: {
        id: 'custom_domain',
        name: 'Custom Domain',
        available: false,
      },
      whiteLabel: {
        id: 'white_label',
        name: 'White Label',
        available: false,
      },
    },
    limits: {
      products: 50,
      orders: 100, // per month
      storage: 1,
      teamMembers: 1,
      apiCalls: 1000,
    },
  },
  
  pro: {
    id: 'pro',
    name: 'Pro',
    slug: 'pro-plan',
    description: 'Advanced features for growing businesses',
    price: {
      monthly: 9900,
      annual: 99000,
      currency: 'NGN',
    },
    features: {
      basicDashboard: {
        id: 'basic_dashboard',
        name: 'Basic Dashboard',
        available: true,
      },
      analytics: {
        id: 'analytics',
        name: 'Advanced Analytics',
        available: true,
      },
      aiInsights: {
        id: 'ai_insights',
        name: 'AI Insights',
        available: true,
      },
      realtimeUpdates: {
        id: 'realtime_updates',
        name: 'Real-time Updates',
        available: true,
      },
      customDomain: {
        id: 'custom_domain',
        name: 'Custom Domain',
        available: true,
      },
      whiteLabel: {
        id: 'white_label',
        name: 'White Label',
        available: false,
      },
    },
    limits: {
      products: 500,
      orders: 1000,
      storage: 10,
      teamMembers: 5,
      apiCalls: 10000,
    },
    popular: true,
    badge: 'Most Popular',
  },
  
  pro_plus: {
    id: 'pro_plus',
    name: 'Pro+',
    slug: 'pro-plus-plan',
    description: 'Enterprise-grade features for established businesses',
    price: {
      monthly: 19900,
      annual: 199000,
      currency: 'NGN',
    },
    features: {
      basicDashboard: {
        id: 'basic_dashboard',
        name: 'Basic Dashboard',
        available: true,
      },
      analytics: {
        id: 'analytics',
        name: 'Advanced Analytics',
        available: true,
      },
      aiInsights: {
        id: 'ai_insights',
        name: 'AI Insights',
        available: true,
      },
      realtimeUpdates: {
        id: 'realtime_updates',
        name: 'Real-time Updates',
        available: true,
      },
      customDomain: {
        id: 'custom_domain',
        name: 'Custom Domain',
        available: true,
      },
      whiteLabel: {
        id: 'white_label',
        name: 'White Label',
        available: true,
      },
      predictiveAnalytics: {
        id: 'predictive_analytics',
        name: 'Predictive Analytics',
        available: true,
      },
      prioritySupport: {
        id: 'priority_support',
        name: 'Priority Support',
        available: true,
      },
    },
    limits: {
      products: undefined, // unlimited
      orders: undefined,
      storage: 100,
      teamMembers: undefined,
      apiCalls: 100000,
    },
  },
};

/**
 * Get plan by slug
 */
export function getPlanBySlug(slug: string): PlanDefinition | null {
  return Object.values(PLANS).find(plan => plan.slug === slug) || null;
}

/**
 * Check if feature is available for plan
 */
export function hasFeature(planId: PlanType, featureId: string): boolean {
  const plan = PLANS[planId];
  return plan?.features[featureId]?.available ?? false;
}

/**
 * Get feature limit for plan
 */
export function getFeatureLimit(planId: PlanType, limitKey: keyof PlanDefinition['limits']): number | undefined {
  const plan = PLANS[planId];
  return plan?.limits[limitKey];
}

/**
 * Check if limit is exceeded
 */
export function isLimitExceeded(
  planId: PlanType,
  limitKey: keyof PlanDefinition['limits'],
  currentValue: number
): boolean {
  const limit = getFeatureLimit(planId, limitKey);
  return limit !== undefined && currentValue >= limit;
}

/**
 * Get upgrade path from current plan
 */
export function getUpgradePath(currentPlan: PlanType): PlanType[] {
  const order: PlanType[] = ['starter', 'pro', 'pro_plus'];
  const currentIndex = order.indexOf(currentPlan);
  return order.slice(currentIndex + 1);
}
