/**
 * Tier-Based Access Control System
 * Defines feature availability and limitations for each plan tier
 */

export type PlanTier = 'STARTER' | 'PRO' | 'PRO_PLUS';

export interface FeatureLimit {
  maxItems?: number | 'unlimited';
  enabled: boolean;
  quota?: number; // Monthly usage quota
}

export interface TierLimits {
  // Core Commerce Features
  products: FeatureLimit;
  orders: FeatureLimit;
  customers: FeatureLimit;

  // Team & Collaboration
  teamMembers: FeatureLimit;
  staffSeats: FeatureLimit;

  // AI & Automation
  aiAutopilot: FeatureLimit;
  aiTokens: FeatureLimit;
  whatsappMessages: FeatureLimit;
  automationRules: FeatureLimit;

  // Credits & Templates
  credits: FeatureLimit;
  templates: FeatureLimit;

  // Dashboard & Analytics
  dashboardMetrics: FeatureLimit;
  financialCharts: FeatureLimit;
  campaigns: FeatureLimit;
  analyticsDepth: FeatureLimit;
  customReports: FeatureLimit;

  // Advanced Features
  multiStore: FeatureLimit;
  apiAccess: FeatureLimit;
  customDomains: FeatureLimit;
  prioritySupport: FeatureLimit;
  removeBranding: FeatureLimit;
  advancedAnalytics: FeatureLimit;

  // Industry Dashboard Access
  industryDashboards: FeatureLimit;

  // Pro Plus Features
  mergedIndustryDashboard: FeatureLimit;
  visualWorkflowBuilder: FeatureLimit;
}

// Trial period configuration (in days)
export const TIER_TRIAL_PERIODS: Record<PlanTier, number> = {
  STARTER: 7,   // 7-day trial for Starter
  PRO: 7,       // 7-day trial for Pro
  PRO_PLUS: 0   // No trial for Pro Plus
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
    templates: { maxItems: 1, enabled: true }, // 1 included, can buy extra at ₦5,000 each
    dashboardMetrics: { maxItems: 6, enabled: true }, // 6 widgets
    financialCharts: { enabled: true },
    campaigns: { maxItems: 5, enabled: true },
    analyticsDepth: { maxItems: 90, enabled: true }, // Last 90 days
    customReports: { enabled: false },
    multiStore: { enabled: false },
    apiAccess: { enabled: false },
    customDomains: { enabled: false }, // PRO only
    prioritySupport: { enabled: false },
    removeBranding: { enabled: true },
    advancedAnalytics: { enabled: true },
    industryDashboards: { enabled: false }, // PRO only
    mergedIndustryDashboard: { enabled: false },
    visualWorkflowBuilder: { enabled: false },
  },

  PRO: {
    products: { maxItems: 300, enabled: true },
    orders: { maxItems: 10000, enabled: true, quota: 10000 },
    customers: { maxItems: 'unlimited', enabled: true },
    teamMembers: { maxItems: 3, enabled: true },
    staffSeats: { maxItems: 3, enabled: true },
    aiAutopilot: { enabled: true },
    aiTokens: { maxItems: 100000, enabled: true, quota: 100000 },
    whatsappMessages: { maxItems: 5000, enabled: true, quota: 5000 },
    automationRules: { maxItems: 20, enabled: true },
    credits: { maxItems: 10000, enabled: true, quota: 10000 },
    templates: { maxItems: 2, enabled: true }, // 2 included, can buy 3rd+ at ₦5,000
    dashboardMetrics: { maxItems: 10, enabled: true }, // 10 widgets
    financialCharts: { enabled: true },
    campaigns: { maxItems: 'unlimited', enabled: true },
    analyticsDepth: { maxItems: 365, enabled: true }, // Full year
    customReports: { enabled: true },
    multiStore: { enabled: true },
    apiAccess: { enabled: true },
    customDomains: { enabled: true },
    prioritySupport: { enabled: true },
    removeBranding: { enabled: true },
    advancedAnalytics: { enabled: true },
    industryDashboards: { enabled: false }, // PRO_PLUS only
    mergedIndustryDashboard: { enabled: false }, // PRO_PLUS only
    visualWorkflowBuilder: { enabled: false }, // PRO_PLUS only
  },

  PRO_PLUS: {
    products: { maxItems: 500, enabled: true },
    orders: { maxItems: 'unlimited', enabled: true },
    customers: { maxItems: 'unlimited', enabled: true },
    teamMembers: { maxItems: 5, enabled: true },
    staffSeats: { maxItems: 5, enabled: true },
    aiAutopilot: { enabled: true },
    aiTokens: { maxItems: 200000, enabled: true, quota: 200000 },
    whatsappMessages: { maxItems: 10000, enabled: true, quota: 10000 },
    automationRules: { maxItems: 'unlimited', enabled: true },
    credits: { maxItems: 25000, enabled: true, quota: 25000 },
    templates: { maxItems: 5, enabled: true }, // 5 included
    dashboardMetrics: { maxItems: 'unlimited', enabled: true },
    financialCharts: { enabled: true },
    campaigns: { maxItems: 'unlimited', enabled: true },
    analyticsDepth: { maxItems: 365, enabled: true }, // Full year
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
  }
};

/**
 * Check if a feature is available for the given tier
 */
export function isFeatureAvailable(tier: PlanTier, feature: keyof TierLimits): boolean {
  return TIER_LIMITS[tier][feature].enabled;
}

/**
 * Get the maximum items allowed for a feature
 */
export function getMaxItems(tier: PlanTier, feature: keyof TierLimits): number | 'unlimited' {
  return TIER_LIMITS[tier][feature].maxItems ?? 0;
}

/**
 * Check if user has exceeded their quota
 */
export function hasExceededQuota(
  tier: PlanTier, 
  feature: keyof TierLimits, 
  currentUsage: number
): boolean {
  const limit = TIER_LIMITS[tier][feature];
  if (!limit.quota) return false;
  return currentUsage >= limit.quota;
}

/**
 * Get remaining quota for a feature
 */
export function getRemainingQuota(
  tier: PlanTier, 
  feature: keyof TierLimits, 
  currentUsage: number
): number {
  const limit = TIER_LIMITS[tier][feature];
  if (!limit.quota) return Infinity;
  return Math.max(0, limit.quota - currentUsage);
}

/**
 * Get trial period for a tier
 */
export function getTrialPeriod(tier: PlanTier): number {
  return TIER_TRIAL_PERIODS[tier];
}

/**
 * Check if a tier can access industry dashboards
 */
export function canAccessIndustryDashboards(tier: PlanTier): boolean {
  return TIER_LIMITS[tier].industryDashboards.enabled;
}

/**
 * Check if a tier can use AI features
 */
export function canUseAI(tier: PlanTier): boolean {
  return TIER_LIMITS[tier].aiTokens.enabled;
}

/**
 * Get AI token quota for a tier
 */
export function getAITokenQuota(tier: PlanTier): number {
  return TIER_LIMITS[tier].aiTokens.quota || 0;
}