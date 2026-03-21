// @ts-nocheck
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
          className="bg-gray-50 rounded-xl border border-gray-100 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-400 font-medium">{kpi.label}</p>
            <Icon name="TrendingUp" size={14} className="text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{kpi.value}</p>
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-green-600">↑ {kpi.trend}%</span>
            <span className="text-xs text-gray-400">{kpi.trendLabel}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
