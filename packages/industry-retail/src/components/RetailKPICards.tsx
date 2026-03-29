'use client';

/**
 * Retail Industry KPI Cards Component
 * Displays retail-specific key performance indicators including omnichannel metrics
 */

import React from 'react';
import { KPICard, type KPICardProps } from '@vayva/ui';

export interface RetailKPICardsProps {
  revenue?: number;
  orders?: number;
  customers?: number;
  avgOrderValue?: number;
  inventoryTurnover?: number;
  sellThroughRate?: number;
  stockoutRate?: number;
  grossMarginReturn?: number;
  className?: string;
}

export function RetailKPICards({
  revenue = 0,
  orders = 0,
  customers = 0,
  avgOrderValue = 0,
  inventoryTurnover = 0,
  sellThroughRate = 0,
  stockoutRate = 0,
  grossMarginReturn = 0,
  className,
}: RetailKPICardsProps) {
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

  const formatRatio = (value: number) => {
    return value.toFixed(2) + 'x';
  };

  const getInventoryTurnoverVariant = (value: number): KPICardProps['variant'] => {
    if (value >= 12) return 'success'; // Good: monthly turnover
    if (value >= 6) return 'default'; // Average: bi-monthly
    return 'warning'; // Low: slow moving
  };

  const getSellThroughVariant = (value: number): KPICardProps['variant'] => {
    if (value >= 70) return 'success';
    if (value >= 50) return 'default';
    return 'warning';
  };

  const getStockoutVariant = (value: number): KPICardProps['variant'] => {
    if (value <= 2) return 'success';
    if (value <= 5) return 'default';
    return 'warning';
  };

  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 ${className || ''}`}>
      {/* Revenue */}
      <KPICard
        title="Revenue"
        value={formatCurrency(revenue)}
        trend={{
          value: 15.3,
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
          value: 12.7,
          label: 'vs last period',
        }}
        icon="shopping-cart"
        variant="default"
      />

      {/* Customers */}
      <KPICard
        title="Active Customers"
        value={customers.toLocaleString()}
        trend={{
          value: 8.9,
          label: 'vs last period',
        }}
        icon="users"
        variant="default"
      />

      {/* Average Order Value */}
      <KPICard
        title="Avg Order Value"
        value={formatCurrency(avgOrderValue)}
        trend={{
          value: 6.2,
          label: 'vs last period',
        }}
        icon="trending-up"
        variant="default"
      />

      {/* Inventory Turnover */}
      <KPICard
        title="Inventory Turnover"
        value={formatRatio(inventoryTurnover)}
        trend={{
          value: inventoryTurnover - 8,
          label: 'times per year',
        }}
        icon="refresh-cw"
        variant={getInventoryTurnoverVariant(inventoryTurnover)}
        description="Target: 12x/year"
      />

      {/* Sell-Through Rate */}
      <KPICard
        title="Sell-Through Rate"
        value={formatPercentage(sellThroughRate)}
        trend={{
          value: sellThroughRate - 60,
          label: 'vs target',
        }}
        icon="circle-help"
        variant={getSellThroughVariant(sellThroughRate)}
        description="Units sold / Units received"
      />

      {/* Stockout Rate */}
      <KPICard
        title="Stockout Rate"
        value={formatPercentage(stockoutRate)}
        trend={{
          value: -stockoutRate,
          label: 'lower is better',
        }}
        icon="alert-triangle"
        variant={getStockoutVariant(stockoutRate)}
        description="Target: < 2%"
      />

      {/* Gross Margin Return on Investment */}
      <KPICard
        title="GMROI"
        value={formatRatio(grossMarginReturn)}
        trend={{
          value: grossMarginReturn - 2.5,
          label: 'vs target',
        }}
        icon="dollar-sign"
        variant={grossMarginReturn >= 3 ? 'success' : grossMarginReturn >= 2 ? 'default' : 'warning'}
        description="Gross profit / Inventory cost"
      />
    </div>
  );
}

export default RetailKPICards;
