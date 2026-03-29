'use client';

/**
 * Fashion Industry KPI Cards Component
 * Displays fashion-specific key performance indicators
 */

import React from 'react';
import { KPICard, type KPICardProps } from '@vayva/ui';

export interface FashionKPICardsProps {
  revenue?: number;
  orders?: number;
  unitsSold?: number;
  avgOrderValue?: number;
  returnRate?: number;
  sizeGuideUsage?: number;
  trendScore?: number;
  sellThroughRate?: number;
  className?: string;
}

export function FashionKPICards({
  revenue = 0,
  orders = 0,
  unitsSold = 0,
  avgOrderValue = 0,
  returnRate = 0,
  sizeGuideUsage = 0,
  trendScore = 0,
  sellThroughRate = 0,
  className,
}: FashionKPICardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getTrendVariant = (value: number): KPICardProps['variant'] => {
    if (value >= 80) return 'success';
    if (value >= 60) return 'default';
    return 'warning';
  };

  const getReturnRateVariant = (value: number): KPICardProps['variant'] => {
    if (value <= 5) return 'success';
    if (value <= 10) return 'default';
    return 'warning';
  };

  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 ${className || ''}`}>
      {/* Revenue */}
      <KPICard
        title="Revenue"
        value={formatCurrency(revenue)}
        trend={{
          value: 12.5,
          label: 'vs last period',
        }}
        icon="dollar-sign"
        variant="default"
      />

      {/* Orders */}
      <KPICard
        title="Orders"
        value={orders.toLocaleString()}
        trend={{
          value: 8.3,
          label: 'vs last period',
        }}
        icon="shopping-bag"
        variant="default"
      />

      {/* Units Sold */}
      <KPICard
        title="Units Sold"
        value={unitsSold.toLocaleString()}
        trend={{
          value: 15.2,
          label: 'vs last period',
        }}
        icon="package"
        variant="default"
      />

      {/* Average Order Value */}
      <KPICard
        title="Avg Order Value"
        value={formatCurrency(avgOrderValue)}
        trend={{
          value: 4.7,
          label: 'vs last period',
        }}
        icon="trending-up"
        variant="default"
      />

      {/* Return Rate */}
      <KPICard
        title="Return Rate"
        value={formatPercentage(returnRate)}
        trend={{
          value: -returnRate,
          label: 'lower is better',
        }}
        icon="rotate-ccw"
        variant={getReturnRateVariant(returnRate)}
        description="Industry avg: 8-12%"
      />

      {/* Size Guide Usage */}
      <KPICard
        title="Size Guide Usage"
        value={formatPercentage(sizeGuideUsage)}
        trend={{
          value: 5.2,
          label: 'vs last period',
        }}
        icon="ruler"
        variant={getTrendVariant(sizeGuideUsage)}
        description="Reduces returns by 30%"
      />

      {/* Trend Score */}
      <KPICard
        title="Trend Score"
        value={trendScore.toString()}
        trend={{
          value: 3.8,
          label: 'vs last period',
        }}
        icon="trending-up"
        variant={getTrendVariant(trendScore)}
        description="Based on external trends"
      />

      {/* Sell-Through Rate */}
      <KPICard
        title="Sell-Through Rate"
        value={formatPercentage(sellThroughRate)}
        trend={{
          value: 2.1,
          label: 'vs last period',
        }}
        icon="circle-help"
        variant={getTrendVariant(sellThroughRate)}
        description="Inventory efficiency"
      />
    </div>
  );
}

export default FashionKPICards;
