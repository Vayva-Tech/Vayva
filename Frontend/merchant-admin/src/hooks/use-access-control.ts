'use client';

/**
 * Access Control Hook
 * Provides feature availability checking and quota management
 */

import { useState, useEffect } from 'react';
import { useStore } from '@/providers/store-provider';
import { 
  PlanTier, 
  TierLimits, 
  TIER_LIMITS, 
  isFeatureAvailable, 
  getMaxItems, 
  hasExceededQuota,
  getRemainingQuota
} from './tier-limits';

interface UseAccessControlReturn {
  currentTier: PlanTier;
  isFeatureEnabled: (feature: keyof TierLimits) => boolean;
  getMaxItems: (feature: keyof TierLimits) => number | 'unlimited';
  hasExceededQuota: (feature: keyof TierLimits, currentUsage: number) => boolean;
  getRemainingQuota: (feature: keyof TierLimits, currentUsage: number) => number;
  canUpgrade: boolean;
  upgradeUrl: string;
}

export function useAccessControl(): UseAccessControlReturn {
  const { store } = useStore();
  const [currentTier, setCurrentTier] = useState<PlanTier>('FREE');

  useEffect(() => {
    if (store?.subscription?.plan) {
      // Normalize plan key to our tier system
      const planKey = store.subscription.plan.key.toUpperCase();
      if (planKey === 'FREE' || planKey === 'STARTER' || planKey === 'PRO') {
        setCurrentTier(planKey as PlanTier);
      } else {
        setCurrentTier('FREE'); // Fallback
      }
    }
  }, [store?.subscription?.plan]);

  const upgradeUrl = '/dashboard/billing';

  return {
    currentTier,
    isFeatureEnabled: (feature: keyof TierLimits) => 
      isFeatureAvailable(currentTier, feature),
    getMaxItems: (feature: keyof TierLimits) => 
      getMaxItems(currentTier, feature),
    hasExceededQuota: (feature: keyof TierLimits, currentUsage: number) => 
      hasExceededQuota(currentTier, feature, currentUsage),
    getRemainingQuota: (feature: keyof TierLimits, currentUsage: number) => 
      getRemainingQuota(currentTier, feature, currentUsage),
    canUpgrade: currentTier !== 'PRO',
    upgradeUrl
  };
}

/**
 * Higher-order component for feature gating
 */
export function withFeatureGate<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  feature: keyof TierLimits,
  fallback?: React.ReactNode
) {
  return function FeatureGatedComponent(props: P) {
    const { isFeatureEnabled } = useAccessControl();
    
    if (!isFeatureEnabled(feature)) {
      return fallback || null;
    }
    
    return <WrappedComponent {...props} />;
  };
}

/**
 * Hook for quota-aware operations
 */
export function useQuotaAwareOperation(feature: keyof TierLimits) {
  const accessControl = useAccessControl();
  const [usage, setUsage] = useState(0);

  const canPerformOperation = !accessControl.hasExceededQuota(feature, usage);
  const remaining = accessControl.getRemainingQuota(feature, usage);
  
  const incrementUsage = () => {
    if (canPerformOperation) {
      setUsage(prev => prev + 1);
    }
  };

  return {
    canPerformOperation,
    remaining,
    incrementUsage,
    usage,
    maxAllowed: accessControl.getMaxItems(feature)
  };
}