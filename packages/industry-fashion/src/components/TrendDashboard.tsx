'use client';

import React, { useState } from 'react';
import { GlassPanel } from '@vayva/ui/fashion';
import { Button } from '@vayva/ui';

interface TrendData {
  trendId: string;
  name: string;
  category: string;
  description: string;
  confidence: number;
  growthRate: number;
  marketSize: number;
  relatedProducts: string[];
  imageUrl?: string;
  status: 'emerging' | 'trending' | 'peaking' | 'declining';
}

interface TrendInsight {
  title: string;
  impact: 'high' | 'medium' | 'low';
  action: string;
  timeline: string;
}

export interface TrendDashboardProps {
  trends?: TrendData[];
  insights?: TrendInsight[];
  selectedCategory?: string;
  onTrendSelect?: (trend: TrendData) => void;
  onSaveTrend?: (trend: TrendData) => void;
}

export const TrendDashboard: React.FC<TrendDashboardProps> = ({
  trends = [],
  insights = [],
  selectedCategory = 'all',
  onTrendSelect,
  onSaveTrend,
}) => {
  const [activeView, setActiveView] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'confidence' | 'growth' | 'marketSize'>('confidence');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'emerging': return 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30';
      case 'trending': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'peaking': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'declining': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-blue-400 bg-blue-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const filteredTrends = selectedCategory === 'all'
    ? trends
    : trends.filter(t => t.category === selectedCategory);

  const sortedTrends = [...filteredTrends].sort((a, b) => {
    switch (sortBy) {
      case 'growth':
        return b.growthRate - a.growthRate;
      case 'marketSize':
        return b.marketSize - a.marketSize;
      case 'confidence':
      default:
        return b.confidence - a.confidence;
    }
  });

  const categories = Array.from(new Set(trends.map(t => t.category)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Trend Intelligence Dashboard</h2>
          <p className="text-sm text-white/60 mt-1">AI-powered trend detection and analysis</p>
        </div>
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="bg-white/10 border border-white/20 rounded px-3 py-1 text-sm text-white"
          >
            <option value="confidence">Sort by Confidence</option>
            <option value="growth">Sort by Growth Rate</option>
            <option value="marketSize">Sort by Market Size</option>
          </select>
          <Button variant="ghost" size="sm" onClick={() => setActiveView('grid')}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setActiveView('list')}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto">
        <Button
          variant={selectedCategory === 'all' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => {}}
        >
          All Categories
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => {}}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Insights Panel */}
      {insights.length > 0 && (
        <GlassPanel variant="elevated" className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">AI Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
              <div key={index} className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-white">{insight.title}</h4>
                  <span className={`px-2 py-1 rounded text-xs ${getImpactColor(insight.impact)}`}>
                    {insight.impact}
                  </span>
                </div>
                <p className="text-sm text-white/60 mb-2">{insight.action}</p>
                <p className="text-xs text-white/40">Timeline: {insight.timeline}</p>
              </div>
            ))}
          </div>
        </GlassPanel>
      )}

      {/* Trends Grid/List */}
      {activeView === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedTrends.map((trend) => (
            <div
              key={trend.trendId}
              role="button"
              tabIndex={0}
              onClick={() => onTrendSelect?.(trend)}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") onTrendSelect?.(trend);
              }}
              className="cursor-pointer transition-transform hover:scale-[1.02]"
            >
            <GlassPanel
              variant="elevated"
              className="p-6"
            >
              {trend.imageUrl && (
                <div className="aspect-video rounded-lg overflow-hidden mb-4 bg-white/10">
                  <img
                    src={trend.imageUrl}
                    alt={trend.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-white">{trend.name}</h3>
                <span className={`px-2 py-1 rounded text-xs border capitalize ${getStatusColor(trend.status)}`}>
                  {trend.status}
                </span>
              </div>
              
              <p className="text-sm text-white/60 mb-4 line-clamp-2">{trend.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Confidence</span>
                  <span className="text-white font-medium">{trend.confidence.toFixed(0)}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    style={{ width: `${trend.confidence}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Growth Rate</span>
                  <span className={`${trend.growthRate > 50 ? 'text-green-400' : 'text-white'} font-medium`}>
                    +{trend.growthRate.toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Market Size</span>
                  <span className="text-white font-medium">${(trend.marketSize / 1000000).toFixed(1)}M</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40">{trend.category}</span>
                  <Button size="sm" variant="secondary" onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    onSaveTrend?.(trend);
                  }}>
                    Save Trend
                  </Button>
                </div>
              </div>
            </GlassPanel>
            </div>
          ))}
        </div>
      ) : (
        <GlassPanel variant="elevated" className="p-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-sm text-white/60">Trend</th>
                <th className="text-left py-3 px-4 text-sm text-white/60">Category</th>
                <th className="text-left py-3 px-4 text-sm text-white/60">Status</th>
                <th className="text-left py-3 px-4 text-sm text-white/60">Confidence</th>
                <th className="text-left py-3 px-4 text-sm text-white/60">Growth</th>
                <th className="text-left py-3 px-4 text-sm text-white/60">Market Size</th>
                <th className="text-left py-3 px-4 text-sm text-white/60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedTrends.map((trend) => (
                <tr key={trend.trendId} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4">
                    <div className="font-medium text-white">{trend.name}</div>
                    <div className="text-xs text-white/40 line-clamp-1">{trend.description}</div>
                  </td>
                  <td className="py-3 px-4 text-white/60">{trend.category}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs border capitalize ${getStatusColor(trend.status)}`}>
                      {trend.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                          style={{ width: `${trend.confidence}%` }}
                        />
                      </div>
                      <span className="text-white/80 text-sm">{trend.confidence.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`${trend.growthRate > 50 ? 'text-green-400' : 'text-white'} font-medium`}>
                      +{trend.growthRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white/80">
                    ${(trend.marketSize / 1000000).toFixed(1)}M
                  </td>
                  <td className="py-3 px-4">
                    <Button size="sm" variant="secondary" onClick={() => onSaveTrend?.(trend)}>
                      Save
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassPanel>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassPanel variant="default" className="p-4">
          <div className="text-sm text-white/60 mb-2">Total Trends Tracked</div>
          <div className="text-2xl font-bold text-white">{trends.length}</div>
        </GlassPanel>
        <GlassPanel variant="default" className="p-4">
          <div className="text-sm text-white/60 mb-2">Emerging Trends</div>
          <div className="text-2xl font-bold text-white">
            {trends.filter(t => t.status === 'emerging').length}
          </div>
        </GlassPanel>
        <GlassPanel variant="default" className="p-4">
          <div className="text-sm text-white/60 mb-2">Avg Confidence</div>
          <div className="text-2xl font-bold text-white">
            {trends.length > 0
              ? Math.round(trends.reduce((sum, t) => sum + t.confidence, 0) / trends.length)
              : 0}%
          </div>
        </GlassPanel>
        <GlassPanel variant="default" className="p-4">
          <div className="text-sm text-white/60 mb-2">High Growth (&gt;50%)</div>
          <div className="text-2xl font-bold text-white">
            {trends.filter(t => t.growthRate > 50).length}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
};
