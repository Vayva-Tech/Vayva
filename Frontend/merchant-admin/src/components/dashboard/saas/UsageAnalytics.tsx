'use client';

import React from 'react';
import { UsageByEndpointChart } from './UsageByEndpointChart';
import type { UsageAnalytics as UsageAnalyticsType } from '@/types/saas-dashboard';

export function UsageAnalytics({ data: propData }: { data?: UsageAnalyticsType }) {
  // Mock data if not provided
  const data = propData || {
    totalApiCalls: 2840000,
    totalBandwidth: 847,
    byEndpoint: [
      { endpoint: '/api/v1/data', calls: 1192800, percentage: 42 },
      { endpoint: '/api/v1/users', calls: 795200, percentage: 28 },
      { endpoint: '/api/v1/reports', calls: 511200, percentage: 18 },
      { endpoint: '/api/v1/auth', calls: 340800, percentage: 12 },
    ],
    topConsumers: [],
    trends: [],
  };

  return (
    <div className="bg-background-secondary rounded-xl border border-border/40 p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Usage Analytics</h3>
      <div className="space-y-4">
        <div className="text-center py-6 bg-background-tertiary rounded-lg">
          <p className="text-3xl font-bold text-text-primary mb-1">{(data.totalApiCalls / 1000000).toFixed(2)}M</p>
          <p className="text-sm text-text-tertiary">API Calls (Last 24h)</p>
          <p className="text-xs text-text-secondary mt-2">Bandwidth: {data.totalBandwidth} GB</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-text-primary mb-3">Usage by Endpoint</h4>
          <UsageByEndpointChart data={data.byEndpoint} />
      </div>
    </div>
  );
}
