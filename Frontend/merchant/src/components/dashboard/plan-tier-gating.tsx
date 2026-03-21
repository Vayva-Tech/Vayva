'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Lock, 
  Zap, 
  Star, 
  Crown, 
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import type { DashboardVariant } from '@/config/dashboard-universal-types';
import { PLAN_TIER_FEATURES } from '@/config/dashboard-universal-types';
import { cn } from '@/lib/utils';

interface PlanTierGateProps {
  variant: DashboardVariant;
  requiredVariant: DashboardVariant;
  featureName: string;
  children: React.ReactNode;
  onUpgradeClick?: () => void;
  className?: string;
}

/**
 * PlanTierGate - Component that conditionally renders content based on plan tier
 * Shows upgrade prompts for locked features
 */
export function PlanTierGate({
  variant,
  requiredVariant,
  featureName,
  children,
  onUpgradeClick,
  className
}: PlanTierGateProps) {
  const currentTierIndex = getTierIndex(variant);
  const requiredTierIndex = getTierIndex(requiredVariant);

  // If user has required tier or higher, show the feature
  if (currentTierIndex >= requiredTierIndex) {
    return <div className={className}>{children}</div>;
  }

  // Otherwise show upgrade prompt
  return (
    <div className={cn("relative", className)}>
      <div className="blur-sm pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <LockedFeatureOverlay
          currentVariant={variant}
          requiredVariant={requiredVariant}
          featureName={featureName}
          onUpgradeClick={onUpgradeClick}
        />
      </div>
    </div>
  );
}

interface LockedFeatureOverlayProps {
  currentVariant: DashboardVariant;
  requiredVariant: DashboardVariant;
  featureName: string;
  onUpgradeClick?: () => void;
}

