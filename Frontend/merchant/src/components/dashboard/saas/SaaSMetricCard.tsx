'use client';

import React, { memo } from 'react';
import { SparklineChart } from './SparklineChart';
import { TrendIndicator } from './TrendIndicator';
import { Icon } from '@/components/icon';

interface SaaSMetricCardProps {
  label: string;
  value: string | number;
  trend: 'up' | 'down' | 'neutral';
  trendValue: number;
  sparklineData?: number[];
  icon?: string;
  className?: string;
}

export const SaaSMetricCard = memo(function SaaSMetricCard({
  label,
  value,
  trend,
  trendValue,
  sparklineData,
  icon,
  className = '',
}: SaaSMetricCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
      if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <div 
      className={`bg-gray-50 rounded-xl border border-gray-100 p-4 hover:Hover transition-shadow focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 ${className}`}
      role="region"
      aria-label={`${label} metric`}
      tabIndex={0}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        {icon && (
          <Icon name={icon as any} size={14} className="text-green-600-primary" />
        )}
      </div>

      {/* Value */}
      <p className="text-2xl font-bold text-gray-900 mb-2">{formatValue(value)}</p>

      {/* Trend and Sparkline */}
      <div className="flex items-center justify-between">
        <TrendIndicator trend={trend} value={trendValue} />
        {sparklineData && sparklineData.length > 0 && (
          <SparklineChart data={sparklineData} height={35} />
        )}
      </div>
    </div>
  );
});
