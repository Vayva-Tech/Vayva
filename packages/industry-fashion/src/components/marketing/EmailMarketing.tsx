import { Button } from "@vayva/ui";
import React from 'react';
import { GlassPanel } from '@vayva/ui/fashion';

export interface EmailCampaign {
  id: string;
  name: string;
  type: 'newsletter' | 'promotional' | 'abandoned-cart' | 'welcome-series' | 're-engagement';
  status: 'draft' | 'scheduled' | 'sending' | 'completed';
  sentCount: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  revenue: number;
  scheduledAt?: Date;
}

export interface EmailMarketingProps {
  campaigns?: EmailCampaign[];
  onComposeEmail?: () => void;
}

export const EmailMarketing: React.FC<EmailMarketingProps> = ({
  campaigns = [],
  onComposeEmail,
}) => {
  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      newsletter: '📰',
      promotional: '🏷️',
      'abandoned-cart': '🛒',
      'welcome-series': '👋',
      're-engagement': '💌',
    };
    return icons[type] || '📧';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-400/20 text-emerald-400';
      case 'sending':
        return 'bg-blue-400/20 text-blue-400';
      case 'scheduled':
        return 'bg-purple-400/20 text-purple-400';
      case 'draft':
        return 'bg-amber-400/20 text-amber-400';
      default:
        return 'bg-white/10 text-white/60';
    }
  };

  const getPerformanceBadge = (rate: number) => {
    if (rate >= 0.25) return 'bg-emerald-400/20 text-emerald-400';
    if (rate >= 0.15) return 'bg-blue-400/20 text-blue-400';
    if (rate >= 0.08) return 'bg-amber-400/20 text-amber-400';
    return 'bg-rose-400/20 text-rose-400';
  };

  return (
    <GlassPanel variant="elevated" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Email Marketing</h2>
        {onComposeEmail && (
          <Button
            onClick={onComposeEmail}
            className="px-4 py-2 bg-rose-400 hover:bg-rose-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            ✏️ Compose Email
          </Button>
        )}
      </div>

      {/* Email Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/3 rounded-lg p-4 border border-white/8">
          <p className="text-xs text-white/60 mb-1">Total Sent</p>
          <p className="text-xl font-bold text-white">
            {campaigns.reduce((sum, c) => sum + c.sentCount, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white/3 rounded-lg p-4 border border-white/8">
          <p className="text-xs text-white/60 mb-1">Avg Open Rate</p>
          <p className="text-xl font-bold text-white">
            {(campaigns.length > 0 
              ? campaigns.reduce((sum, c) => sum + c.openRate, 0) / campaigns.length 
              : 0 * 100
            ).toFixed(1)}%
          </p>
        </div>
        <div className="bg-white/3 rounded-lg p-4 border border-white/8">
          <p className="text-xs text-white/60 mb-1">Avg Click Rate</p>
          <p className="text-xl font-bold text-white">
            {(campaigns.length > 0 
              ? campaigns.reduce((sum, c) => sum + c.clickRate, 0) / campaigns.length 
              : 0 * 100
            ).toFixed(1)}%
          </p>
        </div>
        <div className="bg-white/3 rounded-lg p-4 border border-white/8">
          <p className="text-xs text-white/60 mb-1">Total Revenue</p>
          <p className="text-xl font-bold text-emerald-400">
            ${campaigns.reduce((sum, c) => sum + c.revenue, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Campaign List */}
      <div className="space-y-3">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="flex items-center justify-between p-4 bg-white/3 rounded-lg border border-white/8 hover:border-rose-400/30 transition-all"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-400/20 to-purple-400/20 flex items-center justify-center">
                <span className="text-2xl">{getTypeIcon(campaign.type)}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white">{campaign.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(campaign.status)}`}>
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </span>
                  <span className="text-xs text-white/50">
                    {campaign.sentCount.toLocaleString()} sent
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Open Rate */}
              <div className="text-right">
                <p className="text-xs text-white/60 mb-1">Open Rate</p>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${getPerformanceBadge(campaign.openRate)}`}>
                    {(campaign.openRate * 100).toFixed(1)}%
                  </span>
                  <div className="w-16 bg-white/10 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        campaign.openRate >= 0.25 ? 'bg-emerald-400' :
                        campaign.openRate >= 0.15 ? 'bg-blue-400' :
                        campaign.openRate >= 0.08 ? 'bg-amber-400' : 'bg-rose-400'
                      }`}
                      style={{ width: `${Math.min(campaign.openRate * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Click Rate */}
              <div className="text-right">
                <p className="text-xs text-white/60 mb-1">Click Rate</p>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${getPerformanceBadge(campaign.clickRate)}`}>
                    {(campaign.clickRate * 100).toFixed(1)}%
                  </span>
                  <div className="w-16 bg-white/10 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        campaign.clickRate >= 0.25 ? 'bg-emerald-400' :
                        campaign.clickRate >= 0.15 ? 'bg-blue-400' :
                        campaign.clickRate >= 0.08 ? 'bg-amber-400' : 'bg-rose-400'
                      }`}
                      style={{ width: `${Math.min(campaign.clickRate * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Revenue */}
              <div className="text-right">
                <p className="text-xs text-white/60 mb-1">Revenue</p>
                <p className="text-sm font-bold text-emerald-400">${campaign.revenue.toLocaleString()}</p>
              </div>

              {/* Actions */}
              <Button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 text-xs rounded transition-colors">
                View Report
              </Button>
            </div>
          </div>
        ))}
      </div>

      {campaigns.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-white/60">No email campaigns yet</p>
          <p className="text-xs text-white/40 mt-1">Start engaging your customers with targeted emails</p>
        </div>
      )}
    </GlassPanel>
  );
};

export default EmailMarketing;
