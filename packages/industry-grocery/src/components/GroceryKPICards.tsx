'use client';

/**
 * Grocery Industry KPI Cards Component
 * Displays grocery-specific key performance indicators including perishable tracking
 */

import React from 'react';
import { KPICard, type KPICardProps } from '@vayva/ui';

export interface GroceryKPICardsProps {
  revenue?: number;
  orders?: number;
  avgDeliveryTime?: number;
  perishableWaste?: number;
  inventoryAccuracy?: number;
  stockoutRate?: number;
  avgBasketSize?: number;
  onShelfAvailability?: number;
  className?: string;
}

export function GroceryKPICards({
  revenue = 0,
  orders = 0,
  avgDeliveryTime = 0,
  perishableWaste = 0,
  inventoryAccuracy = 0,
  stockoutRate = 0,
  avgBasketSize = 0,
  onShelfAvailability = 0,
  className,
}: GroceryKPICardsProps) {
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

  const formatMinutes = (value: number) => {
    return `${Math.round(value)} min`;
  };

  const getWasteVariant = (value: number): KPICardProps['variant'] => {
    if (value <= 2) return 'success';
    if (value <= 5) return 'default';
    return 'warning';
  };

  const getAvailabilityVariant = (value: number): KPICardProps['variant'] => {
    if (value >= 98) return 'success';
    if (value >= 95) return 'default';
    return 'warning';
  };

  const getStockoutVariant = (value: number): KPICardProps['variant'] => {
    if (value <= 2) return 'success';
    if (value <= 5) return 'default';
    return 'danger';
  };

  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 ${className || ''}`}>
      {/* Revenue */}
      <KPICard
        title="Revenue"
        value={formatCurrency(revenue)}
        trend={{
          value: 10.5,
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
          value: 14.2,
          label: 'vs last period',
        }}
        icon="shopping-cart"
        variant="default"
      />

      {/* Average Basket Size */}
      <KPICard
        title="Avg Basket Size"
        value={formatCurrency(avgBasketSize)}
        trend={{
          value: 5.8,
          label: 'vs last period',
        }}
        icon="shopping-basket"
        variant="default"
      />

      {/* Average Delivery Time */}
      <KPICard
        title="Avg Delivery Time"
        value={formatMinutes(avgDeliveryTime)}
        trend={{
          value: -(avgDeliveryTime - 30),
          label: 'lower is better',
        }}
        icon="clock"
        variant={avgDeliveryTime <= 30 ? 'success' : avgDeliveryTime <= 45 ? 'default' : 'warning'}
        description="Target: < 30 min"
      />

      {/* Perishable Waste */}
      <KPICard
        title="Perishable Waste"
        value={formatCurrency(perishableWaste)}
        trend={{
          value: -perishableWaste,
          label: 'lower is better',
        }}
        icon="alert-circle"
        variant={getWasteVariant(perishableWaste)}
        description="% of inventory value"
      />

      {/* Inventory Accuracy */}
      <KPICard
        title="Inventory Accuracy"
        value={formatPercentage(inventoryAccuracy)}
        trend={{
          value: inventoryAccuracy - 95,
          label: 'vs target',
        }}
        icon="check-square"
        variant={getAvailabilityVariant(inventoryAccuracy)}
        description="System vs physical count"
      />

      {/* On-Shelf Availability */}
      <KPICard
        title="On-Shelf Availability"
        value={formatPercentage(onShelfAvailability)}
        trend={{
          value: onShelfAvailability - 98,
          label: 'vs target',
        }}
        icon="package"
        variant={getAvailabilityVariant(onShelfAvailability)}
        description="Target: 98%+"
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
        description="Critical metric for groceries"
      />
    </div>
  );
}

export default GroceryKPICards;
