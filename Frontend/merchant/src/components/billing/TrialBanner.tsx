// @ts-nocheck
'use client';

import React from 'react';
import { Clock, ArrowRight, AlertTriangle } from 'lucide-react';
import { PlanTier } from '@/lib/access-control/tier-limits';

interface TrialBannerProps {
  trialDaysRemaining: number;
  planTier: PlanTier;
}

const PLAN_LABELS: Record<PlanTier, string> = {
  STARTER: 'Starter',
  PRO: 'Pro',
  PRO_PLUS: 'Pro Plus',
};

const PLAN_PRICES: Record<PlanTier, string> = {
  STARTER: '₦25,000',
  PRO: '₦35,000',
  PRO_PLUS: '₦50,000',
};

export function TrialBanner({ trialDaysRemaining, planTier }: TrialBannerProps) {
  const isExpired = trialDaysRemaining <= 0;
  const isUrgent = trialDaysRemaining >= 1 && trialDaysRemaining <= 3;
  const isComfortable = trialDaysRemaining > 3;

  // Determine color scheme
  const colors = isExpired
    ? {
        bg: 'bg-red-50',
        border: 'border-red-200',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        title: 'text-red-900',
        text: 'text-red-700',
        cta: 'bg-red-600 hover:bg-red-700',
      }
    : isUrgent
      ? {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          title: 'text-yellow-900',
          text: 'text-yellow-700',
          cta: 'bg-yellow-600 hover:bg-yellow-700',
        }
      : {
          bg: 'bg-green-50',
          border: 'border-green-200',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          title: 'text-green-900',
          text: 'text-green-700',
          cta: 'bg-green-500 hover:bg-green-600',
        };

  const Icon = isExpired ? AlertTriangle : Clock;

  const getMessage = () => {
    if (isExpired) {
      return {
        title: 'Trial Expired',
        description: `Your ${PLAN_LABELS[planTier]} trial has ended. Subscribe now to keep your store running and retain all your data.`,
      };
    }
    if (isUrgent) {
      return {
        title: `Trial Ending Soon — ${trialDaysRemaining} day${trialDaysRemaining === 1 ? '' : 's'} left`,
        description: `Your ${PLAN_LABELS[planTier]} trial ends in ${trialDaysRemaining} day${trialDaysRemaining === 1 ? '' : 's'}. Subscribe to avoid any service interruption.`,
      };
    }
    return {
      title: `${trialDaysRemaining} days left in your trial`,
      description: `You're exploring the ${PLAN_LABELS[planTier]} plan. Subscribe anytime to lock in your settings and data.`,
    };
  };

  const message = getMessage();

  return (
    <div
      className={`${colors.bg} ${colors.border} border rounded-2xl px-5 py-3 flex items-center gap-4 flex-wrap`}
    >
      <div className={`p-1.5 rounded-lg ${colors.iconBg}`}>
        <Icon className={`w-4 h-4 ${colors.iconColor}`} />
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm ${colors.title}`}>
          <span className="font-semibold">{message.title}</span>
          <span className={`${colors.text} ml-1.5 hidden sm:inline`}>{message.description}</span>
        </p>
      </div>

      <a
        href="/dashboard/control-center/pro"
        className={`inline-flex items-center gap-1.5 px-4 py-2 ${colors.cta} text-white text-sm font-semibold rounded-xl transition-colors whitespace-nowrap`}
      >
        Subscribe Now — {PLAN_PRICES[planTier]}/mo
        <ArrowRight className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}
