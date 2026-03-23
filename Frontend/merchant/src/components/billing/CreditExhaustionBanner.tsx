// @ts-nocheck
'use client';

import React from 'react';
import { AlertTriangle, Zap, ArrowRight } from 'lucide-react';
import { PlanTier } from '@/lib/access-control/tier-limits';

interface CreditExhaustionBannerProps {
  creditsRemaining: number;
  totalCredits: number;
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

export function CreditExhaustionBanner({
  creditsRemaining,
  totalCredits,
  planTier,
}: CreditExhaustionBannerProps) {
  if (totalCredits <= 0) return null;

  const percentage = (creditsRemaining / totalCredits) * 100;

  // Hidden when credits > 10%
  if (percentage > 10) return null;

  const isExhausted = creditsRemaining <= 0;
  const nextPlan = NEXT_PLAN[planTier];

  if (isExhausted) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-center gap-4 flex-wrap">
        <div className="p-2 rounded-xl bg-red-100">
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-red-900">Credits Exhausted</h4>
          <p className="text-xs text-red-700 mt-0.5">
            You have used all {totalCredits.toLocaleString()} credits this month. AI features and
            automations are paused until credits are replenished.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/dashboard/control-center/credits"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors whitespace-nowrap"
          >
            <Zap className="w-3.5 h-3.5" />
            Top Up Credits
          </a>

          {nextPlan && (
            <a
              href="/dashboard/control-center/pro"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors whitespace-nowrap"
            >
              Upgrade to {PLAN_LABELS[nextPlan]}
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    );
  }

  // Warning state: 1-10% remaining
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-5 py-3 flex items-center gap-4 flex-wrap">
      <div className="p-1.5 rounded-lg bg-yellow-100">
        <AlertTriangle className="w-4 h-4 text-yellow-600" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-yellow-900">
          <span className="font-semibold">Low Credits:</span>{' '}
          {creditsRemaining.toLocaleString()} of {totalCredits.toLocaleString()} remaining (
          {percentage.toFixed(0)}%)
        </p>
      </div>

      <div className="flex items-center gap-2">
        <a
          href="/dashboard/control-center/credits"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-semibold rounded-xl transition-colors whitespace-nowrap"
        >
          <Zap className="w-3 h-3" />
          Top Up
        </a>

        {nextPlan && (
          <a
            href="/dashboard/control-center/pro"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-xl transition-colors whitespace-nowrap"
          >
            Upgrade
            <ArrowRight className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}
