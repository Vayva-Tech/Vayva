/**
 * UpgradePrompt Component
 * Displays upgrade prompts and CTAs
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { useUpgradePrompt, useSubscription } from '@/hooks/useSubscription';
import type { SubscriptionTier } from '@/services/subscription';

interface UpgradePromptProps {
  targetTier?: SubscriptionTier;
  title?: string;
  message?: string;
  variant?: 'inline' | 'banner' | 'modal';
  onUpgradeComplete?: () => void;
}

export function UpgradePrompt({
  targetTier = 'PRO',
  title,
  message,
  variant = 'inline',
  onUpgradeComplete,
}: UpgradePromptProps) {
  const { handleUpgrade, isProcessing } = useUpgradePrompt();
  const { currentTier } = useSubscription();

  const handleUpgradeClick = async () => {
    try {
      await handleUpgrade(targetTier);
      onUpgradeComplete?.();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const defaultTitle = `Upgrade to ${targetTier.replace('_', '+')}`;
  const defaultMessage = `Unlock advanced features and capabilities with the ${targetTier.replace('_', '+')} plan.`;

  if (variant === 'inline') {
    return (
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900">
              {title || defaultTitle}
            </h3>
            <p className="mt-1 text-sm text-blue-700">
              {message || defaultMessage}
            </p>
          </div>
          <Button
            onClick={handleUpgradeClick}
            disabled={isProcessing}
            size="sm"
            className="shrink-0"
          >
            {isProcessing ? 'Processing...' : 'Upgrade Now'}
          </Button>
        </div>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className="relative overflow-hidden rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 p-6">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <svg
                className="h-6 w-6 text-purple-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <h3 className="text-lg font-bold text-purple-900">
                {title || defaultTitle}
              </h3>
            </div>
            <p className="mt-2 text-sm text-purple-700">
              {message || defaultMessage}
            </p>
          </div>
          <Button
            onClick={handleUpgradeClick}
            disabled={isProcessing}
            size="lg"
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isProcessing ? 'Processing...' : `Upgrade to ${targetTier.replace('_', '+')}`}
          </Button>
        </div>
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg
            className="h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="grid-pattern"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M0 40L40 0H20L0 20M40 40V20L20 40"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-purple-600"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>
        </div>
      </div>
    );
  }

  return null;
}

interface UsageMeterProps {
  resource: 'products' | 'orders' | 'teamMembers';
  showLimit?: boolean;
}

/**
 * UsageMeter Component
 * Displays usage limits for a specific resource
 */
export function UsageMeter({ resource, showLimit = true }: UsageMeterProps) {
  const { usage } = useSubscription();

  if (!usage) {
    return (
      <div className="animate-pulse h-2 bg-gray-200 rounded-full" />
    );
  }

  const resourceUsage = usage.usage[resource];
  const percentage = resourceUsage.limit === -1
    ? 0 // Unlimited
    : Math.min((resourceUsage.current / resourceUsage.limit) * 100, 100);

  const getProgressColor = (pct: number) => {
    if (pct >= 90) return 'bg-red-500';
    if (pct >= 75) return 'bg-orange-500';
    if (pct >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700 capitalize">
          {resource.replace(/([A-Z])/g, ' $1').trim()}
        </span>
        {showLimit && (
          <span className="text-gray-600">
            {resourceUsage.current} /{' '}
            {resourceUsage.limit === -1 ? '∞' : resourceUsage.limit}
          </span>
        )}
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${getProgressColor(percentage)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {percentage >= 90 && (
        <p className="text-xs text-red-600 font-medium">
          You&apos;re approaching your limit. Consider upgrading your plan.
        </p>
      )}
    </div>
  );
}
