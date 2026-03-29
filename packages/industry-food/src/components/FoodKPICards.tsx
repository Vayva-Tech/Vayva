'use client';

/**
 * Food Industry KPI Cards Component
 * Displays food delivery-specific key performance indicators
 */

import React from 'react';
import { KPICard, type KPICardProps } from '@vayva/ui';

export interface FoodKPICardsProps {
  revenue?: number;
  orders?: number;
  avgPrepTime?: number;
  avgDeliveryTime?: number;
  orderAccuracy?: number;
  customerSatisfaction?: number;
  className?: string;
}

export function FoodKPICards({
  revenue = 0,
  orders = 0,
  avgPrepTime = 0,
  avgDeliveryTime = 0,
  orderAccuracy = 0,
  customerSatisfaction = 0,
  className,
}: FoodKPICardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatMinutes = (value: number) => {
    return `${Math.round(value)} min`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(0)}%`;
  };

  const getPrepTimeVariant = (value: number): KPICardProps['variant'] => {
    if (value <= 15) return 'success';
    if (value <= 20) return 'default';
    return 'warning';
  };

  const getDeliveryTimeVariant = (value: number): KPICardProps['variant'] => {
    if (value <= 30) return 'success';
    if (value <= 40) return 'default';
    return 'warning';
  };

  const getQualityVariant = (value: number): KPICardProps['variant'] => {
    if (value >= 95) return 'success';
    if (value >= 90) return 'default';
    return 'warning';
  };

  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 ${className || ''}`}>
      {/* Revenue */}
      <KPICard
        title="Revenue"
        value={formatCurrency(revenue)}
        trend={{
          value: 18.5,
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
          value: 22.3,
          label: 'vs last period',
        }}
        icon="shopping-bag"
        variant="default"
      />

      {/* Average Prep Time */}
      <KPICard
        title="Avg Prep Time"
        value={formatMinutes(avgPrepTime)}
        trend={{
          value: -(avgPrepTime - 15),
          label: 'lower is better',
        }}
        icon="clock"
        variant={getPrepTimeVariant(avgPrepTime)}
        description="Target: < 15 min"
      />

      {/* Average Delivery Time */}
      <KPICard
        title="Avg Delivery Time"
        value={formatMinutes(avgDeliveryTime)}
        trend={{
          value: -(avgDeliveryTime - 30),
          label: 'lower is better',
        }}
        icon="truck"
        variant={getDeliveryTimeVariant(avgDeliveryTime)}
        description="Target: < 30 min"
      />

      {/* Order Accuracy */}
      <KPICard
        title="Order Accuracy"
        value={formatPercentage(orderAccuracy)}
        trend={{
          value: orderAccuracy - 95,
          label: 'vs target',
        }}
        icon="check-circle"
        variant={getQualityVariant(orderAccuracy)}
        description="Target: 98%+"
      />

      {/* Customer Satisfaction */}
      <KPICard
        title="Customer Satisfaction"
        value={formatPercentage(customerSatisfaction)}
        trend={{
          value: customerSatisfaction - 90,
          label: 'vs target',
        }}
        icon="star"
        variant={getQualityVariant(customerSatisfaction)}
        description="Based on reviews"
      />
    </div>
  );
}

export default FoodKPICards;
