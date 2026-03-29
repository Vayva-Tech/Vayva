/**
 * FeatureGate Component
 * Hides or shows content based on subscription tier requirements
 */

import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import type { SubscriptionTier } from '@/services/subscription';

interface FeatureGateProps {
  children: React.ReactNode;
  requiredTier?: SubscriptionTier;
  featureKey?: string;
  fallback?: React.ReactNode;
  showMessage?: boolean;
}

const tierHierarchy: Record<SubscriptionTier, number> = {
  STARTER: 0,
  PRO: 1,
  PRO_PLUS: 2,
};

export function FeatureGate({
  children,
  requiredTier,
  featureKey,
  fallback,
  showMessage = true,
}: FeatureGateProps) {
  const { features, currentTier } = useSubscription();

  // Check if user has access based on tier
  const hasTierAccess = React.useMemo(() => {
    if (!requiredTier) return true;
    return tierHierarchy[currentTier] >= tierHierarchy[requiredTier];
  }, [currentTier, requiredTier]);

  // Check if user has access based on feature key
  const hasFeatureAccess = React.useMemo(() => {
    if (!featureKey || !features) return false;
    return features.features.includes(featureKey);
  }, [featureKey, features]);

  // Determine if access is granted
  const hasAccess = hasTierAccess && hasFeatureAccess;

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback === null || fallback === undefined) {
    if (!showMessage) {
      return null;
    }

    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
        <div className="mb-3 flex justify-center">
          <svg
            className="h-8 w-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-gray-900">
          {requiredTier ? `${requiredTier.replace('_', '+')} Plan Required` : 'Feature Not Available'}
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          {requiredTier
            ? `Upgrade to ${requiredTier.replace('_', '+')} to access this feature`
            : 'This feature is not available on your current plan'}
        </p>
        <div className="mt-4">
          <a
            href="/dashboard/billing"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View plans
            <svg
              className="ml-1 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        </div>
      </div>
    );
  }

  return <>{fallback}</>;
}
