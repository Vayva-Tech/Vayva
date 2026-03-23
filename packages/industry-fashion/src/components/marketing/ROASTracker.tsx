// @ts-nocheck
import React from 'react';
import { GlassPanel } from '@vayva/ui/components/fashion';

export interface ROASData {
  campaignId: string;
  campaignName: string;
  channel: 'facebook' | 'instagram' | 'google' | 'tiktok' | 'email' | 'influencer';
  spend: number;
  revenue: number;
  roas: number;
  orders: number;
  cpa: number;
  ctr: number;
  conversionRate: number;
}

export interface ROASTrackerProps {
  campaigns?: ROASData[];
  timeRange?: '7d' | '30d' | '90d' | 'all';
}

export const ROASTracker: React.FC<ROASTrackerProps> = ({
  campaigns = [],
  timeRange = '30d',
}) => {
  const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);
  const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
  const avgROAS = campaigns.length > 0 
    ? campaigns.reduce((sum, c) => sum + c.roas, 0) / campaigns.length 
    : 0;

  const getROASColor = (roas: number) => {
    if (roas >= 4) return 'text-emerald-400';
    if (roas >= 2) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getROASBadge = (roas: number) => {
    if (roas >= 4) return 'bg-emerald-400/20 text-emerald-400';
    if (roas >= 2) return 'bg-amber-400/20 text-amber-400';
    return 'bg-rose-400/20 text-rose-400';
  };

  const getChannelIcon = (channel: string) => {
    const icons: Record<string, string> = {
      facebook: '📘',
      instagram: '📸',
      google: '🔍',
      tiktok: '🎵',
      email: '📧',
      influencer: '👥',
    };
    return icons[channel] || '📊';
  };

  return (
    <GlassPanel variant="elevated" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Marketing ROI Tracker</h2>
        <select
          value={timeRange}
          onChange={(e) => {}}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-rose-400"
        >
          <option value="7d" className="bg-[#0F0F0F]">Last 7 days</option>
          <option value="30d" className="bg-[#0F0F0F]">Last 30 days</option>
          <option value="90d" className="bg-[#0F0F0F]">Last 90 days</option>
          <option value="all" className="bg-[#0F0F0F]">All time</option>
        </select>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/3 rounded-lg p-4 border border-white/8">
          <p className="text-xs text-white/60 mb-1">Total Spend</p>
          <p className="text-xl font-bold text-white">${totalSpend.toLocaleString()}</p>
        </div>
        <div className="bg-white/3 rounded-lg p-4 border border-white/8">
          <p className="text-xs text-white/60 mb-1">Total Revenue</p>
          <p className="text-xl font-bold text-emerald-400">${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white/3 rounded-lg p-4 border border-white/8">
          <p className="text-xs text-white/60 mb-1">Avg ROAS</p>
          <p className={`text-xl font-bold ${getROASColor(avgROAS)}`}>
            {avgROAS.toFixed(1)}x
          </p>
        </div>
        <div className="bg-white/3 rounded-lg p-4 border border-white/8">
          <p className="text-xs text-white/60 mb-1">Net Profit</p>
          <p className={`text-xl font-bold ${totalRevenue - totalSpend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ${(totalRevenue - totalSpend).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Campaign Performance Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-xs font-medium text-white/60 uppercase">Campaign</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-white/60 uppercase">Spend</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-white/60 uppercase">Revenue</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-white/60 uppercase">ROAS</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-white/60 uppercase">Orders</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-white/60 uppercase">CPA</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-white/60 uppercase">CTR</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-white/60 uppercase">Conv. Rate</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr
                key={campaign.campaignId}
                className="border-b border-white/5 hover:bg-white/3 transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getChannelIcon(campaign.channel)}</span>
                    <div>
                      <p className="text-sm font-medium text-white">{campaign.campaignName}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${getROASBadge(campaign.roas)}`}>
                        {campaign.roas.toFixed(1)}x
                      </span>
                    </div>
                  </div>
                </td>
                <td className="text-right py-4 px-4 text-sm text-white/80">
                  ${campaign.spend.toLocaleString()}
                </td>
                <td className="text-right py-4 px-4 text-sm font-medium text-emerald-400">
                  ${campaign.revenue.toLocaleString()}
                </td>
                <td className={`text-right py-4 px-4 text-sm font-bold ${getROASColor(campaign.roas)}`}>
                  {campaign.roas.toFixed(1)}x
                </td>
                <td className="text-right py-4 px-4 text-sm text-white/80">
                  {campaign.orders}
                </td>
                <td className="text-right py-4 px-4 text-sm text-white/80">
                  ${campaign.cpa.toFixed(2)}
                </td>
                <td className="text-right py-4 px-4 text-sm text-white/80">
                  {(campaign.ctr * 100).toFixed(1)}%
                </td>
                <td className="text-right py-4 px-4 text-sm text-white/80">
                  {(campaign.conversionRate * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {campaigns.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-white/60">No campaigns found for this period</p>
          <p className="text-xs text-white/40 mt-1">Start running campaigns to see ROI metrics</p>
        </div>
      )}
    </GlassPanel>
  );
};

export default ROASTracker;
