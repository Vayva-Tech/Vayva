'use client';

import React, { useMemo } from 'react';
import { useAggregateMetrics, useSubscriptionMetrics, useTenantGrowth, useChurnRisk, useFeatureFlags, useUsageAnalytics } from '@/hooks/use-saas-react-query';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { PlatformOverview } from './PlatformOverview';
import { KPIRow } from './KPIRow';
import { RecurringRevenue } from './RecurringRevenue';
import { TenantGrowth } from './TenantGrowth';
import { FeatureFlags } from './FeatureFlags';
import { UsageAnalytics } from './UsageAnalytics';
import { TenantHealth } from './TenantHealth';
import { ChurnRisk } from './ChurnRisk';
import { AIInsightsPanel } from './AIInsightsPanel';
import type { AggregateMetrics, KPIData } from '@/types/saas-dashboard';

interface SaaSDashboardProps {
  className?: string;
}

export function SaaSDashboard({ className = '' }: SaaSDashboardProps) {
  // Use React Query hooks for data fetching with caching
  const { data: aggregateData, loading: aggregateLoading, error } = useAggregateMetrics();
  const { data: subscriptionData } = useSubscriptionMetrics();
  const { data: tenantGrowthData } = useTenantGrowth();
  const { data: churnRiskData } = useChurnRisk();
  const { data: featureFlagsData } = useFeatureFlags();
  const { data: usageData } = useUsageAnalytics();

  // Memoize derived metrics for performance
  const mrrTrend = useMemo(() => {
    if (!aggregateData?.mrr) return 0;
    const { current, previousMonth } = aggregateData.mrr;
    return previousMonth > 0 ? ((current - previousMonth) / previousMonth) * 100 : 0;
  }, [aggregateData?.mrr]);

  if (aggregateLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <DashboardHeader heading="SaaS Metrics" text="Track MRR, churn, and product adoption" />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary mx-auto mb-4"></div>
            <p className="text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <DashboardHeader heading="SaaS Metrics" text="Track MRR, churn, and product adoption" />
        <div className="bg-error/10 border border-error/20 rounded-xl p-6 text-center">
          <p className="text-error font-medium">Failed to load dashboard</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <DashboardHeader
        heading="SaaS Metrics"
        text="Track MRR, churn, and product adoption"
      />

      {/* Platform Overview */}
      <PlatformOverview
        activeTenants={aggregateData?.activeTenants || 847}
        uptime={aggregateData?.platformStats?.uptime || 99.98}
        supportTickets={aggregateData?.platformStats?.supportTickets || 12}
      />

      {/* KPI Row - 5 Core Metrics */}
      <KPIRow
        metrics={[
          {
            label: 'MRR',
            value: aggregateData?.mrr?.current || 84200,
            trend: (aggregateData?.mrr?.growth || 0) >= 0 ? 'up' as const : 'down' as const,
            trendValue: aggregateData?.mrr?.growth || 12.8,
            sparklineData: [65000, 68000, 72000, 75000, 78000, 82000, 84200],
            icon: 'TrendingUp',
          },
          {
            label: 'ARR',
            value: aggregateData?.arr?.current || 1010000,
            trend: (aggregateData?.arr?.growth || 0) >= 0 ? 'up' as const : 'down' as const,
            trendValue: aggregateData?.arr?.growth || 15.3,
            sparklineData: [780000, 820000, 870000, 920000, 960000, 1000000, 1010000],
            icon: 'DollarSign',
          },
          {
            label: 'Churn',
            value: `${(aggregateData?.churnRate?.current || 2.4).toFixed(1)}%`,
            trend: aggregateData?.churnRate?.trend === 'down' ? 'down' as const : 'up' as const,
            trendValue: aggregateData?.churnRate?.trend === 'down' ? -0.8 : 0.8,
            sparklineData: [3.5, 3.2, 3.0, 2.8, 2.6, 2.5, 2.4],
            icon: 'TrendingDown',
          },
          {
            label: 'Active',
            value: aggregateData?.activeSubscriptions || 847,
            trend: 'up' as const,
            trendValue: 8.2,
            sparklineData: [620, 650, 690, 730, 770, 810, 847],
            icon: 'Users',
          },
          {
            label: 'LTV',
            value: aggregateData?.ltv?.average || 12450,
            trend: (aggregateData?.ltv?.growth || 0) >= 0 ? 'up' as const : 'down' as const,
            trendValue: aggregateData?.ltv?.growth || 18.4,
            sparklineData: [9500, 10000, 10500, 11000, 11500, 12000, 12450],
            icon: 'DollarSign',
          },
        ]}
      />

      {/* Content Grid - 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <RecurringRevenue />
          <FeatureFlags />
          <TenantHealth />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <TenantGrowth data={tenantGrowthData || undefined} />
          <UsageAnalytics data={usageData || undefined} />
          <ChurnRisk />
        </div>
      </div>

      {/* Pro Tier - AI Insights */}
      <AIInsightsPanel />
    </div>
  );
}
