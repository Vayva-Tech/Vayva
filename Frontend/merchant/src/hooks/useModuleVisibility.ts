import { useMemo } from 'react';

interface ModuleVisibilityContext {
  industry: string;
  planTier: string;
  enabledFeatures: string[];
}

interface ModuleVisibilityRule {
  moduleId: string;
  industries: string[]; // Empty = all industries
  minPlanTier?: 'STARTER' | 'PRO' | 'PRO_PLUS';
  requiredFeatures?: string[];
}

// Module Visibility Rules Configuration
const MODULE_VISIBILITY_RULES: ModuleVisibilityRule[] = [
  // ==================== COMMERCE MODULES ====================
  
  // POS - Retail, Restaurant, Grocery only
  {
    moduleId: 'pos',
    industries: ['retail', 'restaurant', 'grocery', 'convenience'],
    minPlanTier: 'STARTER',
  },
  
  // Kitchen Display System - Restaurant only, PRO+
  {
    moduleId: 'kds',
    industries: ['restaurant', 'cafe', 'bakery', 'food-truck'],
    minPlanTier: 'PRO_PLUS',
    requiredFeatures: ['kitchen-display'],
  },
  
  // Table Management - Restaurant, PRO+
  {
    moduleId: 'table-management',
    industries: ['restaurant', 'cafe'],
    minPlanTier: 'PRO_PLUS',
  },
  
  // Appointments - Beauty, Healthcare, Professional Services
  {
    moduleId: 'appointments',
    industries: ['beauty-wellness', 'healthcare', 'professional-services', 'fitness'],
    minPlanTier: 'STARTER',
  },
  
  // Inventory Management - Retail, Grocery
  {
    moduleId: 'inventory',
    industries: ['retail', 'grocery', 'automotive'],
    minPlanTier: 'STARTER',
  },
  
  // Bookings - Multiple industries
  {
    moduleId: 'bookings',
    industries: ['beauty-wellness', 'healthcare', 'fitness', 'education', 'automotive'],
    minPlanTier: 'STARTER',
  },
  
  // ==================== GROWTH MODULES ====================
  
  // Advanced Analytics - PRO+ only for all industries
  {
    moduleId: 'advanced-analytics',
    industries: [], // All industries
    minPlanTier: 'PRO_PLUS',
  },
  
  // Marketing Automation - PRO+ only
  {
    moduleId: 'marketing-automation',
    industries: [],
    minPlanTier: 'PRO_PLUS',
  },
  
  // Customer Segments - PRO only
  {
    moduleId: 'customer-segments',
    industries: [],
    minPlanTier: 'PRO',
  },
  
  // Loyalty Programs - Retail, Restaurant, Beauty (PRO+)
  {
    moduleId: 'loyalty-programs',
    industries: ['retail', 'restaurant', 'beauty-wellness'],
    minPlanTier: 'PRO_PLUS',
  },
  
  // ==================== MONEY MODULES ====================
  
  // Invoicing - Professional Services, Healthcare
  {
    moduleId: 'invoicing',
    industries: ['professional-services', 'healthcare', 'legal'],
    minPlanTier: 'STARTER',
  },
  
  // Insurance Claims - Healthcare only
  {
    moduleId: 'insurance-claims',
    industries: ['healthcare'],
    minPlanTier: 'PRO',
  },
  
  // Commission Tracking - Beauty, Real Estate
  {
    moduleId: 'commission-tracking',
    industries: ['beauty-wellness', 'real-estate'],
    minPlanTier: 'PRO',
  },
  
  // ==================== PLATFORM MODULES ====================
  
  // AI Tools - PRO+ only
  {
    moduleId: 'ai-tools',
    industries: [],
    minPlanTier: 'PRO_PLUS',
  },
  
  // Custom Reports - PRO+ only
  {
    moduleId: 'custom-reports',
    industries: [],
    minPlanTier: 'PRO_PLUS',
  },
  
  // API Access - PRO+ only
  {
    moduleId: 'api-access',
    industries: [],
    minPlanTier: 'PRO_PLUS',
  },
];

