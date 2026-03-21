/**
 * Tier-Based Access Control System
 * Defines feature availability and limitations for each plan tier
 */

export type PlanTier = 'FREE' | 'STARTER' | 'PRO';

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
  aiTokens: FeatureLimit;
  whatsappMessages: FeatureLimit;
  automationRules: FeatureLimit;
  
  // Marketing & Analytics
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
}

// Trial period configuration (in days)
export const TIER_TRIAL_PERIODS: Record<PlanTier, number> = {
  FREE: 0,   // Free plan has no trial (it's already free)
  STARTER: 7, // 7-day trial for Starter
  PRO: 7      // 7-day trial for Pro
};

export const TIER_LIMITS: Record<PlanTier, TierLimits> = {
  FREE: {
    products: { maxItems: 20, enabled: true },
    orders: { maxItems: 50, enabled: true, quota: 50 },
    customers: { maxItems: 100, enabled: true },
    teamMembers: { maxItems: 1, enabled: true },
    staffSeats: { maxItems: 1, enabled: true },
    aiTokens: { maxItems: 0, enabled: false, quota: 0 }, // No AI access for Free users
    whatsappMessages: { maxItems: 0, enabled: false, quota: 0 }, // No WhatsApp for Free users
    automationRules: { maxItems: 0, enabled: false },
    campaigns: { maxItems: 1, enabled: true },
    analyticsDepth: { maxItems: 30, enabled: true }, // Last 30 days
    customReports: { enabled: false },
    multiStore: { enabled: false },
    apiAccess: { enabled: false },
    customDomains: { enabled: false },
    prioritySupport: { enabled: false },
    removeBranding: { enabled: false },
    advancedAnalytics: { enabled: false },
    industryDashboards: { enabled: false } // Block industry dashboards for Free users
  },
  
  STARTER: {
    products: { maxItems: 500, enabled: true },
    orders: { maxItems: 500, enabled: true, quota: 500 },
    customers: { maxItems: 1000, enabled: true },
    teamMembers: { maxItems: 1, enabled: true },
    staffSeats: { maxItems: 1, enabled: true },
    aiTokens: { maxItems: 10000, enabled: true, quota: 10000 }, // AI available with quota
    whatsappMessages: { maxItems: 500, enabled: true, quota: 500 }, // WhatsApp available with quota
    automationRules: { maxItems: 3, enabled: true },
    campaigns: { maxItems: 5, enabled: true },
    analyticsDepth: { maxItems: 90, enabled: true }, // Last 90 days
    customReports: { enabled: false },
    multiStore: { enabled: false },
    apiAccess: { enabled: false },
    customDomains: { enabled: true },
    prioritySupport: { enabled: false },
    removeBranding: { enabled: true },
    advancedAnalytics: { enabled: true },
    industryDashboards: { enabled: true } // Allow industry dashboards for paid users
  },
  
  PRO: {
    products: { maxItems: 'unlimited', enabled: true },
    orders: { maxItems: 'unlimited', enabled: true, quota: 10000 },
    customers: { maxItems: 'unlimited', enabled: true },
    teamMembers: { maxItems: 3, enabled: true },
    staffSeats: { maxItems: 3, enabled: true },
    aiTokens: { maxItems: 100000, enabled: true, quota: 100000 },
    whatsappMessages: { maxItems: 5000, enabled: true, quota: 5000 },
    automationRules: { maxItems: 20, enabled: true },
    campaigns: { maxItems: 'unlimited', enabled: true },
    analyticsDepth: { maxItems: 365, enabled: true }, // Full year
    customReports: { enabled: true },
    multiStore: { enabled: true },
    apiAccess: { enabled: true },
    customDomains: { enabled: true },
    prioritySupport: { enabled: true },
    removeBranding: { enabled: true },
    advancedAnalytics: { enabled: true },
    industryDashboards: { enabled: true } // Allow industry dashboards for Pro users
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