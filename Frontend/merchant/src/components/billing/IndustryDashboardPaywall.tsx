'use client';

import React from 'react';
import { Button } from '@vayva/ui';
import { useRouter } from 'next/navigation';
import type { PlanTier } from '@/lib/access-control/tier-limits';

interface IndustryDashboardPaywallProps {
  currentTier: PlanTier;
  industry: string;
  onUpgradeClick?: () => void;
}

export function IndustryDashboardPaywall({
  currentTier,
  industry,
  onUpgradeClick
}: IndustryDashboardPaywallProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    } else {
      router.push('/dashboard/billing');
    }
  };

  return (
    <div className="flex items-center justify-center h-full min-h-[400px] p-6">
      <div className="max-w-md text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg 
              className="w-8 h-8 text-green-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Upgrade Required
          </h2>
          <p className="text-gray-500">
            Industry dashboards are only available for paid plans. 
            Upgrade to access the {industry} dashboard with advanced features.
          </p>
        </div>

        <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-gray-900 mb-2">What you'll get:</h3>
          <ul className="space-y-1 text-sm text-gray-500">
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Industry-specific metrics and KPIs</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Benchmarking against similar businesses</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Advanced analytics and reporting</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Industry trend insights</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={handleUpgrade}
            size="lg"
            className="px-8"
          >
            Upgrade to Starter
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard')}
            size="lg"
          >
            Return to Main Dashboard
          </Button>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Current plan: {currentTier} • {currentTier === 'STARTER' ? 'Starter plan' : 'Paid plan'}
        </p>
      </div>
    </div>
  );
}