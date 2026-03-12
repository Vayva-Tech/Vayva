'use client';

import React from 'react';
import { Icon } from '@/components/ui/icon';

interface KPI {
  label: string;
  value: string;
  trend: number;
  trendLabel: string;
}

interface KPIRowProps {
  kpis: KPI[];
}

export function KPIRow({ kpis }: KPIRowProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-5 gap-4">
      {kpis.map((kpi, index) => (
        <div
          key={index}
          className="bg-background-secondary rounded-xl border border-border/40 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-text-tertiary font-medium">{kpi.label}</p>
            <Icon name="TrendingUp" size={14} className="text-success" />
          </div>
          <p className="text-2xl font-bold text-text-primary mb-1">{kpi.value}</p>
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-success">↑ {kpi.trend}%</span>
            <span className="text-xs text-text-tertiary">{kpi.trendLabel}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
