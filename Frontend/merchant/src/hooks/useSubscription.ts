/**
 * Subscription Hooks
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getCurrentSubscription,
  getAvailableFeatures,
  getUsageMetrics,
  createCheckoutSession,
  createPortalSession,
  checkFeatureAccess,
} from '@/services/subscription';
import type {
  Subscription,
  SubscriptionFeatures,
  UsageMetrics,
  SubscriptionTier,
} from '@/services/subscription';

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  features: SubscriptionFeatures | null;
  usage: UsageMetrics | null;
  isLoading: boolean;
  error: Error | null;
  currentTier: SubscriptionTier;
  refresh: () => Promise<void>;
}

/**
 * useSubscription - Main hook for subscription data
 */
export function useSubscription(): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [features, setFeatures] = useState<SubscriptionFeatures | null>(null);
  const [usage, setUsage] = useState<UsageMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [subData, featData, usageData] = await Promise.all([
        getCurrentSubscription(),
        getAvailableFeatures(),
        getUsageMetrics(),
      ]);

      setSubscription(subData);
      setFeatures(featData);
      setUsage(usageData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch subscription data'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const currentTier: SubscriptionTier = subscription?.planKey || 'STARTER';

  return {
    subscription,
    features,
    usage,
    isLoading,
    error,
    currentTier,
    refresh: fetchData,
  };
}

interface UseFeatureAccessReturn {
  hasAccess: boolean;
  isTrialing: boolean;
  upgradeRequired: boolean;
  currentTier: SubscriptionTier;
  checkAccess: (featureKey: string) => Promise<boolean>;
}

/**
 * useFeatureAccess - Hook for checking feature access
 */
export function useFeatureAccess(): UseFeatureAccessReturn {
  const { features, currentTier } = useSubscription();
  const [isTrialing, setIsTrialing] = useState(false);

  const checkAccess = useCallback(
    async (featureKey: string): Promise<boolean> => {
      if (!features) {
        return false;
      }

      const hasAccess = features.features.includes(featureKey);
      return hasAccess;
    },
    [features]
  );

  useEffect(() => {
    // Check if currently in trial period
    setIsTrialing(currentTier !== 'FREE');
  }, [currentTier]);

  return {
    hasAccess: !!features,
    isTrialing,
    upgradeRequired: currentTier === 'FREE',
    currentTier,
    checkAccess,
  };
}

interface UseUpgradePromptReturn {
  canUpgrade: boolean;
  handleUpgrade: (targetTier: SubscriptionTier) => Promise<void>;
  handleManageBilling: () => Promise<void>;
  isProcessing: boolean;
}

/**
 * useUpgradePrompt - Hook for handling upgrade flows
 */
export function useUpgradePrompt(): UseUpgradePromptReturn {
  const { currentTier } = useSubscription();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgrade = useCallback(async (targetTier: SubscriptionTier) => {
    setIsProcessing(true);
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const result = await createCheckoutSession({
        planKey: targetTier,
        billingCycle: 'monthly',
        successUrl: `${appUrl}/dashboard/billing?success=true`,
        cancelUrl: `${appUrl}/dashboard/billing?canceled=true`,
      });

      if (result?.url) {
        window.location.href = result.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Upgrade failed:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleManageBilling = useCallback(async () => {
    setIsProcessing(true);
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const result = await createPortalSession({
        returnUrl: `${appUrl}/dashboard/billing`,
      });

      if (result?.url) {
        window.location.href = result.url;
      } else {
        throw new Error('Failed to create portal session');
      }
    } catch (error) {
      console.error('Failed to open billing portal:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const canUpgrade = currentTier !== 'PRO_PLUS';

  return {
    canUpgrade,
    handleUpgrade,
    handleManageBilling,
    isProcessing,
  };
}
