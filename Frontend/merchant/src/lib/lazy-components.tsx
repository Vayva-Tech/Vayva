// @ts-nocheck
'use client';

import dynamic from 'next/dynamic';
import { type ComponentType } from 'react';

/**
 * Dynamic import helper with loading and error states
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: {
    ssr?: boolean;
    loadingText?: string;
    errorText?: string;
  } = {}
) {
  const {
    ssr = true,
    loadingText = 'Loading...',
    errorText = 'Failed to load component',
  } = options;

  return dynamic<T>(
    () => importFn(),
    {
      ssr,
      loading: () => (
        <div className="flex items-center justify-center p-8">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary mx-auto"></div>
            <p className="text-sm text-gray-500">{loadingText}</p>
          </div>
        </div>
      ),
    }
  );
}

// Lazy load heavy chart components
export const TenantGrowthChartLazy = createLazyComponent(
  () => import('../components/dashboard/saas/TenantGrowthChart'),
  { ssr: false, loadingText: 'Loading chart...' }
);

export const UsageByEndpointChartLazy = createLazyComponent(
  () => import('../components/dashboard/saas/UsageByEndpointChart'),
  { ssr: false, loadingText: 'Loading chart...' }
);

// Lazy load entire dashboard sections
export const SaaSDashboardLazy = createLazyComponent(
  () => import('../components/dashboard/saas/SaaSDashboard'),
  { ssr: false, loadingText: 'Loading dashboard...' }
);

export const AIInsightsPanelLazy = createLazyComponent(
  () => import('../components/dashboard/saas/AIInsightsPanel'),
  { ssr: false, loadingText: 'Loading insights...' }
);
