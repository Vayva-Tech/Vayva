'use client';

/**
 * Beauty Industry KPI Cards Component
 * Displays beauty salon/spa-specific key performance indicators including appointment metrics
 */

import React from 'react';
import { KPICard, type KPICardProps } from '@vayva/ui';

export interface BeautyKPICardsProps {
  revenue?: number;
  appointments?: number;
  noShowRate?: number;
  avgTicketValue?: number;
  retailSales?: number;
  clientRetention?: number;
  utilizationRate?: number;
  avgServiceTime?: number;
  className?: string;
}

export function BeautyKPICards({
  revenue = 0,
  appointments = 0,
  noShowRate = 0,
  avgTicketValue = 0,
  retailSales = 0,
  clientRetention = 0,
  utilizationRate = 0,
  avgServiceTime = 0,
  className,
}: BeautyKPICardsProps) {
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

  const getNoShowVariant = (value: number): KPICardProps['variant'] => {
    if (value <= 5) return 'success';
    if (value <= 10) return 'default';
    return 'danger';
  };

  const getRetentionVariant = (value: number): KPICardProps['variant'] => {
    if (value >= 80) return 'success';
    if (value >= 60) return 'default';
    return 'warning';
  };

  const getUtilizationVariant = (value: number): KPICardProps['variant'] => {
    if (value >= 85) return 'success';
    if (value >= 70) return 'default';
    return 'warning';
  };

  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 ${className || ''}`}>
      {/* Revenue */}
      <KPICard
        title="Total Revenue"
        value={formatCurrency(revenue)}
        trend={{
          value: 11.2,
          label: 'vs last period',
        }}
        icon="dollar-sign"
        variant="default"
      />

      {/* Appointments */}
      <KPICard
        title="Appointments"
        value={appointments.toLocaleString()}
        trend={{
          value: 9.5,
          label: 'vs last period',
        }}
        icon="calendar"
        variant="default"
      />

      {/* Average Ticket Value */}
      <KPICard
        title="Avg Ticket Value"
        value={formatCurrency(avgTicketValue)}
        trend={{
          value: 7.3,
          label: 'vs last period',
        }}
        icon="trending-up"
        variant="default"
      />

      {/* Retail Sales */}
      <KPICard
        title="Retail Sales"
        value={formatCurrency(retailSales)}
        trend={{
          value: 15.8,
          label: 'vs last period',
        }}
        icon="shopping-bag"
        variant="default"
        description="Product sales add-on"
      />

      {/* No-Show Rate */}
      <KPICard
        title="No-Show Rate"
        value={formatPercentage(noShowRate)}
        trend={{
          value: -noShowRate,
          label: 'lower is better',
        }}
        icon="user-x"
        variant={getNoShowVariant(noShowRate)}
        description="Target: < 5%"
      />

      {/* Client Retention */}
      <KPICard
        title="Client Retention"
        value={formatPercentage(clientRetention)}
        trend={{
          value: clientRetention - 70,
          label: 'vs target',
        }}
        icon="users"
        variant={getRetentionVariant(clientRetention)}
        description="Returning clients %"
      />

      {/* Staff Utilization */}
      <KPICard
        title="Staff Utilization"
        value={formatPercentage(utilizationRate)}
        trend={{
          value: utilizationRate - 75,
          label: 'vs target',
        }}
        icon="clock"
        variant={getUtilizationVariant(utilizationRate)}
        description="Billable hours %"
      />

      {/* Average Service Time */}
      <KPICard
        title="Avg Service Time"
        value={formatMinutes(avgServiceTime)}
        trend={{
          value: avgServiceTime - 45,
          label: 'minutes',
        }}
        icon="activity"
        variant="default"
        description="Per appointment"
      />
    </div>
  );
}

export default BeautyKPICards;
