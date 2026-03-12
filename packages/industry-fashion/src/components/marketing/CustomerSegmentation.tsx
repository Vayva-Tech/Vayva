import React from 'react';
import { GlassPanel } from '@vayva/ui/components/fashion';

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  size: number;
  value: number;
  growthRate: number;
  engagementScore: number;
  criteria: {
    minPurchases?: number;
    minSpend?: number;
    lastPurchaseDays?: number;
    tags?: string[];
  };
}

export interface CustomerSegmentationProps {
  segments?: CustomerSegment[];
  onCreateSegment?: () => void;
}

export const CustomerSegmentation: React.FC<CustomerSegmentationProps> = ({
  segments = [],
  onCreateSegment,
}) => {
  const getEngagementColor = (score: number) => {
    if (score >= 0.8) return 'text-emerald-400';
    if (score >= 0.6) return 'text-blue-400';
    if (score >= 0.4) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getValueTier = (value: number) => {
    if (value >= 10000) return '💎 VIP';
    if (value >= 5000) return '⭐ High';
    if (value >= 1000) return '📈 Medium';
    return '🌱 Low';
  };

  return (
    <GlassPanel variant="elevated" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Customer Segmentation</h2>
        {onCreateSegment && (
          <button
            onClick={onCreateSegment}
            className="px-4 py-2 bg-purple-400 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            + Create Segment
          </button>
        )}
      </div>

      {/* Segment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {segments.map((segment) => (
          <div
            key={segment.id}
            className="bg-white/3 rounded-xl p-5 border border-white/8 hover:border-purple-400/30 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">{segment.name}</h3>
                <p className="text-xs text-white/50 mt-1">{segment.description}</p>
              </div>
              <span className="text-xs px-2 py-1 bg-purple-400/20 text-purple-400 rounded-full whitespace-nowrap">
                {getValueTier(segment.value)}
              </span>
            </div>

            <div className="space-y-3">
              {/* Size */}
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/60">Customers</span>
                <span className="text-sm font-bold text-white">{segment.size.toLocaleString()}</span>
              </div>

              {/* Value */}
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/60">Total Value</span>
                <span className="text-sm font-bold text-emerald-400">${segment.value.toLocaleString()}</span>
              </div>

              {/* Growth */}
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/60">Growth</span>
                <span className={`text-sm font-bold ${segment.growthRate >= 0.1 ? 'text-emerald-400' : segment.growthRate >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {segment.growthRate >= 0 ? '+' : ''}{(segment.growthRate * 100).toFixed(1)}%
                </span>
              </div>

              {/* Engagement Score */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-white/60">Engagement</span>
                  <span className={`text-xs font-bold ${getEngagementColor(segment.engagementScore)}`}>
                    {(segment.engagementScore * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      segment.engagementScore >= 0.8 ? 'bg-emerald-400' :
                      segment.engagementScore >= 0.6 ? 'bg-blue-400' :
                      segment.engagementScore >= 0.4 ? 'bg-amber-400' : 'bg-rose-400'
                    }`}
                    style={{ width: `${segment.engagementScore * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Criteria Tags */}
            {segment.criteria.tags && segment.criteria.tags.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex flex-wrap gap-1">
                  {segment.criteria.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 bg-white/5 text-white/70 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {segment.criteria.tags.length > 3 && (
                    <span className="text-xs px-2 py-1 text-white/40">
                      +{segment.criteria.tags.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-4 flex gap-2">
              <button className="flex-1 px-3 py-1.5 bg-purple-400/20 hover:bg-purple-400/30 text-purple-400 text-xs rounded transition-colors">
                View Details
              </button>
              <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 text-xs rounded transition-colors">
                ✏️
              </button>
            </div>
          </div>
        ))}

        {/* Add Segment Placeholder */}
        {onCreateSegment && (
          <button
            onClick={onCreateSegment}
            className="bg-white/3 border-2 border-dashed border-white/20 hover:border-purple-400/50 rounded-xl p-5 flex flex-col items-center justify-center transition-colors group"
          >
            <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">➕</span>
            <span className="text-sm text-white/60 font-medium">Create Segment</span>
          </button>
        )}
      </div>

      {/* Segmentation Tips */}
      <div className="mt-6 p-4 bg-blue-400/10 border border-blue-400/20 rounded-lg">
        <p className="text-sm text-blue-400">
          💡 Tip: Create segments based on purchase behavior, spending patterns, and engagement levels to personalize your marketing.
        </p>
      </div>
    </GlassPanel>
  );
};

export default CustomerSegmentation;
