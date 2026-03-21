import { useMemo } from 'react';
import { useAccessControl } from '@/hooks/use-access-control';
import type { PlanTier } from '@/lib/access-control/tier-limits';
import { canAccessIndustryDashboards, canUseAI, getAITokenQuota } from '@/lib/access-control/tier-limits';

/**
 * Hook for checking industry dashboard access and related permissions
 */
export function useIndustryAccess() {
  const { currentTier } = useAccessControl();

  const accessInfo = useMemo(() => {
    return {
      // Industry dashboard access
      canAccessIndustryDashboards: canAccessIndustryDashboards(currentTier),
      
      // AI feature access
      canUseAI: canUseAI(currentTier),
      aiTokenQuota: getAITokenQuota(currentTier),
      
      // Current tier information
      currentTier,
      
      // Upgrade information
      needsUpgrade: !canAccessIndustryDashboards(currentTier),
      upgradePath: currentTier === 'FREE' ? 'STARTER' : 'PRO',
      upgradeUrl: '/dashboard/billing'
    };
  }, [currentTier]);

  return accessInfo;
}

/**
 * Hook for checking specific feature access
 */
export function useFeatureAccess(feature: keyof ReturnType<typeof useAccessControl>) {
  const accessControl = useAccessControl();
  return accessControl[feature];
}

/**
 * Hook for checking if user is on a trial period
 */
export function useTrialStatus() {
  const { currentTier } = useAccessControl();
  
  // In a real implementation, this would check actual trial expiration
  // For now, we'll return trial information based on tier
  const trialInfo = {
    isOnTrial: currentTier === 'FREE', // Simplified logic
    trialDaysRemaining: currentTier === 'FREE' ? 14 : 0,
    trialEndDate: currentTier === 'FREE' ? 
      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : 
      null
  };

  return trialInfo;
}

/**
 * Hook for checking usage quotas
 */
export function useUsageQuotas() {
  const { currentTier } = useAccessControl();
  
  const quotas = {
    aiTokens: getAITokenQuota(currentTier),
    // Add other quotas as needed
  };

  return quotas;
}