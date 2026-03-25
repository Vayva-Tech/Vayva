/**
 * Multi-Channel Management Dashboard
 * Channel status, inventory sync, and performance monitoring
 */
"use client";

import { Button } from "@vayva/ui";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShareNetwork, 
  CheckCircle,
  Warning,
  XCircle,
  ArrowsClockwise,
  ShoppingCart,
  CurrencyDollar,
  TrendUp,
  Storefront,
  Globe,
  AmazonLogo,
  GoogleLogo,
  FacebookLogo,
  InstagramLogo
} from '@phosphor-icons/react';
import useSWR from 'swr';
import { apiJson } from '@/lib/api-client-shared';
import { GradientHeader, ThemedCard, getThemeColors } from '@/lib/design-system/theme-components';
import { useStore } from '@/providers/store-provider';
import { toast } from 'sonner';

// Types
interface Channel {
  id: string;
  name: string;
  platform: 'shopify' | 'woocommerce' | 'amazon' | 'ebay' | 'facebook' | 'instagram' | 'google' | 'custom';
  status: 'connected' | 'disconnected' | 'syncing' | 'error';
  lastSync: string;
  products: number;
  orders: number;
  revenue: number;
  syncFrequency: string;
  error?: string;
}

interface SyncStatus {
  channelId: string;
  status: 'idle' | 'syncing' | 'completed' | 'failed';
  progress: number;
  itemsProcessed: number;
  totalItems: number;
  lastAttempt: string;
  nextScheduled: string;
}

interface ChannelPerformance {
  channelId: string;
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  conversionRate: number;
}

// Main Multi-Channel Dashboard
export default function MultiChannelDashboard() {
  const { store } = useStore();
  const colors = getThemeColors(store?.industrySlug || 'default');
  const [activeTab, setActiveTab] = useState<'channels' | 'sync' | 'performance'>('channels');
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  // Fetch channels
  const { data: channels, isLoading: channelsLoading } = useSWR<Channel[]>(
    '/api/channel-manager/channels',
    async (url: string) => {
      try {
        const response = await apiJson<{ channels: Channel[] }>(url);
        return response.channels || [];
      } catch (error) {
        console.error('Failed to fetch channels:', error);
        return [];
      }
    }
  );

  // Fetch sync status
  const { data: syncStatus, isLoading: syncLoading } = useSWR<SyncStatus[]>(
    '/api/inventory/sync-status',
    async (url: string) => {
      try {
        const response = await apiJson<{ status: SyncStatus[] }>(url);
        return response.status || [];
      } catch (error) {
        console.error('Failed to fetch sync status:', error);
        return [];
      }
    }
  );

  // Fetch performance data
  const { data: performance, isLoading: performanceLoading } = useSWR<ChannelPerformance[]>(
    '/api/channel-manager/performance',
    async (url: string) => {
      try {
        const response = await apiJson<{ performance: ChannelPerformance[] }>(url);
        return response.performance || [];
      } catch (error) {
        console.error('Failed to fetch performance data:', error);
        return [];
      }
    }
  );

  const tabs = [
    { id: 'channels', label: 'Channel Status', icon: <ShareNetwork className="h-4 w-4" /> },
    { id: 'sync', label: 'Sync Monitor', icon: <ArrowsClockwise className="h-4 w-4" /> },
    { id: 'performance', label: 'Performance', icon: <TrendUp className="h-4 w-4" /> }
  ];

  return (
    <div className="space-y-6">
      <GradientHeader
        title="Multi-Channel Management"
        subtitle="Manage all your sales channels and monitor performance"
        industry={store?.industrySlug || 'default'}
        icon={<Globe className="h-8 w-8" />}
      />

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {tab.icon}
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'channels' && (
        <ChannelStatusView 
          channels={channels || []}
          loading={channelsLoading}
          selectedChannel={selectedChannel}
          onSelectChannel={setSelectedChannel}
        />
      )}
      
      {activeTab === 'sync' && (
        <SyncMonitor 
          syncStatus={syncStatus || []}
          loading={syncLoading}
          channels={channels || []}
        />
      )}
      
      {activeTab === 'performance' && (
        <PerformanceAnalytics 
          performance={performance || []}
          loading={performanceLoading}
          channels={channels || []}
        />
      )}
    </div>
  );
}

