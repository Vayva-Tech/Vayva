/**
 * FeatureGate Component
 * 
 * Controls feature visibility based on subscription tier.
 * Ensures proper gating of PRO-only and paid features.
 * 
 * Usage:
 * <FeatureGate requiredPlan="PRO">
 *   <PremiumFeature />
 * </FeatureGate>
 * 
 * <FeatureGate requiredPlan="STARTER" upgradeRedirect>
 *   <AdvancedAnalytics />
 * </FeatureGate>
 */

'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Lock, Sparkles } from 'lucide-react';
import { Button } from '@vayva/ui';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export type PlanTier = 'STARTER' | 'PRO' | 'PRO_PLUS';

export interface FeatureGateProps {
  children: React.ReactNode;
  /** Minimum plan tier required to access this feature */
  requiredPlan: PlanTier | PlanTier[];
  /** Show fallback content if user doesn't have access */
  fallback?: React.ReactNode;
  /** Redirect to billing page if user doesn't have access */
  upgradeRedirect?: boolean;
  /** Custom message for locked state */
  lockMessage?: string;
  /** Show lock overlay instead of hiding content */
  showLockOverlay?: boolean;
  /** className for wrapper */
  className?: string;
}

const TIER_HIERARCHY: Record<PlanTier, number> = {
  STARTER: 0,
  PRO: 1,
  PRO_PLUS: 2,
};

function normalizePlan(plan: string | undefined): PlanTier {
  if (!plan) return 'STARTER';
  const normalized = String(plan).trim().toUpperCase();
  
  // Map various plan names to standard tiers
  if (normalized === 'PRO_PLUS' || normalized.includes('PRO+') || normalized === 'PROPLUS') return 'PRO_PLUS';
  if (normalized === 'PRO' || normalized.includes('PROFESSIONAL') || normalized.includes('PREMIUM')) return 'PRO';
  if (normalized === 'STARTER' || normalized.includes('BASIC')) return 'STARTER';
  
  return 'STARTER';
}

function hasAccess(userPlan: PlanTier, requiredPlan: PlanTier | PlanTier[]): boolean {
  const userTier = TIER_HIERARCHY[userPlan];
  
  if (Array.isArray(requiredPlan)) {
    // User needs at least one of the specified plans
    return requiredPlan.some(plan => TIER_HIERARCHY[plan] <= userTier);
  }
  
  // User needs at least the specified plan level
  return userTier >= TIER_HIERARCHY[requiredPlan];
}

export function FeatureGate({
  children,
  requiredPlan,
  fallback,
  upgradeRedirect = false,
  lockMessage,
  showLockOverlay = false,
  className,
}: FeatureGateProps): React.JSX.Element | null {
  const { merchant } = useAuth();
  const router = useRouter();
  
  const userPlan = normalizePlan(merchant?.plan);
  const canAccess = hasAccess(userPlan, requiredPlan);
  
  // Handle redirect
  React.useEffect(() => {
    if (!canAccess && upgradeRedirect) {
      const timer = setTimeout(() => {
        router.push('/dashboard/billing?upgrade=true');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [canAccess, upgradeRedirect, router]);
  
  if (canAccess) {
    return <>{children}</>;
  }
  
  // Custom fallback provided
  if (fallback) {
    return <>{fallback}</>;
  }
  
  // Show lock overlay
  if (showLockOverlay) {
    return (
      <div className={cn('relative', className)}>
        {children}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-2xl border border-gray-200">
          <LockedContentMessage 
            userPlan={userPlan} 
            requiredPlan={requiredPlan}
            customMessage={lockMessage}
          />
        </div>
      </div>
    );
  }
  
  // Default locked state
  return (
    <LockedContentMessage 
      userPlan={userPlan} 
      requiredPlan={requiredPlan}
      customMessage={lockMessage}
      showUpgradeButton
    />
  );
}

interface LockedContentMessageProps {
  userPlan: PlanTier;
  requiredPlan: PlanTier | PlanTier[];
  customMessage?: string;
  showUpgradeButton?: boolean;
}

function LockedContentMessage({
  userPlan,
  requiredPlan,
  customMessage,
  showUpgradeButton = false,
}: LockedContentMessageProps) {
  const requiredPlans = Array.isArray(requiredPlan) ? requiredPlan : [requiredPlan];
  const minRequiredPlan = requiredPlans.reduce((min, plan) => 
    TIER_HIERARCHY[plan] < TIER_HIERARCHY[min] ? plan : min
  );
  
  const defaultMessage = (
    <>
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-gray-100 rounded-xl">
          <Lock size={20} className="text-gray-500" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Feature not available
          </h3>
          <p className="text-sm text-gray-600">
            This feature requires {getPlanArticle(minRequiredPlan)} <span className="font-medium text-green-600">{minRequiredPlan}</span> plan or higher
          </p>
        </div>
      </div>
      
      {showUpgradeButton && (
        <Link href="/dashboard/billing?upgrade=true">
          <Button className="gap-2 bg-green-500 hover:bg-green-600 text-white rounded-xl">
            <Sparkles size={16} />
            Upgrade to {minRequiredPlan}
          </Button>
        </Link>
      )}
    </>
  );
  
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-2xl border border-gray-200">
      {customMessage || defaultMessage}
    </div>
  );
}

function getPlanArticle(plan: PlanTier): string {
  if (plan === 'PRO_PLUS') return 'a';
  if (plan === 'PRO') return 'a';
  return 'a';
}

/**
 * Hook to check feature access programmatically
 */
export function useFeatureAccess(requiredPlan: PlanTier | PlanTier[]): boolean {
  const { merchant } = useAuth();
  const userPlan = normalizePlan(merchant?.plan);
  return hasAccess(userPlan, requiredPlan);
}

/**
 * HOC wrapper for FeatureGate
 * 
 * @example
 * const ProtectedComponent = withFeatureGate(MyComponent, { requiredPlan: 'PRO' });
 */
export function withFeatureGate<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<FeatureGateProps, 'children'>
) {
  return function WithFeatureGate(props: P) {
    return (
      <FeatureGate {...options}>
        <Component {...props} />
      </FeatureGate>
    );
  };
}
