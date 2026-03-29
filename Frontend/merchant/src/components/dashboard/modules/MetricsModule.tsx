"use client";

import React from 'react';
import { TrendingUp, ArrowUpRight, DollarSign, ShoppingCart, Users, Percent } from 'lucide-react';
import cn from 'clsx';

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  history?: Array<{ date: string; value: number }>;
  className?: string;
}

/**
 * Universal Metric Card - Adapts to any industry
 * Extracted from UniversalProDashboardV2
 */
export function MetricCard({
  label,
  value,
  change,
  trend = 'up',
  icon,
  history,
  className,
}: MetricCardProps) {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';
  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowUpRight : null;
  
  return (
    <div className={cn('bg-white rounded-2xl shadow-sm border border-gray-100 p-5', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            {icon && <span className="text-gray-400">{icon}</span>}
            <span className="text-sm font-medium text-gray-500">{label}</span>
          </div>
          
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            
            {change !== undefined && (
              <div className={cn('flex items-center gap-0.5 text-xs font-semibold', trendColor)}>
                {TrendIcon && <TrendIcon size={12} />}
                <span>{Math.abs(change)}%</span>
              </div>
            )}
          </div>
          
          {history && history.length > 0 && (
            <div className="h-8 flex items-end gap-1">
              {history.slice(-7).map((point, idx) => {
                const maxValue = Math.max(...history.map(h => h.value));
                const height = (point.value / maxValue) * 100;
                return (
                  <div
                    key={idx}
                    className="flex-1 bg-green-100 rounded-t"
                    style={{ height: `${height}%` }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Pre-configured metric cards for common use cases
 */
export function RevenueMetric({ value, change, history }: { value: number; change?: number; history?: any[] }) {
  return (
    <MetricCard
      label="Revenue"
      value={`₦${value.toLocaleString()}`}
      change={change}
      trend="up"
      icon={<DollarSign size={16} />}
      history={history}
    />
  );
}

export function OrdersMetric({ value, change }: { value: number; change?: number }) {
  return (
    <MetricCard
      label="Orders"
      value={value}
      change={change}
      trend="up"
      icon={<ShoppingCart size={16} />}
    />
  );
}

export function CustomersMetric({ value, change }: { value: number; change?: number }) {
  return (
    <MetricCard
      label="Customers"
      value={value}
      change={change}
      trend="up"
      icon={<Users size={16} />}
    />
  );
}

export function ConversionMetric({ value, change }: { value: number; change?: number }) {
  return (
    <MetricCard
      label="Conversion Rate"
      value={`${value.toFixed(1)}%`}
      change={change}
      trend="up"
      icon={<Percent size={16} />}
    />
  );
}

/**
 * Industry-specific metric presets
 */
export const IndustryMetrics = {
  restaurant: {
    kds: () => <MetricCard label="Active Tickets" value={24} change={12} trend="up" icon={<TrendingUp size={16} />} />,
    tableTurnover: () => <MetricCard label="Table Turnover" value="2.4h" change={-8} trend="down" />,
    averageTicket: () => <MetricCard label="Average Ticket" value="₦12,450" change={15} trend="up" />,
  },
  retail: {
    pos: () => <MetricCard label="POS Transactions" value={156} change={23} trend="up" />,
    inventory: () => <MetricCard label="Low Stock Items" value={8} change={-2} trend="up" />,
    footfall: () => <MetricCard label="Foot Traffic" value={342} change={18} trend="up" />,
  },
  beauty: {
    appointments: () => <MetricCard label="Today's Appointments" value={12} change={5} trend="up" />,
    retention: () => <MetricCard label="Client Retention" value="78%" change={3} trend="up" />,
    averageService: () => <MetricCard label="Avg Service Value" value="₦8,500" change={-5} trend="down" />,
  },
  healthcare: {
    patients: () => <MetricCard label="Patients Today" value={28} change={12} trend="up" />,
    waitTime: () => <MetricCard label="Avg Wait Time" value="18min" change={-15} trend="up" />,
    revenue: () => <MetricCard label="Monthly Revenue" value="₦2.4M" change={22} trend="up" />,
  },
};
