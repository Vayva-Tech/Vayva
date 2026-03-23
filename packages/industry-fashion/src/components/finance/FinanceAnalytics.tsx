// @ts-nocheck
import React from 'react';
import { GlassPanel, SparklineChart } from '@vayva/ui/components/fashion';

export interface RevenueMetrics {
  totalRevenue: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  averageOrderValue: number;
  customerLifetimeValue: number;
  refundRate: number;
}

export interface RevenueBreakdown {
  category: string;
  amount: number;
  percentage: number;
  growth: number;
}

export interface FinanceAnalyticsProps {
  metrics?: RevenueMetrics;
  revenueTrend?: Array<{ date: string; value: number }>;
  revenueBreakdown?: RevenueBreakdown[];
  timeRange?: '7d' | '30d' | '90d' | '1y';
}

export const FinanceAnalytics: React.FC<FinanceAnalyticsProps> = ({
  metrics,
  revenueTrend = [],
  revenueBreakdown = [],
  timeRange = '30d',
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const defaultMetrics: RevenueMetrics = {
    totalRevenue: 0,
    grossProfit: 0,
    netProfit: 0,
    profitMargin: 0,
    averageOrderValue: 0,
    customerLifetimeValue: 0,
    refundRate: 0,
  };

  const data = metrics || defaultMetrics;

  return (
    <div className="space-y-6">
      {/* Key Financial Metrics */}
      <GlassPanel variant="elevated" className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Financial Overview</h2>
          <select
            value={timeRange}
            onChange={(e) => {}}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-400"
          >
            <option value="7d" className="bg-[#0F0F0F]">Last 7 days</option>
            <option value="30d" className="bg-[#0F0F0F]">Last 30 days</option>
            <option value="90d" className="bg-[#0F0F0F]">Last 90 days</option>
            <option value="1y" className="bg-[#0F0F0F]">Last year</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Revenue */}
          <div className="bg-white/3 rounded-xl p-5 border border-white/8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-white/60">Total Revenue</span>
              <span className="text-emerald-400 text-lg">💰</span>
            </div>
            <p className="text-2xl font-bold text-white mb-2">
              {formatCurrency(data.totalRevenue)}
            </p>
            {revenueTrend.length > 0 && (
              <SparklineChart
                data={revenueTrend.map((d) => d.value)}
                color="#10B981"
                height={40}
              />
            )}
          </div>

          {/* Gross Profit */}
          <div className="bg-white/3 rounded-xl p-5 border border-white/8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-white/60">Gross Profit</span>
              <span className="text-blue-400 text-lg">📈</span>
            </div>
            <p className="text-2xl font-bold text-white mb-2">
              {formatCurrency(data.grossProfit)}
            </p>
            <p className="text-xs text-white/50">
              COGS: {formatCurrency(data.totalRevenue - data.grossProfit)}
            </p>
          </div>

          {/* Net Profit */}
          <div className="bg-white/3 rounded-xl p-5 border border-white/8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-white/60">Net Profit</span>
              <span className="text-purple-400 text-lg">💎</span>
            </div>
            <p className={`text-2xl font-bold mb-2 ${data.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(data.netProfit)}
            </p>
            <p className="text-xs text-white/50">
              After all expenses & taxes
            </p>
          </div>

          {/* Profit Margin */}
          <div className="bg-white/3 rounded-xl p-5 border border-white/8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-white/60">Profit Margin</span>
              <span className="text-amber-400 text-lg">📊</span>
            </div>
            <p className={`text-2xl font-bold mb-2 ${data.profitMargin >= 0.2 ? 'text-emerald-400' : data.profitMargin >= 0.1 ? 'text-amber-400' : 'text-rose-400'}`}>
              {(data.profitMargin * 100).toFixed(1)}%
            </p>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  data.profitMargin >= 0.2 ? 'bg-emerald-400' : data.profitMargin >= 0.1 ? 'bg-amber-400' : 'bg-rose-400'
                }`}
                style={{ width: `${Math.min(data.profitMargin * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/60">Average Order Value</span>
            <span className="text-lg font-bold text-white">{formatCurrency(data.averageOrderValue)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/60">Customer Lifetime Value</span>
            <span className="text-lg font-bold text-white">{formatCurrency(data.customerLifetimeValue)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/60">Refund Rate</span>
            <span className={`text-lg font-bold ${data.refundRate < 0.05 ? 'text-emerald-400' : data.refundRate < 0.1 ? 'text-amber-400' : 'text-rose-400'}`}>
              {(data.refundRate * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </GlassPanel>

      {/* Revenue Breakdown */}
      {revenueBreakdown.length > 0 && (
        <GlassPanel variant="elevated" className="p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Revenue by Category</h2>
          
          <div className="space-y-4">
            {revenueBreakdown.map((item) => (
              <div key={item.category}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-white">{item.category}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.growth >= 0.1 ? 'bg-emerald-400/20 text-emerald-400' :
                      item.growth >= 0 ? 'bg-amber-400/20 text-amber-400' :
                      'bg-rose-400/20 text-rose-400'
                    }`}>
                      {item.growth >= 0 ? '+' : ''}{(item.growth * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-white">{formatCurrency(item.amount)}</span>
                    <span className="text-xs text-white/50 ml-2">({(item.percentage * 100).toFixed(0)}%)</span>
                  </div>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400 transition-all"
                    style={{ width: `${item.percentage * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      )}
    </div>
  );
};

export default FinanceAnalytics;
