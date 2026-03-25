'use client';

import React, { useState } from 'react';
import { Card, Button } from "@vayva/ui";

interface CustomerSegment {
  segmentId: string;
  name: string;
  description: string;
  customerCount: number;
  revenue: number;
  avgOrderValue: number;
  lifetimeValue: number;
  engagementScore: number;
}

interface SegmentInsight {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
}

export interface CustomerSegmentExplorerProps {
  segments?: CustomerSegment[];
  insights?: SegmentInsight[];
  onSegmentSelect?: (segment: CustomerSegment) => void;
  onViewCustomers?: (segmentId: string) => void;
  onCreateCampaign?: (segmentId: string) => void;
}

export const CustomerSegmentExplorer: React.FC<CustomerSegmentExplorerProps> = ({
  segments = [],
  insights = [],
  onSegmentSelect,
  onViewCustomers,
  onCreateCampaign,
}) => {
  const [sortBy, setSortBy] = useState<'revenue' | 'customers' | 'engagement' | 'ltv'>('revenue');
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const sortedSegments = [...segments].sort((a, b) => {
    switch (sortBy) {
      case 'customers':
        return b.customerCount - a.customerCount;
      case 'engagement':
        return b.engagementScore - a.engagementScore;
      case 'ltv':
        return b.lifetimeValue - a.lifetimeValue;
      case 'revenue':
      default:
        return b.revenue - a.revenue;
    }
  });

  const totalCustomers = segments.reduce((sum, s) => sum + s.customerCount, 0);
  const totalRevenue = segments.reduce((sum, s) => sum + s.revenue, 0);
  const avgEngagement = segments.length > 0 
    ? Math.round(segments.reduce((sum, s) => sum + s.engagementScore, 0) / segments.length)
    : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Customer Segment Explorer</h2>
          <p className="text-sm text-white/60 mt-1">Analyze and target customer segments</p>
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="bg-white/10 border border-white/20 rounded px-3 py-1 text-sm text-white"
        >
          <option value="revenue">Sort by Revenue</option>
          <option value="customers">Sort by Customers</option>
          <option value="engagement">Sort by Engagement</option>
          <option value="ltv">Sort by LTV</option>
        </select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-white/10 bg-white/5 backdrop-blur-md p-4">
          <div className="text-sm text-white/60 mb-2">Total Segments</div>
          <div className="text-2xl font-bold text-white">{segments.length}</div>
        </Card>
        <Card className="border-white/10 bg-white/5 backdrop-blur-md p-4">
          <div className="text-sm text-white/60 mb-2">Total Customers</div>
          <div className="text-2xl font-bold text-white">{totalCustomers.toLocaleString()}</div>
        </Card>
        <Card className="border-white/10 bg-white/5 backdrop-blur-md p-4">
          <div className="text-sm text-white/60 mb-2">Total Revenue</div>
          <div className="text-2xl font-bold text-white">{formatCurrency(totalRevenue)}</div>
        </Card>
        <Card className="border-white/10 bg-white/5 backdrop-blur-md p-4">
          <div className="text-sm text-white/60 mb-2">Avg Engagement</div>
          <div className="text-2xl font-bold text-white">{avgEngagement}%</div>
        </Card>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <Card className="border-white/10 bg-white/5 backdrop-blur-md p-6">
          <h3 className="text-lg font-semibold text-white mb-4">🤖 AI Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
              <div key={index} className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-white">{insight.title}</h4>
                  <span className={`px-2 py-1 rounded text-xs border capitalize ${getImpactColor(insight.impact)}`}>
                    {insight.impact} impact
                  </span>
                </div>
                <p className="text-sm text-white/80 mb-2">{insight.description}</p>
                <p className="text-xs text-white/60 italic">💡 {insight.recommendation}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Segments Grid */}
      <Card className="border-white/10 bg-white/5 backdrop-blur-md p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Customer Segments</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sortedSegments.map((segment) => (
            <div
              key={segment.segmentId}
              className={`p-5 rounded-lg border transition-all cursor-pointer ${
                selectedSegment === segment.segmentId
                  ? 'bg-blue-500/10 border-blue-500/50'
                  : 'bg-white/5 border-white/10 hover:border-white/30'
              }`}
              onClick={() => {
                setSelectedSegment(segment.segmentId);
                onSegmentSelect?.(segment);
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-white text-lg">{segment.name}</h4>
                  <p className="text-sm text-white/60 mt-1">{segment.description}</p>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <div className="text-xs text-white/40 mb-1">Customers</div>
                  <div className="text-lg font-bold text-white">{segment.customerCount.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-white/40 mb-1">Revenue</div>
                  <div className="text-lg font-bold text-white">{formatCurrency(segment.revenue)}</div>
                </div>
                <div>
                  <div className="text-xs text-white/40 mb-1">Avg Order</div>
                  <div className="text-lg font-bold text-white">{formatCurrency(segment.avgOrderValue)}</div>
                </div>
                <div>
                  <div className="text-xs text-white/40 mb-1">LTV</div>
                  <div className="text-lg font-bold text-white">{formatCurrency(segment.lifetimeValue)}</div>
                </div>
              </div>

              {/* Engagement Score */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-white/60">Engagement Score</span>
                  <span className="text-sm font-bold text-white">{segment.engagementScore}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      segment.engagementScore >= 75 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                      segment.engagementScore >= 50 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                      segment.engagementScore >= 30 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                      'bg-gradient-to-r from-red-500 to-rose-500'
                    }`}
                    style={{ width: `${segment.engagementScore}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-white/10">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    onViewCustomers?.(segment.segmentId);
                  }}
                >
                  View Customers
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    onCreateCampaign?.(segment.segmentId);
                  }}
                >
                  Create Campaign
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Segment Comparison Chart */}
      <Card className="border-white/10 bg-white/5 backdrop-blur-md p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Revenue Comparison</h3>
        <div className="space-y-3">
          {sortedSegments.map((segment) => {
            const maxRevenue = Math.max(...segments.map(s => s.revenue));
            const revenuePercent = (segment.revenue / maxRevenue) * 100;

            return (
              <div key={segment.segmentId} className="flex items-center gap-4">
                <div className="w-48 flex-shrink-0">
                  <div className="font-medium text-white truncate">{segment.name}</div>
                  <div className="text-xs text-white/40">{segment.customerCount.toLocaleString()} customers</div>
                </div>
                <div className="flex-1">
                  <div
                    className="h-8 rounded bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                    style={{ width: `${revenuePercent}%` }}
                  />
                </div>
                <div className="w-32 text-right">
                  <div className="text-lg font-bold text-white">{formatCurrency(segment.revenue)}</div>
                  <div className="text-xs text-white/40">{((segment.revenue / totalRevenue) * 100).toFixed(1)}% of total</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Empty State */}
      {segments.length === 0 && (
        <Card className="border-white/10 bg-white/5 backdrop-blur-md p-12 text-center">
          <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-white mb-2">No Segments Found</h3>
          <p className="text-sm text-white/60">Create your first customer segment to get started</p>
        </Card>
      )}
    </div>
  );
};
