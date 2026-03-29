/**
 * PlanBadge Component
 * Displays the current subscription tier with appropriate styling
 */

import React from 'react';
import { cn } from '@/lib/utils';

export type PlanTier = 'STARTER' | 'PRO' | 'PRO_PLUS';

interface PlanBadgeProps {
  tier: PlanTier;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const tierStyles: Record<PlanTier, string> = {
  STARTER: 'bg-blue-50 text-blue-700 border-blue-200',
  PRO: 'bg-purple-50 text-purple-700 border-purple-200',
  PRO_PLUS: 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 border-amber-200',
};

const tierLabels: Record<PlanTier, string> = {
  STARTER: 'Starter',
  PRO: 'Pro',
  PRO_PLUS: 'Pro+',
};

export function PlanBadge({ tier, size = 'md', className }: PlanBadgeProps) {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full border',
        tierStyles[tier],
        sizeStyles[size],
        className
      )}
    >
      {tier === 'PRO_PLUS' && (
        <svg
          className="w-4 h-4 mr-1"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      )}
      {tierLabels[tier]}
    </span>
  );
}