function LockedFeatureOverlay({
  currentVariant,
  requiredVariant,
  featureName,
  onUpgradeClick
}: LockedFeatureOverlayProps) {
  const requiredConfig = PLAN_TIER_FEATURES[requiredVariant];
  
  return (
    <div className="bg-white  rounded-xl border border-gray-100 p-6 max-w-md mx-auto">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Lock className="h-12 w-12 text-yellow-500" />
        </div>
        
        <div>
          <h3 className="font-semibold text-lg mb-2">
            {featureName} Locked
          </h3>
          <p className="text-gray-500 text-sm">
            This feature requires the <span className="font-medium text-gray-900">{requiredVariant.charAt(0).toUpperCase() + requiredVariant.slice(1)}</span> plan
          </p>
        </div>

        <div className="bg-gray-100 rounded-lg p-4 text-left">
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            {requiredVariant.charAt(0).toUpperCase() + requiredVariant.slice(1)} Plan Features:
          </h4>
          <ul className="text-xs text-gray-500 space-y-1">
            {Object.entries(requiredConfig.features)
              .filter(([key, value]) => {
                // Only show meaningful features, not boolean flags
                if (typeof value === 'boolean') return value;
                if (Array.isArray(value)) return value.length > 0;
                return false;
              })
              .slice(0, 3)
              .map(([key]) => (
                <li key={key} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                  {formatFeatureName(key)}
                </li>
              ))}
          </ul>
        </div>

        <Button 
          onClick={onUpgradeClick}
          className="w-full group"
          variant="default"
        >
          <Crown className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
          Upgrade to {requiredVariant.charAt(0).toUpperCase() + requiredVariant.slice(1)}
          <ArrowUpRight className="h-4 w-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </Button>

        <p className="text-xs text-gray-400">
          Current plan: <Badge variant="secondary">{currentVariant}</Badge>
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Plan Tier Context Provider
// ---------------------------------------------------------------------------

interface PlanTierContextType {
  currentVariant: DashboardVariant;
  isFeatureEnabled: (feature: keyof typeof PLAN_TIER_FEATURES.basic.features) => boolean;
  getRequiredTier: (feature: keyof typeof PLAN_TIER_FEATURES.basic.features) => DashboardVariant;
  canUpgrade: boolean;
  onUpgradeClick?: () => void;
}

const PlanTierContext = React.createContext<PlanTierContextType | undefined>(undefined);

interface PlanTierProviderProps {
  children: React.ReactNode;
  currentVariant: DashboardVariant;
  canUpgrade?: boolean;
  onUpgradeClick?: () => void;
}

export function PlanTierProvider({
  children,
  currentVariant,
  canUpgrade = true,
  onUpgradeClick
}: PlanTierProviderProps) {
  const isFeatureEnabled = React.useCallback((feature: keyof typeof PLAN_TIER_FEATURES.basic.features) => {
    const tiers = ['basic', 'standard', 'advanced', 'pro'] as DashboardVariant[];
    const currentTierIndex = tiers.indexOf(currentVariant);
    
    // Check each tier from current upward to see if feature is enabled
    for (let i = currentTierIndex; i < tiers.length; i++) {
      const tier = PLAN_TIER_FEATURES[tiers[i]];
      const featureValue = tier.features[feature];
      
      if (featureValue === true || (Array.isArray(featureValue) && featureValue.length > 0)) {
        return true;
      }
    }
    
    return false;
  }, [currentVariant]);

  const getRequiredTier = React.useCallback((feature: keyof typeof PLAN_TIER_FEATURES.basic.features) => {
    const tiers = ['basic', 'standard', 'advanced', 'pro'] as DashboardVariant[];
    
    // Find the lowest tier that has this feature enabled
    for (const tier of tiers) {
      const tierConfig = PLAN_TIER_FEATURES[tier];
      const featureValue = tierConfig.features[feature];
      
      if (featureValue === true || (Array.isArray(featureValue) && featureValue.length > 0)) {
        return tier;
      }
    }
    
    return 'pro'; // Default to highest tier if not found
  }, []);

  const value = React.useMemo(() => ({
    currentVariant,
    isFeatureEnabled,
    getRequiredTier,
    canUpgrade,
    onUpgradeClick
  }), [currentVariant, isFeatureEnabled, getRequiredTier, canUpgrade, onUpgradeClick]);

  return (
    <PlanTierContext.Provider value={value}>
      {children}
    </PlanTierContext.Provider>
  );
}

export function usePlanTier() {
  const context = React.useContext(PlanTierContext);
  if (context === undefined) {
    throw new Error('usePlanTier must be used within a PlanTierProvider');
  }
  return context;
}

// ---------------------------------------------------------------------------
// Higher-Order Components
// ---------------------------------------------------------------------------

interface WithPlanTierProps {
  feature: keyof typeof PLAN_TIER_FEATURES.basic.features;
  fallback?: React.ReactNode;
}

/**
 * withPlanTier - HOC that wraps components with plan tier gating
 */
export function withPlanTier<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  { feature, fallback }: WithPlanTierProps
) {
  return function PlanTierWrappedComponent(props: P) {
    const { currentVariant, isFeatureEnabled, getRequiredTier, onUpgradeClick } = usePlanTier();
    
    if (isFeatureEnabled(feature)) {
      return <WrappedComponent {...props} />;
    }

    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <PlanTierGate
        variant={currentVariant}
        requiredVariant={getRequiredTier(feature)}
        featureName={formatFeatureName(feature)}
        onUpgradeClick={onUpgradeClick}
      >
        <WrappedComponent {...props} />
      </PlanTierGate>
    );
  };
}

// ---------------------------------------------------------------------------
// Hook-Based Feature Checking
// ---------------------------------------------------------------------------

/**
 * useFeatureGate - Hook that returns whether a feature is available and gating info
 */
export function useFeatureGate(feature: keyof typeof PLAN_TIER_FEATURES.basic.features) {
  const { currentVariant, isFeatureEnabled, getRequiredTier } = usePlanTier();
  
  const isEnabled = isFeatureEnabled(feature);
  const requiredTier = getRequiredTier(feature);
  
  return {
    isEnabled,
    requiredTier,
    currentVariant,
    isUpgradeRequired: !isEnabled
  };
}

/**
 * usePlanLimits - Hook that returns current plan limits
 */
