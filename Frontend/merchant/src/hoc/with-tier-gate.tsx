import React from 'react';
import { useIndustryAccess } from '@/hooks/use-industry-access';

/**
 * Higher-Order Component for Tier-Based Feature Gating
 * 
 * Wraps components to conditionally render based on user's subscription tier
 */

interface WithTierGateProps {
  fallback?: React.ReactNode;
  requiredTier?: 'STARTER' | 'PRO';
  feature?: string;
}

/**
 * HOC to gate components based on tier requirements
 */
export function withTierGate<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithTierGateProps = {}
) {
  const { fallback = null, requiredTier, feature } = options;

  return function TierGatedComponent(props: P) {
    const { currentTier, canAccessIndustryDashboards, canUseAI } = useIndustryAccess();

    // Check tier requirements
    if (requiredTier) {
      const tierHierarchy: Record<string, number> = {
        'FREE': 0,
        'STARTER': 1,
        'PRO': 2
      };

      if (tierHierarchy[currentTier] < tierHierarchy[requiredTier]) {
        return fallback;
      }
    }

    // Check specific feature access
    if (feature) {
      switch (feature) {
        case 'industryDashboards':
          if (!canAccessIndustryDashboards) return fallback;
          break;
        case 'aiFeatures':
          if (!canUseAI) return fallback;
          break;
        default:
          // For other features, you'd implement specific checks
          break;
      }
    }

    return <WrappedComponent {...props} />;
  };
}

/**
 * Hook for conditional rendering based on tier access
 */
export function useTierGate(requiredTier?: 'STARTER' | 'PRO', feature?: string) {
  const { currentTier, canAccessIndustryDashboards, canUseAI } = useIndustryAccess();

  const tierHierarchy: Record<string, number> = {
    'FREE': 0,
    'STARTER': 1,
    'PRO': 2
  };

  const hasTierAccess = requiredTier 
    ? tierHierarchy[currentTier] >= tierHierarchy[requiredTier]
    : true;

  const hasFeatureAccess = feature 
    ? (feature === 'industryDashboards' ? canAccessIndustryDashboards : 
       feature === 'aiFeatures' ? canUseAI : true)
    : true;

  return {
    hasAccess: hasTierAccess && hasFeatureAccess,
    currentTier,
    requiredTier
  };
}

/**
 * Render prop component for tier gating
 */
export function TierGate({
  children,
  fallback = null,
  requiredTier,
  feature
}: {
  children: React.ReactNode | ((props: { hasAccess: boolean; currentTier: string }) => React.ReactNode);
  fallback?: React.ReactNode;
  requiredTier?: 'STARTER' | 'PRO';
  feature?: string;
}) {
  const { hasAccess, currentTier } = useTierGate(requiredTier, feature);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  if (typeof children === 'function') {
    return <>{children({ hasAccess, currentTier })}</>;
  }

  return <>{children}</>;
}

/**
 * Conditional wrapper component
 */
export function IfHasAccess({
  children,
  requiredTier,
  feature
}: {
  children: React.ReactNode;
  requiredTier?: 'STARTER' | 'PRO';
  feature?: string;
}) {
  const { hasAccess } = useTierGate(requiredTier, feature);
  
  return hasAccess ? <>{children}</> : null;
}

/**
 * Conditional wrapper for restricted content
 */
export function IfRestricted({
  children,
  fallback,
  requiredTier,
  feature
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
  requiredTier?: 'STARTER' | 'PRO';
  feature?: string;
}) {
  const { hasAccess } = useTierGate(requiredTier, feature);
  
  return hasAccess ? <>{children}</> : <>{fallback}</>;
}