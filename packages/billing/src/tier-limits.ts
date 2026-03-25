/**
 * Tier limits (aligned with merchant access control).
 * Lives in @vayva/billing so pricing logic does not depend on app path aliases.
 */

export type PlanTier = "STARTER" | "PRO" | "PRO_PLUS";

export interface FeatureLimit {
  maxItems?: number | "unlimited";
  enabled: boolean;
  quota?: number;
}

export interface TierLimits {
  products: FeatureLimit;
  orders: FeatureLimit;
  customers: FeatureLimit;
  teamMembers: FeatureLimit;
  staffSeats: FeatureLimit;
  aiAutopilot: FeatureLimit;
  aiTokens: FeatureLimit;
  whatsappMessages: FeatureLimit;
  automationRules: FeatureLimit;
  credits: FeatureLimit;
  templates: FeatureLimit;
  dashboardMetrics: FeatureLimit;
  financialCharts: FeatureLimit;
  campaigns: FeatureLimit;
  analyticsDepth: FeatureLimit;
  customReports: FeatureLimit;
  multiStore: FeatureLimit;
  apiAccess: FeatureLimit;
  customDomains: FeatureLimit;
  prioritySupport: FeatureLimit;
  removeBranding: FeatureLimit;
  advancedAnalytics: FeatureLimit;
  industryDashboards: FeatureLimit;
  mergedIndustryDashboard: FeatureLimit;
  visualWorkflowBuilder: FeatureLimit;
}

export const TIER_TRIAL_PERIODS: Record<PlanTier, number> = {
  STARTER: 7,
  PRO: 7,
  PRO_PLUS: 0,
};

export const TIER_LIMITS: Record<PlanTier, TierLimits> = {
  STARTER: {
    products: { maxItems: 100, enabled: true },
    orders: { maxItems: 500, enabled: true, quota: 500 },
    customers: { maxItems: 1000, enabled: true },
    teamMembers: { maxItems: 1, enabled: true },
    staffSeats: { maxItems: 1, enabled: true },
    aiAutopilot: { enabled: false },
    aiTokens: { maxItems: 10000, enabled: true, quota: 10000 },
    whatsappMessages: { maxItems: 500, enabled: true, quota: 500 },
    automationRules: { maxItems: 3, enabled: true },
    credits: { maxItems: 5000, enabled: true, quota: 5000 },
    templates: { maxItems: 1, enabled: true },
    dashboardMetrics: { maxItems: 6, enabled: true },
    financialCharts: { enabled: true },
    campaigns: { maxItems: 5, enabled: true },
    analyticsDepth: { maxItems: 90, enabled: true },
    customReports: { enabled: false },
    multiStore: { enabled: false },
    apiAccess: { enabled: false },
    customDomains: { enabled: false },
    prioritySupport: { enabled: false },
    removeBranding: { enabled: true },
    advancedAnalytics: { enabled: true },
    industryDashboards: { enabled: false },
    mergedIndustryDashboard: { enabled: false },
    visualWorkflowBuilder: { enabled: false },
  },
  PRO: {
    products: { maxItems: 300, enabled: true },
    orders: { maxItems: 10000, enabled: true, quota: 10000 },
    customers: { maxItems: "unlimited", enabled: true },
    teamMembers: { maxItems: 3, enabled: true },
    staffSeats: { maxItems: 3, enabled: true },
    aiAutopilot: { enabled: true },
    aiTokens: { maxItems: 100000, enabled: true, quota: 100000 },
    whatsappMessages: { maxItems: 5000, enabled: true, quota: 5000 },
    automationRules: { maxItems: 20, enabled: true },
    credits: { maxItems: 10000, enabled: true, quota: 10000 },
    templates: { maxItems: 2, enabled: true },
    dashboardMetrics: { maxItems: 10, enabled: true },
    financialCharts: { enabled: true },
    campaigns: { maxItems: "unlimited", enabled: true },
    analyticsDepth: { maxItems: 365, enabled: true },
    customReports: { enabled: true },
    multiStore: { enabled: true },
    apiAccess: { enabled: true },
    customDomains: { enabled: true },
    prioritySupport: { enabled: true },
    removeBranding: { enabled: true },
    advancedAnalytics: { enabled: true },
    industryDashboards: { enabled: false },
    mergedIndustryDashboard: { enabled: false },
    visualWorkflowBuilder: { enabled: false },
  },
  PRO_PLUS: {
    products: { maxItems: 500, enabled: true },
    orders: { maxItems: "unlimited", enabled: true },
    customers: { maxItems: "unlimited", enabled: true },
    teamMembers: { maxItems: 5, enabled: true },
    staffSeats: { maxItems: 5, enabled: true },
    aiAutopilot: { enabled: true },
    aiTokens: { maxItems: 200000, enabled: true, quota: 200000 },
    whatsappMessages: { maxItems: 10000, enabled: true, quota: 10000 },
    automationRules: { maxItems: "unlimited", enabled: true },
    credits: { maxItems: 25000, enabled: true, quota: 25000 },
    templates: { maxItems: 5, enabled: true },
    dashboardMetrics: { maxItems: "unlimited", enabled: true },
    financialCharts: { enabled: true },
    campaigns: { maxItems: "unlimited", enabled: true },
    analyticsDepth: { maxItems: 365, enabled: true },
    customReports: { enabled: true },
    multiStore: { enabled: true },
    apiAccess: { enabled: true },
    customDomains: { enabled: true },
    prioritySupport: { enabled: true },
    removeBranding: { enabled: true },
    advancedAnalytics: { enabled: true },
    industryDashboards: { enabled: true },
    mergedIndustryDashboard: { enabled: true },
    visualWorkflowBuilder: { enabled: true },
  },
};

export function isFeatureAvailable(
  tier: PlanTier,
  feature: keyof TierLimits,
): boolean {
  return TIER_LIMITS[tier][feature].enabled;
}

export function getMaxItems(
  tier: PlanTier,
  feature: keyof TierLimits,
): number | "unlimited" {
  return TIER_LIMITS[tier][feature].maxItems ?? 0;
}

export function hasExceededQuota(
  tier: PlanTier,
  feature: keyof TierLimits,
  currentUsage: number,
): boolean {
  const limit = TIER_LIMITS[tier][feature];
  if (!limit.quota) return false;
  return currentUsage >= limit.quota;
}

export function getRemainingQuota(
  tier: PlanTier,
  feature: keyof TierLimits,
  currentUsage: number,
): number {
  const limit = TIER_LIMITS[tier][feature];
  if (!limit.quota) return Infinity;
  return Math.max(0, limit.quota - currentUsage);
}

export function getTrialPeriod(tier: PlanTier): number {
  return TIER_TRIAL_PERIODS[tier];
}

export function canAccessIndustryDashboards(tier: PlanTier): boolean {
  return TIER_LIMITS[tier].industryDashboards.enabled;
}

export function canUseAI(tier: PlanTier): boolean {
  return TIER_LIMITS[tier].aiTokens.enabled;
}

export function getAITokenQuota(tier: PlanTier): number {
  return TIER_LIMITS[tier].aiTokens.quota || 0;
}

/** Map legacy or unknown plan keys from the DB to a known tier */
export function coercePlanTier(planKey: string): PlanTier {
  if (planKey === "PRO_PLUS") return "PRO_PLUS";
  if (planKey === "PRO") return "PRO";
  if (planKey === "STARTER" || planKey === "FREE") return "STARTER";
  return "STARTER";
}