export function usePlanLimits() {
  const { currentVariant } = usePlanTier();
  const config = PLAN_TIER_FEATURES[currentVariant];
  
  return {
    maxMetrics: config.features.maxMetrics,
    maxSections: config.features.maxSections,
    chartTypes: config.features.chartTypes,
    alertTypes: config.features.alertTypes,
    exportFormats: config.features.exportFormats,
    dataRetentionDays: config.limits.dataRetentionDays,
    apiRequestsPerHour: config.limits.apiRequestsPerHour,
    teamMembers: config.limits.teamMembers
  };
}

// ---------------------------------------------------------------------------
// Utility Components
// ---------------------------------------------------------------------------

interface FeatureBadgeProps {
  feature: keyof typeof PLAN_TIER_FEATURES.basic.features;
  variant?: 'default' | 'locked' | 'available';
  className?: string;
}

export function FeatureBadge({ feature, variant, className }: FeatureBadgeProps) {
  const { isFeatureEnabled, getRequiredTier } = usePlanTier();
  const isEnabled = isFeatureEnabled(feature);
  const requiredTier = getRequiredTier(feature);

  if (variant === 'locked' || (!variant && !isEnabled)) {
    return (
      <Badge 
        variant="secondary" 
        className={cn("gap-1.5", className)}
      >
        <Lock className="h-3 w-3" />
        {requiredTier} plan
      </Badge>
    );
  }

  if (variant === 'available' || (!variant && isEnabled)) {
    return (
      <Badge 
        variant="default" 
        className={cn("gap-1.5 bg-green-100 text-green-800 hover:bg-green-100", className)}
      >
        <Zap className="h-3 w-3" />
        Available
      </Badge>
    );
  }

  return null;
}

interface UpgradePromptProps {
  feature: keyof typeof PLAN_TIER_FEATURES.basic.features;
  title?: string;
  description?: string;
  className?: string;
}

export function UpgradePrompt({ 
  feature, 
  title, 
  description, 
  className 
}: UpgradePromptProps) {
  const { currentVariant, getRequiredTier, onUpgradeClick } = usePlanTier();
  const requiredTier = getRequiredTier(feature);
  
  if (currentVariant === requiredTier) return null;

  const config = PLAN_TIER_FEATURES[requiredTier];

  return (
    <Alert className={cn("border-yellow-200 bg-yellow-50", className)}>
      <Star className="h-4 w-4 text-yellow-600" />
      <AlertDescription>
        <div className="space-y-2">
          <h4 className="font-medium text-yellow-900">
            {title || `Unlock ${formatFeatureName(feature)}`}
          </h4>
          <p className="text-sm text-yellow-800">
            {description || `Upgrade to the ${requiredTier} plan to access this feature and:`}
          </p>
          
          <ul className="text-xs text-yellow-700 space-y-1 ml-4">
            {Object.entries(config.features)
              .filter(([key, value]) => {
                if (typeof value === 'boolean') return value;
                if (Array.isArray(value)) return value.length > 0;
                return false;
              })
              .slice(0, 3)
              .map(([key]) => (
                <li key={key} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-600"></div>
                  {formatFeatureName(key)}
                </li>
              ))}
          </ul>
          
          <Button 
            size="sm" 
            onClick={onUpgradeClick}
            className="mt-2 bg-yellow-600 hover:bg-yellow-700"
          >
            <Crown className="h-4 w-4 mr-2" />
            Upgrade to {requiredTier}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

function getTierIndex(variant: DashboardVariant): number {
  const tiers: DashboardVariant[] = ['basic', 'standard', 'advanced', 'pro'];
  return tiers.indexOf(variant);
}

function formatFeatureName(key: string): string {
  const names: Record<string, string> = {
    maxMetrics: 'More Metrics',
    maxSections: 'Additional Sections',
    chartTypes: 'Advanced Charts',
    alertTypes: 'Enhanced Alerts',
    exportFormats: 'Export Options',
    customSections: 'Custom Sections',
    advancedAnalytics: 'Advanced Analytics',
    aiInsights: 'AI Insights',
    customBranding: 'Custom Branding'
  };
  
  return names[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}