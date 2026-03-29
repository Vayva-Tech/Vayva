/**
 * KPI Card Components
 * 
 * Reusable KPI cards for dashboard metrics display
 */

'use client';

import React from 'react';
import { cn, Icon, type IconName } from '@vayva/ui';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface KPICardProps {
  title: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  icon?: IconName;
  formatValue?: (value: number) => string;
  loading?: boolean;
  className?: string;
}

/**
 * Base KPI Card Component
 */
export function KPICard({
  title,
  value,
  change,
  changeLabel = 'vs last period',
  icon,
  formatValue = (v) => v.toString(),
  loading = false,
  className,
}: KPICardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;
  const isNeutral = change === 0 || change === undefined;

  return (
    <div
      className={cn(
        'rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </h3>
        {icon && (
          <Icon name={icon} className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        )}
      </div>

      {/* Value */}
      <div className="mt-4">
        {loading ? (
          <div className="h-8 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        ) : (
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {typeof value === 'number' ? formatValue(value) : value}
          </p>
        )}
      </div>

      {/* Change */}
      {change !== undefined && (
        <div className="mt-4 flex items-center gap-2">
          {isPositive && (
            <TrendingUp className="h-4 w-4 text-green-600" />
          )}
          {isNegative && (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
          {isNeutral && (
            <Minus className="h-4 w-4 text-gray-400" />
          )}
          
          <span
            className={cn(
              'text-sm font-medium',
              isPositive && 'text-green-600',
              isNegative && 'text-red-600',
              isNeutral && 'text-gray-400'
            )}
          >
            {isPositive && '+'}
            {loading ? (
              <span className="inline-block h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            ) : (
              `${change.toFixed(1)}%`
            )}
          </span>
          
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {changeLabel}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Revenue KPI Card (with currency formatting)
 */
export function RevenueKPICard(props: Omit<KPICardProps, 'formatValue'>) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <KPICard
      {...props}
      formatValue={formatCurrency}
      icon="DollarSign"
    />
  );
}

/**
 * Orders KPI Card
 */
export function OrdersKPICard(props: Omit<KPICardProps, 'icon'>) {
  return <KPICard {...props} icon="ShoppingCart" />;
}

/**
 * Customers KPI Card
 */
export function CustomersKPICard(props: Omit<KPICardProps, 'icon'>) {
  return <KPICard {...props} icon="Users" />;
}

/**
 * Conversion Rate KPI Card
 */
export function ConversionKPICard(props: Omit<KPICardProps, 'formatValue' | 'icon'>) {
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  return (
    <KPICard
      {...props}
      formatValue={formatPercentage}
      icon="Target"
    />
  );
}

/**
 * AOV (Average Order Value) KPI Card
 */
export function AOVPKICard(props: Omit<KPICardProps, 'formatValue' | 'icon'>) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <KPICard
      {...props}
      formatValue={formatCurrency}
      icon="TrendingUp"
    />
  );
}
