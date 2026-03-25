/**
 * KPI Metrics Component
 * Shows the 5 key performance indicators for nightlife
 */

import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, Wine, Activity } from 'lucide-react';
import type { NightlifeMetrics } from '@vayva/industry-nightlife/types';

interface Props {
  metrics: NightlifeMetrics;
}

export function KPIMetrics({ metrics }: Props) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getTrendColor = (value: number) => {
    return value >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const getTrendIcon = (value: number) => {
    return value >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />;
  };

  const kpiCards = [
    {
      id: 'revenue',
      title: 'Revenue',
      value: formatCurrency(metrics.revenue),
      change: metrics.revenueChange,
      icon: DollarSign,
      color: 'cyan',
      live: true,
    },
    {
      id: 'covers',
      title: 'Covers',
      value: metrics.covers.toString(),
      change: metrics.coversChange,
      icon: Users,
      color: 'purple',
      live: true,
    },
    {
      id: 'vip',
      title: 'VIP Guests',
      value: metrics.vipCount.toString(),
      change: metrics.vipCountChange,
      icon: Wine,
      color: 'pink',
      live: true,
    },
    {
      id: 'bottles',
      title: 'Bottle Sales',
      value: metrics.bottleSales.toString(),
      change: metrics.bottleSalesChange,
      icon: Activity,
      color: 'green',
      live: true,
    },
    {
      id: 'occupancy',
      title: 'Occupancy',
      value: formatPercent(metrics.occupancyRate),
      change: metrics.occupancyChange,
      icon: Activity,
      color: 'blue',
      live: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {kpiCards.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.id}
            className="bg-[#252525] rounded-xl p-4 border border-gray-800 hover:border-cyan-500 transition-all duration-300 group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-400">{kpi.title}</h3>
              <div className={`p-2 rounded-lg bg-${kpi.color}-500/10`}>
                <Icon className={`w-4 h-4 text-${kpi.color}-500`} />
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-2xl font-bold text-white">{kpi.value}</p>
              
              <div className={`flex items-center ${getTrendColor(kpi.change || 0)}`}>
                {getTrendIcon(kpi.change || 0)}
                <span className="text-xs font-medium ml-1">
                  {Math.abs((kpi.change || 0) * 100).toFixed(1)}%
                </span>
              </div>
              
              {kpi.live && (
                <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    <span className="text-xs text-gray-500">Live</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