// Tier hierarchy helper
const TIER_LEVELS: Record<string, number> = {
  STARTER: 0,
  PRO: 1,
  PRO_PLUS: 2,
};

function getTierLevel(tier: string): number {
  return TIER_LEVELS[tier.toUpperCase()] ?? 0;
}

/**
 * Determine if a module should be visible based on industry, plan tier, and features
 */
export function shouldShowModule(
  moduleId: string,
  context: ModuleVisibilityContext
): boolean {
  const rule = MODULE_VISIBILITY_RULES.find(r => r.moduleId === moduleId);
  if (!rule) {
    // No rule = always show (fallback behavior)
    return true;
  }
  
  // Check industry restriction
  if (rule.industries.length > 0 && !rule.industries.includes(context.industry)) {
    return false;
  }
  
  // Check plan tier requirement
  if (rule.minPlanTier && getTierLevel(context.planTier) < getTierLevel(rule.minPlanTier)) {
    return false;
  }
  
  // Check required features
  if (rule.requiredFeatures?.some(f => !context.enabledFeatures.includes(f))) {
    return false;
  }
  
  return true;
}

/**
 * Get all visible modules for a given industry and plan tier
 */
export function getVisibleModules(
  industry: string,
  planTier: string,
  enabledFeatures: string[] = []
): string[] {
  const context: ModuleVisibilityContext = {
    industry,
    planTier,
    enabledFeatures,
  };
  
  return MODULE_VISIBILITY_RULES
    .filter(rule => shouldShowModule(rule.moduleId, context))
    .map(rule => rule.moduleId);
}

/**
 * React hook to determine module visibility
 * 
 * @example
 * ```tsx
 * const { isVisible, canUpgrade } = useModuleVisibility('kds', {
 *   industry: 'restaurant',
 *   planTier: 'PRO',
 *   enabledFeatures: ['kitchen-display']
 * });
 * 
 * if (isVisible) {
 *   return <KitchenDisplay />;
 * } else if (canUpgrade) {
 *   return <UpgradePrompt feature="KDS" />;
 * }
 * return null;
 * ```
 */
export function useModuleVisibility(
  industry: string,
  planTier: string,
  enabledFeatures: string[] = []
) {
  const context = useMemo(
    () => ({
      industry,
      planTier,
      enabledFeatures,
    }),
    [industry, planTier, enabledFeatures]
  );
  
  const visibleModules = useMemo(
    () => getVisibleModules(industry, planTier, enabledFeatures),
    [industry, planTier, enabledFeatures]
  );
  
  /**
   * Check if a specific module is visible
   */
  const isVisible = (moduleId: string): boolean => {
    return shouldShowModule(moduleId, context);
  };
  
  /**
   * Check if module is hidden due to plan tier (upgrade opportunity)
   */
  const isHiddenByPlan = (moduleId: string): boolean => {
    const rule = MODULE_VISIBILITY_RULES.find(r => r.moduleId === moduleId);
    if (!rule || !rule.minPlanTier) return false;
    
    return getTierLevel(planTier) < getTierLevel(rule.minPlanTier);
  };
  
  /**
   * Check if module is hidden due to industry (not applicable)
   */
  const isHiddenByIndustry = (moduleId: string): boolean => {
    const rule = MODULE_VISIBILITY_RULES.find(r => r.moduleId === moduleId);
    if (!rule || rule.industries.length === 0) return false;
    
    return !rule.industries.includes(industry);
  };
  
  /**
   * Get upgrade prompt message for hidden modules
   */
  const getUpgradeMessage = (moduleId: string): string | null => {
    const rule = MODULE_VISIBILITY_RULES.find(r => r.moduleId === moduleId);
    if (!rule) return null;
    
    if (rule.minPlanTier && getTierLevel(planTier) < getTierLevel(rule.minPlanTier)) {
      return `Upgrade to ${rule.minPlanTier.replace('_', '+')} to access this feature`;
    }
    
    if (rule.requiredFeatures?.length) {
      return 'Contact support to enable this feature';
    }
    
    return null;
  };
  
  return {
    visibleModules,
    isVisible,
    isHiddenByPlan,
    isHiddenByIndustry,
    getUpgradeMessage,
  };
}
