'use client';

import React from 'react';
import { Button } from '@vayva/ui';
import { useRouter } from 'next/navigation';
import type { PlanTier } from '@/lib/access-control/tier-limits';

interface AIFeaturePaywallProps {
  currentTier: PlanTier;
  featureName?: string;
  onUpgradeClick?: () => void;
}

export function AIFeaturePaywall({
  currentTier,
  featureName = 'AI-powered features',
  onUpgradeClick
}: AIFeaturePaywallProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    } else {
      router.push('/dashboard/billing');
    }
  };

  return (
    <div className="flex items-center justify-center h-full min-h-[300px] p-6">
      <div className="max-w-md text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg 
              className="w-8 h-8 text-purple-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Upgrade Required
          </h2>
          <p className="text-gray-500">
            {featureName} are only available for paid plans. 
            Upgrade to unlock AI-powered automation and intelligence.
          </p>
        </div>

        <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-gray-900 mb-2">What you'll get:</h3>
          <ul className="space-y-1 text-sm text-gray-500">
            <li className="flex items-start gap-2">
              <span className="text-purple-500">✓</span>
              <span>24/7 automated customer service</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500">✓</span>
              <span>Smart order processing and fulfillment</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500">✓</span>
              <span>Intelligent inventory management</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500">✓</span>
              <span>AI-powered marketing recommendations</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={handleUpgrade}
            size="lg"
            className="px-8 bg-purple-500 hover:bg-purple-600"
          >
            Upgrade to Starter
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard')}
            size="lg"
          >
            Return to Dashboard
          </Button>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Current plan: {currentTier} • {currentTier === 'STARTER' ? 'Starter plan' : 'Paid plan'}
        </p>
      </div>
    </div>
  );
}