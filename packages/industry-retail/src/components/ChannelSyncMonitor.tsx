// @ts-nocheck
'use client';

import React from 'react';
import { GlassPanel, Button } from '@vayva/ui/components/fashion';

interface ChannelStatus {
  channelId: string;
  channelName: string;
  channelType: 'online' | 'pos' | 'marketplace' | 'social' | 'mobile';
  status: 'synced' | 'syncing' | 'error' | 'pending';
  lastSyncAt?: string;
  nextSyncAt?: string;
  itemsSynced: number;
  itemsFailed: number;
  syncDuration: number;
}

export interface ChannelSyncMonitorProps {
  channels?: ChannelStatus[];
  onSyncNow?: (channelId: string) => void;
  onConfigure?: (channelId: string) => void;
  autoSyncEnabled?: boolean;
  syncInterval?: number;
}

export const ChannelSyncMonitor: React.FC<ChannelSyncMonitorProps> = ({
  channels = [],
  onSyncNow,
  onConfigure,
  autoSyncEnabled = true,
  syncInterval = 15,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'synced': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'syncing': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'error': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getChannelTypeIcon = (type: string) => {
    switch (type) {
      case 'online': return '🌐';
      case 'pos': return '🏪';
      case 'marketplace': return '🛒';
      case 'social': return '📱';
      case 'mobile': return '📲';
      default: return '📊';
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleTimeString();
  };

  const syncedCount = channels.filter(c => c.status === 'synced').length;
  const errorCount = channels.filter(c => c.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Channel Sync Monitor</h2>
          <p className="text-sm text-white/60 mt-1">
            Omnichannel synchronization • Auto-sync every {syncInterval}min
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs ${autoSyncEnabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
            {autoSyncEnabled ? 'Auto-Sync Enabled' : 'Auto-Sync Disabled'}
          </span>
          <Button variant="primary" onClick={() => channels.forEach(c => onSyncNow?.(c.channelId))}>
            Sync All Now
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassPanel variant="bordered" className="p-4">
          <div className="text-sm text-white/60 mb-2">Total Channels</div>
          <div className="text-2xl font-bold text-white">{channels.length}</div>
        </GlassPanel>
        <GlassPanel variant="bordered" className="p-4">
          <div className="text-sm text-white/60 mb-2">Synced</div>
          <div className="text-2xl font-bold text-green-400">{syncedCount}</div>
        </GlassPanel>
        <GlassPanel variant="bordered" className="p-4">
          <div className="text-sm text-white/60 mb-2">Errors</div>
          <div className="text-2xl font-bold text-red-400">{errorCount}</div>
        </GlassPanel>
        <GlassPanel variant="bordered" className="p-4">
          <div className="text-sm text-white/60 mb-2">Success Rate</div>
          <div className="text-2xl font-bold text-white">
            {channels.length > 0 ? ((syncedCount / channels.length) * 100).toFixed(0) : 0}%
          </div>
        </GlassPanel>
      </div>

      {/* Channels List */}
      <GlassPanel variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Channel Status</h3>
        <div className="space-y-3">
          {channels.map((channel) => (
            <div
              key={channel.channelId}
              className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="text-3xl">{getChannelTypeIcon(channel.channelType)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-white">{channel.channelName}</h4>
                    <span className={`px-2 py-1 rounded text-xs border capitalize ${getStatusColor(channel.status)}`}>
                      {channel.status}
                    </span>
                  </div>
                  <div className="text-sm text-white/60">
                    Last sync: {formatTime(channel.lastSyncAt)} • Next sync: {formatTime(channel.nextSyncAt)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-sm text-white/60 mb-1">Items Synced</div>
                  <div className="text-lg font-bold text-white">{channel.itemsSynced.toLocaleString()}</div>
                  {channel.itemsFailed > 0 && (
                    <div className="text-xs text-red-400">{channel.itemsFailed} failed</div>
                  )}
                </div>

                <div className="text-right">
                  <div className="text-sm text-white/60 mb-1">Duration</div>
                  <div className="text-lg font-bold text-white">{formatDuration(channel.syncDuration)}</div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onConfigure?.(channel.channelId)}
                  >
                    Configure
                  </Button>
                  <Button
                    variant={channel.status === 'syncing' ? 'ghost' : 'primary'}
                    size="sm"
                    disabled={channel.status === 'syncing'}
                    onClick={() => onSyncNow?.(channel.channelId)}
                  >
                    {channel.status === 'syncing' ? 'Syncing...' : 'Sync Now'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>

      {/* Recent Sync Activity */}
      <GlassPanel variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Sync Activity</h3>
        <div className="space-y-2">
          {channels
            .filter(c => c.lastSyncAt)
            .sort((a, b) => new Date(b.lastSyncAt!).getTime() - new Date(a.lastSyncAt!).getTime())
            .slice(0, 5)
            .map((channel) => (
              <div key={channel.channelId} className="flex items-center justify-between p-3 rounded bg-white/5">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    channel.status === 'synced' ? 'bg-green-500' :
                    channel.status === 'error' ? 'bg-red-500' :
                    channel.status === 'syncing' ? 'bg-blue-500' : 'bg-yellow-500'
                  }`} />
                  <span className="text-sm text-white/80">{channel.channelName}</span>
                  <span className="text-xs text-white/40">synced {channel.itemsSynced} items</span>
                </div>
                <span className="text-xs text-white/40">{formatTime(channel.lastSyncAt)}</span>
              </div>
            ))}
        </div>
      </GlassPanel>
    </div>
  );
};