// Channel Status View Component
function ChannelStatusView({ 
  channels, 
  loading, 
  selectedChannel,
  onSelectChannel
}: any) {
  const { store } = useStore();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'shopify': return <Storefront className="h-6 w-6 text-green-600" />;
      case 'woocommerce': return <Globe className="h-6 w-6 text-purple-600" />;
      case 'amazon': return <AmazonLogo className="h-6 w-6 text-yellow-600" />;
      case 'ebay': return <Globe className="h-6 w-6 text-blue-600" />;
      case 'facebook': return <FacebookLogo className="h-6 w-6 text-blue-600" />;
      case 'instagram': return <InstagramLogo className="h-6 w-6 text-pink-600" />;
      case 'google': return <GoogleLogo className="h-6 w-6 text-red-600" />;
      default: return <Globe className="h-6 w-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'disconnected': return 'bg-red-100 text-red-800';
      case 'syncing': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {channels.map((channel: Channel, index: number) => (
        <motion.div
          key={channel.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <ThemedCard 
            industry={store?.industrySlug || 'default'}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedChannel === channel.id ? 'ring-2 ring-green-500' : ''
            }`}
            onClick={() => onSelectChannel(channel.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {getPlatformIcon(channel.platform)}
                <div>
                  <h3 className="font-semibold">{channel.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{channel.platform}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(channel.status)}`}>
                {channel.status}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-100 rounded-lg">
                <p className="text-2xl font-bold">{channel.products?.toLocaleString() || '0'}</p>
                <p className="text-xs text-gray-500">Products</p>
              </div>
              <div className="text-center p-3 bg-gray-100 rounded-lg">
                <p className="text-2xl font-bold">{channel.orders?.toLocaleString() || '0'}</p>
                <p className="text-xs text-gray-500">Orders</p>
              </div>
              <div className="text-center p-3 bg-gray-100 rounded-lg">
                <p className="text-2xl font-bold">₦{(channel.revenue / 1000).toFixed(0)}k</p>
                <p className="text-xs text-gray-500">Revenue</p>
              </div>
              <div className="text-center p-3 bg-gray-100 rounded-lg">
                <p className="text-sm font-medium">{channel.syncFrequency}</p>
                <p className="text-xs text-gray-500">Sync</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Last sync: {new Date(channel.lastSync).toLocaleDateString()}</span>
              <Button className="text-green-500 hover:underline">View Details</Button>
            </div>
            
            {channel.error && (
              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-700">{channel.error}</p>
              </div>
            )}
          </ThemedCard>
        </motion.div>
      ))}
    </div>
  );
}

