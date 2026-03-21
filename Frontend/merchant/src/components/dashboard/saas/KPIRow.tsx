'use client';

import React from 'react';
import { SaaSMetricCard } from './SaaSMetricCard';

interface KPIData {
  label: string;
  value: string | number;
  trend: 'up' | 'down' | 'neutral';
  trendValue: number;
  sparklineData?: number[];
  icon?: string;
}

interface KPIRowProps {
  metrics: KPIData[];
  className?: string;
}

export function KPIRow({ metrics, className = '' }: KPIRowProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 ${className}`}>
      {metrics.map((metric, index) => (
        <SaaSMetricCard
          key={index}
          label={metric.label}
          value={metric.value}
          trend={metric.trend}
          trendValue={metric.trendValue}
          sparklineData={metric.sparklineData}
          icon={metric.icon}
        />
      ))}
    </div>
  );
}
