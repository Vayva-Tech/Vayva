// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { GlassPanel, Button } from '@vayva/ui/components/fashion';

interface CollectionProduct {
  productId: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  unitsProduced: number;
  unitsSold: number;
  sellThroughRate: number;
  performanceRating: 'star' | 'plowhorse' | 'puzzle' | 'dog';
}

interface CollectionMetrics {
  collectionId: string;
  totalRevenue: number;
  totalUnitsSold: number;
  averageSellThrough: number;
  profitMargin: number;
  daysInMarket: number;
  projectedTotalRevenue: number;
}

interface TrendData {
  date: string;
  revenue: number;
  units: number;
}

export interface CollectionAnalyzerProps {
  collectionName?: string;
  season?: string;
  metrics?: CollectionMetrics;
  products?: CollectionProduct[];
  trendData?: TrendData[];
  categoryBreakdown?: { category: string; revenue: number; percentage: number }[];
  recommendations?: string[];
}

export const CollectionAnalyzer: React.FC<CollectionAnalyzerProps> = ({
  collectionName = 'Spring Collection 2024',
  season = 'Spring 2024',
  metrics,
  products = [],
  trendData = [],
  categoryBreakdown = [],
  recommendations = [],
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'trends'>('overview');
  const [sortBy, setSortBy] = useState<'performance' | 'revenue' | 'sellThrough'>('performance');

  const getPerformanceColor = (rating: string) => {
    switch (rating) {
      case 'star': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'plowhorse': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'puzzle': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'dog': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'revenue':
        return (b.price * b.unitsSold) - (a.price * a.unitsSold);
      case 'sellThrough':
        return b.sellThroughRate - a.sellThroughRate;
      case 'performance':
      default: {
        const ratingOrder = { star: 0, plowhorse: 1, puzzle: 2, dog: 3 };
        return ratingOrder[a.performanceRating] - ratingOrder[b.performanceRating];
      }
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{collectionName}</h2>
          <p className="text-sm text-white/60 mt-1">{season} • {metrics?.daysInMarket || 0} days in market</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setActiveTab('overview')}>Overview</Button>
          <Button variant="ghost" onClick={() => setActiveTab('products')}>Products</Button>
          <Button variant="ghost" onClick={() => setActiveTab('trends')}>Trends</Button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && metrics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <GlassPanel variant="elevated" className="p-6">
              <div className="text-sm text-white/60 mb-2">Total Revenue</div>
              <div className="text-3xl font-bold text-white">${metrics.totalRevenue.toLocaleString()}</div>
              <div className="text-xs text-white/40 mt-2">
                Projected: ${metrics.projectedTotalRevenue.toLocaleString()}
              </div>
            </GlassPanel>

            <GlassPanel variant="elevated" className="p-6">
              <div className="text-sm text-white/60 mb-2">Units Sold</div>
              <div className="text-3xl font-bold text-white">{metrics.totalUnitsSold.toLocaleString()}</div>
              <div className="text-xs text-white/40 mt-2">Total production: {products.reduce((sum, p) => sum + p.unitsProduced, 0).toLocaleString()}</div>
            </GlassPanel>

            <GlassPanel variant="elevated" className="p-6">
              <div className="text-sm text-white/60 mb-2">Avg Sell-Through</div>
              <div className="text-3xl font-bold text-white">{metrics.averageSellThrough.toFixed(1)}%</div>
              <div className="text-xs text-white/40 mt-2">Target: 75%</div>
            </GlassPanel>

            <GlassPanel variant="elevated" className="p-6">
              <div className="text-sm text-white/60 mb-2">Profit Margin</div>
              <div className="text-3xl font-bold text-white">{metrics.profitMargin.toFixed(1)}%</div>
              <div className="text-xs text-white/40 mt-2">Industry avg: 45%</div>
            </GlassPanel>
          </div>

          {/* Category Breakdown */}
          {categoryBreakdown.length > 0 && (
            <GlassPanel variant="elevated" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Category Performance</h3>
              <div className="space-y-4">
                {categoryBreakdown.map(({ category, revenue, percentage }) => (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white/80">{category}</span>
                      <span className="text-sm text-white/60">${revenue.toLocaleString()} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </GlassPanel>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <GlassPanel variant="elevated" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">AI Recommendations</h3>
              <div className="space-y-3">
                {recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <p className="text-sm text-white/80">{rec}</p>
                  </div>
                ))}
              </div>
            </GlassPanel>
          )}
        </>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <GlassPanel variant="elevated" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Product Performance</h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-white/10 border border-white/20 rounded px-3 py-1 text-sm text-white"
            >
              <option value="performance">By Performance</option>
              <option value="revenue">By Revenue</option>
              <option value="sellThrough">By Sell-Through</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm text-white/60">Product</th>
                  <th className="text-left py-3 px-4 text-sm text-white/60">Category</th>
                  <th className="text-left py-3 px-4 text-sm text-white/60">Price</th>
                  <th className="text-left py-3 px-4 text-sm text-white/60">Sold</th>
                  <th className="text-left py-3 px-4 text-sm text-white/60">Revenue</th>
                  <th className="text-left py-3 px-4 text-sm text-white/60">Sell-Through</th>
                  <th className="text-left py-3 px-4 text-sm text-white/60">Performance</th>
                </tr>
              </thead>
              <tbody>
                {sortedProducts.map((product) => (
                  <tr key={product.productId} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4">
                      <div className="font-medium text-white">{product.name}</div>
                    </td>
                    <td className="py-3 px-4 text-white/60">{product.category}</td>
                    <td className="py-3 px-4 text-white/80">${product.price}</td>
                    <td className="py-3 px-4 text-white/80">
                      {product.unitsSold.toLocaleString()} / {product.unitsProduced.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-white/80">
                      ${(product.price * product.unitsSold).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              product.sellThroughRate >= 75 ? 'bg-green-500' :
                              product.sellThroughRate >= 50 ? 'bg-blue-500' :
                              product.sellThroughRate >= 30 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${product.sellThroughRate}%` }}
                          />
                        </div>
                        <span className="text-white/80 text-sm">{product.sellThroughRate.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium border capitalize ${getPerformanceColor(product.performanceRating)}`}>
                        {product.performanceRating}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassPanel>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && trendData.length > 0 && (
        <GlassPanel variant="elevated" className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Trends</h3>
          
          {/* Simple line chart visualization */}
          <div className="h-64 flex items-end gap-1">
            {trendData.map((data, index) => {
              const maxRevenue = Math.max(...trendData.map(d => d.revenue));
              const heightPercent = (data.revenue / maxRevenue) * 100;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t transition-all hover:opacity-80"
                    style={{ height: `${heightPercent}%` }}
                    title={`${data.date}: $${data.revenue.toLocaleString()}`}
                  />
                  <span className="text-xs text-white/40 transform -rotate-45 origin-top-left">
                    {data.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <GlassPanel variant="bordered" className="p-4">
              <div className="text-sm text-white/60 mb-2">Best Day</div>
              <div className="text-xl font-bold text-white">
                ${Math.max(...trendData.map(d => d.revenue)).toLocaleString()}
              </div>
            </GlassPanel>
            <GlassPanel variant="bordered" className="p-4">
              <div className="text-sm text-white/60 mb-2">Average Daily Revenue</div>
              <div className="text-xl font-bold text-white">
                ${(trendData.reduce((sum, d) => sum + d.revenue, 0) / trendData.length).toLocaleString()}
              </div>
            </GlassPanel>
          </div>
        </GlassPanel>
      )}
    </div>
  );
};