// Sync Monitor Component
function SyncMonitor({ syncStatus, loading, channels }: { syncStatus: SyncStatus[]; loading: boolean; channels: Channel[] }) {
  const { store } = useStore();

  if (loading) {
    return (
      <ThemedCard industry={store?.industrySlug || 'default'}>
        <div className="space-y-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </ThemedCard>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'syncing': return <ArrowsClockwise className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'failed': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Warning className="h-5 w-5 text-yellow-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <ThemedCard industry={store?.industrySlug || 'default'}>
        <h3 className="font-semibold mb-6 flex items-center gap-2">
          <ArrowsClockwise className="h-5 w-5" />
          Sync Status
        </h3>
        
        <div className="space-y-4">
          {syncStatus.map((sync: SyncStatus, index: number) => {
            const channel = channels.find(c => c.id === sync.channelId);
            return (
              <motion.div
                key={sync.channelId}
                className="p-4 border border-gray-100 rounded-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(sync.status)}
                    <div>
                      <h4 className="font-medium">{channel?.name || 'Unknown Channel'}</h4>
                      <p className="text-sm text-gray-500">
                        {sync.itemsProcessed} of {sync.totalItems} items processed
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    sync.status === 'completed' ? 'bg-green-100 text-green-800' :
                    sync.status === 'syncing' ? 'bg-blue-100 text-blue-800' :
                    sync.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {sync.status.charAt(0).toUpperCase() + sync.status.slice(1)}
                  </span>
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{Math.round(sync.progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${sync.progress}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Last attempt: {new Date(sync.lastAttempt).toLocaleTimeString()}</span>
                  <span>Next sync: {new Date(sync.nextScheduled).toLocaleTimeString()}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </ThemedCard>

      {/* Sync Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ThemedCard industry={store?.industrySlug || 'default'}>
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button className="w-full flex items-center gap-2 p-3 bg-green-500 text-white rounded-lg hover:opacity-90 transition-opacity">
              <ArrowsClockwise className="h-4 w-4" />
              Sync All Channels
            </Button>
            <Button className="w-full flex items-center gap-2 p-3 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors">
              <ShoppingCart className="h-4 w-4" />
              Sync Orders Only
            </Button>
            <Button className="w-full flex items-center gap-2 p-3 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors">
              <CurrencyDollar className="h-4 w-4" />
              Sync Inventory Only
            </Button>
          </div>
        </ThemedCard>

        <ThemedCard industry={store?.industrySlug || 'default'}>
          <h3 className="font-semibold mb-4">Sync Schedule</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Every 15 minutes</span>
              <span className="text-sm text-gray-500">High Priority</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Hourly</span>
              <span className="text-sm text-gray-500">Normal</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Daily</span>
              <span className="text-sm text-gray-500">Low Priority</span>
            </div>
          </div>
        </ThemedCard>

        <ThemedCard industry={store?.industrySlug || 'default'}>
          <h3 className="font-semibold mb-4">Sync Health</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Success Rate</span>
                <span>98.5%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '98.5%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Avg. Sync Time</span>
                <span>2.3 min</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }} />
              </div>
            </div>
          </div>
        </ThemedCard>
      </div>
    </div>
  );
}

// Performance Analytics Component
function PerformanceAnalytics({ performance, loading, channels }: { performance: ChannelPerformance[]; loading: boolean; channels: Channel[] }) {
  const { store } = useStore();

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="h-96 bg-gray-100 rounded-xl animate-pulse" />
        </div>
        <div>
          <div className="space-y-6">
            {[1,2,3].map(i => (
              <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Aggregate performance data by channel
  const channelMetrics = channels.map(channel => {
    const channelPerf = performance.filter(p => p.channelId === channel.id);
    const totalImpressions = channelPerf.reduce((sum, p) => sum + p.impressions, 0);
    const totalClicks = channelPerf.reduce((sum, p) => sum + p.clicks, 0);
    const totalRevenue = channelPerf.reduce((sum, p) => sum + p.revenue, 0);
    
    return {
      channelId: channel.id,
      channelName: channel.name,
      impressions: totalImpressions,
      clicks: totalClicks,
      ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
      revenue: totalRevenue
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Performance Chart Area */}
      <div className="lg:col-span-2">
        <ThemedCard industry={store?.industrySlug || 'default'}>
          <h3 className="font-semibold mb-6 flex items-center gap-2">
            <TrendUp className="h-5 w-5" />
            Performance Trends
          </h3>
          
          <div className="h-80 bg-gradient-to-br from-muted/20 to-muted/5 rounded-xl border border-gray-100 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <TrendUp className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">Performance Charts</p>
              <p className="text-sm mt-1">Interactive charts showing channel performance over time</p>
            </div>
          </div>
        </ThemedCard>
      </div>

      {/* Channel Performance Cards */}
      <div className="space-y-6">
        <ThemedCard industry={store?.industrySlug || 'default'}>
          <h3 className="font-semibold mb-4">Top Performing Channels</h3>
          <div className="space-y-4">
            {channelMetrics
              .sort((a, b) => b.revenue - a.revenue)
              .slice(0, 3)
              .map((metric, index) => (
                <div key={metric.channelId} className="p-3 border border-gray-100 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">{metric.channelName}</h4>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                      #{index + 1}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Revenue</span>
                      <span className="font-medium">₦{(metric.revenue / 1000).toFixed(1)}k</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">CTR</span>
                      <span className="font-medium">{metric.ctr.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </ThemedCard>

        <ThemedCard industry={store?.industrySlug || 'default'}>
          <h3 className="font-semibold mb-4">Overall Metrics</h3>
          <div className="space-y-4">
            <div className="text-center p-4 bg-gray-100 rounded-lg">
              <p className="text-2xl font-bold">
                {(channelMetrics.reduce((sum, m) => sum + m.impressions, 0) / 1000000).toFixed(1)}M
              </p>
              <p className="text-sm text-gray-500">Total Impressions</p>
            </div>
            <div className="text-center p-4 bg-gray-100 rounded-lg">
              <p className="text-2xl font-bold">
                ₦{(channelMetrics.reduce((sum, m) => sum + m.revenue, 0) / 1000000).toFixed(1)}M
              </p>
              <p className="text-sm text-gray-500">Total Revenue</p>
            </div>
            <div className="text-center p-4 bg-gray-100 rounded-lg">
              <p className="text-2xl font-bold">
                {channelMetrics.length}
              </p>
              <p className="text-sm text-gray-500">Active Channels</p>
            </div>
          </div>
        </ThemedCard>
      </div>
    </div>
  );
}