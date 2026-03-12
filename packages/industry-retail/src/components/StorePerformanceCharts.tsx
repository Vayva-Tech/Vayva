'use client';

import React from 'react';
import { GlassPanel, Button } from '@vayva/ui/components/fashion';

interface StorePerformance {
  id: string;
  name: string;
  revenue: number;
  growth: number;
  performancePercent: number;
  orders: number;
  avgOrderValue: number;
  conversionRate: number;
  status: 'open' | 'closed' | 'temporary';
}

interface StoreComparison {
  topPerformer: StorePerformance;
  lowestPerformer: StorePerformance;
  averageRevenue: number;
  totalStores: number;
}

export interface StorePerformanceChartsProps {
  stores?: StorePerformance[];
  comparison?: StoreComparison;
  timeRange?: '7d' | '30d' | '90d' | '1y';
  onTimeRangeChange?: (range: string) => void;
  onViewDetails?: (storeId: string) => void;
}

export const StorePerformanceCharts: React.FC<StorePerformanceChartsProps> = ({
  stores = [],
  comparison,
  timeRange = '30d',
  onTimeRangeChange,
  onViewDetails,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

  const sortedByRevenue = [...stores].sort((a, b) => b.revenue - a.revenue);
  const sortedByGrowth = [...stores].sort((a, b) => b.growth - a.growth);
  const sortedByConversion = [...stores].sort((a, b) => b.conversionRate - a.conversionRate);

  const maxRevenue = Math.max(...stores.map(s => s.revenue), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Store Performance Analytics</h2>
          <p className="text-sm text-white/60 mt-1">Comparative analysis across all locations</p>
        </div>
        <div className="flex gap-2">
          {['7d', '30d', '90d', '1y'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onTimeRangeChange?.(range)}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Comparison Summary */}
      {comparison && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <GlassPanel variant="elevated" className="p-6">
            <div className="text-sm text-white/60 mb-2">Top Performer</div>
            <div className="text-lg font-bold text-white mb-1">{comparison.topPerformer.name}</div>
            <div className="text-2xl font-bold text-green-400">{formatCurrency(comparison.topPerformer.revenue)}</div>
            <div className="text-xs text-green-400 mt-1">+{formatPercent(comparison.topPerformer.growth)}</div>
          </GlassPanel>

          <GlassPanel variant="elevated" className="p-6">
            <div className="text-sm text-white/60 mb-2">Needs Attention</div>
            <div className="text-lg font-bold text-white mb-1">{comparison.lowestPerformer.name}</div>
            <div className="text-2xl font-bold text-red-400">{formatCurrency(comparison.lowestPerformer.revenue)}</div>
            <div className="text-xs text-red-400 mt-1">{formatPercent(comparison.lowestPerformer.growth)} growth</div>
          </GlassPanel>

          <GlassPanel variant="elevated" className="p-6">
            <div className="text-sm text-white/60 mb-2">Average Revenue</div>
            <div className="text-2xl font-bold text-white">{formatCurrency(comparison.averageRevenue)}</div>
            <div className="text-xs text-white/40 mt-1">Across {comparison.totalStores} stores</div>
          </GlassPanel>

          <GlassPanel variant="elevated" className="p-6">
            <div className="text-sm text-white/60 mb-2">Total Stores</div>
            <div className="text-2xl font-bold text-white">{comparison.totalStores}</div>
            <div className="text-xs text-white/40 mt-1">{stores.filter(s => s.status === 'open').length} open</div>
          </GlassPanel>
        </div>
      )}

      {/* Revenue Comparison Chart */}
      <GlassPanel variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Revenue by Store</h3>
        <div className="space-y-3">
          {sortedByRevenue.map((store) => (
            <div key={store.id} className="flex items-center gap-4">
              <div className="w-48 flex-shrink-0">
                <div className="font-medium text-white truncate">{store.name}</div>
                <div className="text-xs text-white/40">{store.status}</div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-8 rounded transition-all ${
                      store.growth >= 0.1 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                      store.growth >= 0.05 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                      'bg-gradient-to-r from-yellow-500 to-orange-500'
                    }`}
                    style={{ width: `${(store.revenue / maxRevenue) * 100}%` }}
                  />
                  <span className="text-sm font-medium text-white w-24">{formatCurrency(store.revenue)}</span>
                </div>
              </div>
              <div className="w-24 text-right">
                <span className={`text-sm font-medium ${store.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {store.growth >= 0 ? '+' : ''}{formatPercent(store.growth)}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onViewDetails?.(store.id)}>
                Details
              </Button>
            </div>
          ))}
        </div>
      </GlassPanel>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Leaders */}
        <GlassPanel variant="elevated" className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">📈 Growth Leaders</h3>
          <div className="space-y-3">
            {sortedByGrowth.slice(0, 5).map((store, index) => (
              <div key={store.id} className="flex items-center justify-between p-3 rounded bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-xs font-bold text-white">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-white">{store.name}</div>
                    <div className="text-xs text-white/40">{formatCurrency(store.revenue)} revenue</div>
                  </div>
                </div>
                <div className="text-lg font-bold text-green-400">+{formatPercent(store.growth)}</div>
              </div>
            ))}
          </div>
        </GlassPanel>

        {/* Conversion Rate Leaders */}
        <GlassPanel variant="elevated" className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">🎯 Conversion Rate Leaders</h3>
          <div className="space-y-3">
            {sortedByConversion.slice(0, 5).map((store, index) => (
              <div key={store.id} className="flex items-center justify-between p-3 rounded bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-white">{store.name}</div>
                    <div className="text-xs text-white/40">{store.orders} orders</div>
                  </div>
                </div>
                <div className="text-lg font-bold text-blue-400">{formatPercent(store.conversionRate)}</div>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>

      {/* Detailed Metrics Table */}
      <GlassPanel variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Detailed Store Metrics</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-sm text-white/60">Store</th>
                <th className="text-left py-3 px-4 text-sm text-white/60">Status</th>
                <th className="text-left py-3 px-4 text-sm text-white/60">Revenue</th>
                <th className="text-left py-3 px-4 text-sm text-white/60">Growth</th>
                <th className="text-left py-3 px-4 text-sm text-white/60">Orders</th>
                <th className="text-left py-3 px-4 text-sm text-white/60">Avg Order</th>
                <th className="text-left py-3 px-4 text-sm text-white/60">Conversion</th>
                <th className="text-left py-3 px-4 text-sm text-white/60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4">
                    <div className="font-medium text-white">{store.name}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs capitalize ${
                      store.status === 'open' ? 'text-green-400 bg-green-500/20' :
                      store.status === 'closed' ? 'text-red-400 bg-red-500/20' :
                      'text-yellow-400 bg-yellow-500/20'
                    }`}>
                      {store.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white/80">{formatCurrency(store.revenue)}</td>
                  <td className="py-3 px-4">
                    <span className={store.growth >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {store.growth >= 0 ? '+' : ''}{formatPercent(store.growth)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white/80">{store.orders.toLocaleString()}</td>
                  <td className="py-3 px-4 text-white/80">{formatCurrency(store.avgOrderValue)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                          style={{ width: `${Math.min(store.conversionRate * 200, 100)}%` }}
                        />
                      </div>
                      <span className="text-white/80 text-sm">{formatPercent(store.conversionRate)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Button variant="secondary" size="sm" onClick={() => onViewDetails?.(store.id)}>
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </div>
  );
};
