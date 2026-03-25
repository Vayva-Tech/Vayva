"use client";
import { Button } from "@vayva/ui";

import React from "react";

export const MarketTrends: React.FC = () => {
  const indicators = [
    {
      label: 'Median Price',
      value: '$542K',
      change: '+8.2%',
      direction: 'up',
      description: 'YoY'
    },
    {
      label: 'Inventory',
      value: '2.4 months',
      change: '-12%',
      direction: 'down',
      description: 'from last month'
    },
    {
      label: 'Avg. DOM',
      value: '34 days',
      change: '-5 days',
      direction: 'up',
      description: 'from avg'
    },
    {
      label: 'Price/SqFt',
      value: '$285',
      change: '+6%',
      direction: 'up',
      description: 'YoY'
    }
  ];

  const neighborhoods = [
    { name: 'Downtown', status: 'hot', change: '+15%' },
    { name: 'Riverfront', status: 'hot', change: '+12%' },
    { name: 'Suburbs', status: 'warm', change: '+8%' },
    { name: 'Heights', status: 'warm', change: '+6%' },
    { name: 'Industrial District', status: 'cool', change: '-2%' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hot': return 'text-red-500';
      case 'warm': return 'text-orange-500';
      case 'cool': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="glass-panel p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Market Trends</h3>
        <Button className="glass-card px-3 py-1 text-sm hover:text-white transition-colors">
          Full Market Report
        </Button>
      </div>

      <h4 className="text-sm font-semibold mb-3 text-[var(--re-text-secondary)]">Market Indicators</h4>
      
      <div className="grid grid-cols-2 gap-3 mb-6">
        {indicators.map((indicator, index) => (
          <div key={index} className="glass-card p-3">
            <div className="text-xs text-[var(--re-text-tertiary)] mb-1">{indicator.label}</div>
            <div className="text-lg font-bold mb-1">{indicator.value}</div>
            <div className={`text-xs trend-indicator ${indicator.direction === 'up' ? 'up' : 'down'}`}>
              {indicator.change}
            </div>
            <div className="text-[10px] text-[var(--re-text-tertiary)] mt-1">{indicator.description}</div>
          </div>
        ))}
      </div>

      <h4 className="text-sm font-semibold mb-3 text-[var(--re-text-secondary)]">Neighborhood Performance</h4>
      
      <div className="space-y-2">
        {neighborhoods.map((neighborhood, index) => (
          <div key={index} className="flex justify-between items-center py-2 border-b border-[var(--re-accent-primary)]/10 last:border-0">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(neighborhood.status)} bg-current`} />
              <span className="text-sm">{neighborhood.name}</span>
            </div>
            <span className={`text-sm font-semibold ${getStatusColor(neighborhood.status)}`}>
              {neighborhood.change}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--re-accent-primary)]/20">
        <h4 className="text-sm font-semibold mb-2 text-[var(--re-text-secondary)]">Market Heatmap Preview</h4>
        <div className="h-32 bg-[var(--re-bg-tertiary)] rounded-lg flex items-center justify-center">
          <div className="text-center text-[var(--re-text-tertiary)] text-sm">
            <div className="text-2xl mb-2">🗺️</div>
            <div>Interactive heatmap visualization</div>
            <div className="text-xs mt-1">Hot: Downtown, Riverfront</div>
            <div className="text-xs">Warm: Suburbs, Heights</div>
            <div className="text-xs">Cool: Industrial District</div>
          </div>
        </div>
      </div>
    </div>
  );
};

