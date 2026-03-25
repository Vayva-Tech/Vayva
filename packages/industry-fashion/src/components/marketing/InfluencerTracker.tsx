import { Button } from "@vayva/ui";
import React from 'react';
import { GlassPanel } from '@vayva/ui/fashion';

export interface Influencer {
  id: string;
  name: string;
  platform: 'instagram' | 'tiktok' | 'youtube' | 'blog';
  followers: number;
  engagementRate: number;
  postsCount: number;
  status: 'active' | 'negotiating' | 'pending' | 'inactive';
  tier: 'nano' | 'micro' | 'mid' | 'macro' | 'mega';
  specialty?: string[];
}

export interface InfluencerTrackerProps {
  influencers?: Influencer[];
  onAddInfluencer?: () => void;
}

export const InfluencerTracker: React.FC<InfluencerTrackerProps> = ({
  influencers = [],
  onAddInfluencer,
}) => {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'nano':
        return 'bg-emerald-400/20 text-emerald-400';
      case 'micro':
        return 'bg-blue-400/20 text-blue-400';
      case 'mid':
        return 'bg-purple-400/20 text-purple-400';
      case 'macro':
        return 'bg-amber-400/20 text-amber-400';
      case 'mega':
        return 'bg-rose-400/20 text-rose-400';
      default:
        return 'bg-white/10 text-white/60';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-400/20 text-emerald-400';
      case 'negotiating':
        return 'bg-blue-400/20 text-blue-400';
      case 'pending':
        return 'bg-amber-400/20 text-amber-400';
      case 'inactive':
        return 'bg-white/10 text-white/60';
      default:
        return 'bg-white/10 text-white/60';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return '📸';
      case 'tiktok':
        return '🎵';
      case 'youtube':
        return '▶️';
      case 'blog':
        return '✍️';
      default:
        return '📱';
    }
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <GlassPanel variant="elevated" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Influencer Partnerships</h2>
        {onAddInfluencer && (
          <Button
            onClick={onAddInfluencer}
            className="px-4 py-2 bg-purple-400 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            + Add Influencer
          </Button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Influencers', value: influencers.length },
          { label: 'Active Campaigns', value: influencers.filter((i) => i.status === 'active').length },
          { label: 'Avg Engagement', value: `${(influencers.reduce((sum, i) => sum + i.engagementRate, 0) / (influencers.length || 1)).toFixed(1)}%` },
          { label: 'Total Reach', value: formatFollowers(influencers.reduce((sum, i) => sum + i.followers, 0)) },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/3 rounded-lg p-4 border border-white/8">
            <p className="text-xs text-white/60 mb-1">{stat.label}</p>
            <p className="text-xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Influencer List */}
      <div className="space-y-3">
        {influencers.map((influencer) => (
          <div
            key={influencer.id}
            className="flex items-center justify-between p-4 bg-white/3 rounded-lg border border-white/8 hover:border-purple-400/30 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 flex items-center justify-center">
                <span className="text-2xl">{getPlatformIcon(influencer.platform)}</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{influencer.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-1 rounded-full ${getTierColor(influencer.tier)}`}>
                    {influencer.tier.charAt(0).toUpperCase() + influencer.tier.slice(1)}
                  </span>
                  <span className="text-xs text-white/60">
                    {formatFollowers(influencer.followers)} followers
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-white/60">Engagement</p>
                <p className="text-sm font-bold text-emerald-400">
                  {(influencer.engagementRate * 100).toFixed(1)}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/60">Posts</p>
                <p className="text-sm font-medium text-white">{influencer.postsCount}</p>
              </div>
              <div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getStatusColor(influencer.status)}`}
                >
                  {influencer.status.charAt(0).toUpperCase() + influencer.status.slice(1)}
                </span>
              </div>
              <Button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 text-xs rounded transition-colors">
                View Profile
              </Button>
            </div>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
};

export default InfluencerTracker;
