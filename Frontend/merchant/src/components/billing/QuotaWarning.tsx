'use client';

import React from 'react';
import { AlertTriangle, Ban, ArrowRight } from 'lucide-react';
import { PlanTier } from '@/lib/access-control/tier-limits';

interface QuotaWarningProps {
  resourceName: string;
  currentCount: number;
  maxCount: number | 'unlimited';
  planTier: PlanTier;
}

const PLAN_LABELS: Record<PlanTier, string> = {
  STARTER: 'Starter',
  PRO: 'Pro',
  PRO_PLUS: 'Pro Plus',
};

const NEXT_PLAN: Partial<Record<PlanTier, PlanTier>> = {
  STARTER: 'PRO',
  PRO: 'PRO_PLUS',
};

const PLAN_PRICES: Record<PlanTier, string> = {
  STARTER: '₦25,000',
  PRO: '₦35,000',
  PRO_PLUS: '₦50,000',
};

export function QuotaWarning({
  resourceName,
  currentCount,
  maxCount,
  planTier,
}: QuotaWarningProps) {
  // No warning needed for unlimited plans
  if (maxCount === 'unlimited') return null;

  const percentage = (currentCount / maxCount) * 100;
  const isAtLimit = currentCount >= maxCount;
  const isNearLimit = percentage >= 80 && !isAtLimit;

  // Hidden below 80%
  if (percentage < 80) return null;

  const nextPlan = NEXT_PLAN[planTier];

  if (isAtLimit) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-100">
            <Ban className="w-5 h-5 text-red-600" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-red-900">
              {resourceName} Limit Reached
            </h4>
            <p className="text-xs text-red-700 mt-0.5">
              You have reached the maximum of {maxCount.toLocaleString()} {resourceName.toLowerCase()} on the{' '}
              {PLAN_LABELS[planTier]} plan. You cannot create new {resourceName.toLowerCase()} until
              you upgrade or remove existing ones.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-xs text-red-700 font-medium">
              {currentCount.toLocaleString()} / {maxCount.toLocaleString()} used
            </div>
            <div className="w-32 h-2 bg-red-200 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>

          {nextPlan && (
            <a
              href="/dashboard/control-center/pro"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors whitespace-nowrap"
            >
              Upgrade to {PLAN_LABELS[nextPlan]} — {PLAN_PRICES[nextPlan]}/mo
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    );
  }

  // Warning state: 80-99%
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-5 py-3 flex items-center gap-4 flex-wrap">
      <div className="p-1.5 rounded-lg bg-yellow-100">
        <AlertTriangle className="w-4 h-4 text-yellow-600" />
      </div>

      <div className="flex-1 min-w-0 flex items-center gap-3">
        <p className="text-sm text-yellow-900">
          <span className="font-semibold">
            {resourceName} nearing limit:
          </span>{' '}
          {currentCount.toLocaleString()} / {maxCount.toLocaleString()} used ({percentage.toFixed(0)}%)
        </p>

        <div className="w-24 h-1.5 bg-yellow-200 rounded-full overflow-hidden hidden sm:block">
          <div
            className="h-full bg-yellow-500 rounded-full transition-all"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      {nextPlan && (
        <a
          href="/dashboard/control-center/pro"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-xl transition-colors whitespace-nowrap"
        >
          Upgrade to {PLAN_LABELS[nextPlan]}
          <ArrowRight className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}
