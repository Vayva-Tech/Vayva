import { Button } from "@vayva/ui";
import React from 'react';
import { GlassPanel } from '@vayva/ui/fashion';

export interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'social' | 'influencer' | 'paid-ads';
  status: 'active' | 'scheduled' | 'draft' | 'completed';
  spent: number;
  revenue: number;
  metrics: {
    impressions?: number;
    clicks?: number;
    conversions?: number;
    ctr?: number;
  };
}

export interface CampaignManagerProps {
  campaigns?: Campaign[];
  onCreateCampaign?: () => void;
}

export const CampaignManager: React.FC<CampaignManagerProps> = ({
  campaigns = [],
  onCreateCampaign,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-400/20 text-emerald-400';
      case 'scheduled':
        return 'bg-blue-400/20 text-blue-400';
      case 'draft':
        return 'bg-amber-400/20 text-amber-400';
      case 'completed':
        return 'bg-white/10 text-white/60';
      default:
        return 'bg-white/10 text-white/60';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return '📧';
      case 'social':
        return '📱';
      case 'influencer':
        return '👥';
      case 'paid-ads':
        return '💰';
      default:
        return '📊';
    }
  };

  return (
    <GlassPanel variant="elevated" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Marketing Campaigns</h2>
        {onCreateCampaign && (
          <Button
            onClick={onCreateCampaign}
            className="px-4 py-2 bg-rose-400 hover:bg-rose-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            + New Campaign
          </Button>
        )}
      </div>

      {/* Campaign Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="bg-white/3 rounded-xl p-4 border border-white/8 hover:border-rose-400/30 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{getTypeIcon(campaign.type)}</span>
                <div>
                  <h3 className="text-sm font-semibold text-white">{campaign.name}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                      campaign.status
                    )}`}
                  >
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-white/60">Spent:</span>
                <span className="text-white font-medium">${campaign.spent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/60">Revenue:</span>
                <span className="text-emerald-400 font-medium">
                  ${campaign.revenue.toLocaleString()}
                </span>
              </div>
              {campaign.metrics.ctr && (
                <div className="flex justify-between text-xs">
                  <span className="text-white/60">CTR:</span>
                  <span className="text-white font-medium">
                    {(campaign.metrics.ctr * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-white/10 flex gap-2">
              <Button className="flex-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 text-xs rounded transition-colors">
                View Details
              </Button>
              <Button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 text-xs rounded transition-colors">
                ✏️
              </Button>
            </div>
          </div>
        ))}

        {/* Add Campaign Placeholder */}
        {onCreateCampaign && (
          <Button
            onClick={onCreateCampaign}
            className="bg-white/3 border-2 border-dashed border-white/20 hover:border-rose-400/50 rounded-xl p-4 flex flex-col items-center justify-center min-h-[200px] transition-colors group"
          >
            <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">➕</span>
            <span className="text-sm text-white/60 font-medium">Create Campaign</span>
          </Button>
        )}
      </div>
    </GlassPanel>
  );
};

export default CampaignManager;
