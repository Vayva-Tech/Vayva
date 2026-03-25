'use client';
import { Button } from "@vayva/ui";

import React, { useState } from 'react';
import { Lock, Crown, ArrowRight, X } from 'lucide-react';
import { PlanTier } from '@/lib/access-control/tier-limits';

interface UpgradePromptProps {
  currentPlan: PlanTier;
  requiredPlan: PlanTier;
  featureName: string;
  featureDescription: string;
  variant?: 'inline' | 'modal' | 'banner';
  onClose?: () => void;
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

const PLAN_ORDER: Record<PlanTier, number> = {
  STARTER: 0,
  PRO: 1,
  PRO_PLUS: 2,
};

function PlanBadge({ tier, isCurrent }: { tier: PlanTier; isCurrent?: boolean }) {
  return (
    <span
      className={
        isCurrent
          ? 'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600'
          : 'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700'
      }
    >
      {isCurrent ? null : <Crown className="w-3 h-3" />}
      {PLAN_LABELS[tier]}
    </span>
  );
}

function InlineContent({
  currentPlan,
  requiredPlan,
  featureName,
  featureDescription,
}: Omit<UpgradePromptProps, 'variant' | 'onClose'>) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center space-y-4">
      <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
        <Lock className="w-5 h-5 text-gray-500" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-base font-bold text-gray-900">{featureName}</h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">{featureDescription}</p>
      </div>

      <div className="flex items-center justify-center gap-2">
        <PlanBadge tier={currentPlan} isCurrent />
        <ArrowRight className="w-4 h-4 text-gray-400" />
        <PlanBadge tier={requiredPlan} />
      </div>

      <a
        href="/dashboard/control-center/pro"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        Upgrade to {PLAN_LABELS[requiredPlan]} — {PLAN_PRICES[requiredPlan]}/mo
        <ArrowRight className="w-4 h-4" />
      </a>
    </div>
  );
}

function BannerContent({
  currentPlan,
  requiredPlan,
  featureName,
  featureDescription,
  onClose,
}: Omit<UpgradePromptProps, 'variant'>) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="p-1.5 rounded-lg bg-gray-100">
          <Lock className="w-4 h-4 text-gray-500" />
        </div>
        <div className="min-w-0">
          <span className="text-sm font-semibold text-gray-900">{featureName}</span>
          <span className="text-sm text-gray-500 ml-2 hidden sm:inline">{featureDescription}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <PlanBadge tier={currentPlan} isCurrent />
        <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
        <PlanBadge tier={requiredPlan} />
      </div>

      <a
        href="/dashboard/control-center/pro"
        className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors whitespace-nowrap"
      >
        Upgrade — {PLAN_PRICES[requiredPlan]}/mo
        <ArrowRight className="w-3.5 h-3.5" />
      </a>

      {onClose && (
        <Button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-200 transition-colors">
          <X className="w-4 h-4 text-gray-400" />
        </Button>
      )}
    </div>
  );
}

export function UpgradePrompt({
  currentPlan,
  requiredPlan,
  featureName,
  featureDescription,
  variant = 'inline',
  onClose,
}: UpgradePromptProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  // Don't show if user already has required plan or higher
  if (PLAN_ORDER[currentPlan] >= PLAN_ORDER[requiredPlan]) return null;

  if (variant === 'banner') {
    return (
      <BannerContent
        currentPlan={currentPlan}
        requiredPlan={requiredPlan}
        featureName={featureName}
        featureDescription={featureDescription}
        onClose={onClose ?? (() => setIsOpen(false))}
      />
    );
  }

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose ?? (() => setIsOpen(false))}
        />
        <div className="relative z-10 w-full max-w-md mx-4">
          <Button
            onClick={onClose ?? (() => setIsOpen(false))}
            className="absolute -top-2 -right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors z-20"
          >
            <X className="w-4 h-4 text-gray-500" />
          </Button>
          <InlineContent
            currentPlan={currentPlan}
            requiredPlan={requiredPlan}
            featureName={featureName}
            featureDescription={featureDescription}
          />
        </div>
      </div>
    );
  }

  // Default: inline
  return (
    <InlineContent
      currentPlan={currentPlan}
      requiredPlan={requiredPlan}
      featureName={featureName}
      featureDescription={featureDescription}
    />
  );
}

