import { Button } from "@vayva/ui";
/**
 * Advanced Analytics Dashboard Components
 * Implements customer segmentation, cohort analysis, and marketing attribution
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  TrendUp as TrendingUp,
  Target,
  ChartBar as BarChart,
  ChartPie as PieChart,
  Calendar,
  Funnel as Filter,
  DownloadSimple as Download,
  ArrowsClockwise as RefreshCw
} from '@phosphor-icons/react';
import useSWR from 'swr';
import { apiJson } from '@/lib/api-client-shared';
import { GradientHeader, ThemedCard, getThemeColors } from '@/lib/design-system/theme-components';
import { useStore } from '@/providers/store-provider';
import { toast } from 'sonner';

// Types
interface CustomerSegment {
  id: string;
  name: string;
  customerCount: number;
  revenue: number;
  growth: number;
  percentage: number;
  avgOrderValue: number;
  lifetimeValue: number;
}

interface CohortData {
  period: string;
  startDate: string;
  endDate: string;
  initialCustomers: number;
  retentionRates: {
    day7: number;
    day30: number;
    day90: number;
    day180: number;
  };
  revenueRetention: number;
}

interface AttributionChannel {
  channel: string;
  conversions: number;
  revenue: number;
  cost: number;
  roi: number;
  attributionPercent: number;
}

interface AnalyticsOverview {
  totalCustomers: number;
  activeCustomers: number;
  customerGrowth: number;
  avgLifetimeValue: number;
  churnRate: number;
  revenueAttribution: number;
}

const EMPTY_ANALYTICS_OVERVIEW: AnalyticsOverview = {
  totalCustomers: 0,
  activeCustomers: 0,
  customerGrowth: 0,
  avgLifetimeValue: 0,
  churnRate: 0,
  revenueAttribution: 0,
};

// Main Analytics Dashboard Component
export default function AdvancedAnalyticsDashboard() {
  const { store } = useStore();
  const colors = getThemeColors(store?.industrySlug || 'default');
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeTab, setActiveTab] = useState<'segments' | 'cohorts' | 'attribution'>('segments');

  // Fetch analytics overview data
  const { data: overview, isLoading: overviewLoading } = useSWR<AnalyticsOverview>(
    `/api/analytics/overview?range=${timeframe}`,
    async (url: string) => {
      try {
        const response = await apiJson<AnalyticsOverview>(url);
        return response;
      } catch (error) {
        console.error('Failed to fetch analytics overview:', error);
        toast.error('Failed to load analytics data');
        return EMPTY_ANALYTICS_OVERVIEW;
      }
    }
  );

  const tabs = [
    { id: 'segments', label: 'Customer Segments', icon: <Users className="h-4 w-4" /> },
    { id: 'cohorts', label: 'Cohort Analysis', icon: <BarChart className="h-4 w-4" /> },
    { id: 'attribution', label: 'Marketing Attribution', icon: <Target className="h-4 w-4" /> }
  ];

  return (
    <div className="space-y-6">
      <GradientHeader
        title="Advanced Analytics"
        subtitle="Deep insights into customer behavior and marketing performance"
        industry={store?.industrySlug || 'default'}
        icon={<PieChart className="h-8 w-8" />}
      />

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-gray-100 hover:bg-gray-100 text-gray-500'
              }`}
            >
              {tab.icon}
              {tab.label}
            </Button>
          ))}
        </div>
        
        <div className="flex gap-3">
          <select 
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="px-4 py-2 border border-gray-100 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          
          <Button className="flex items-center gap-2 px-4 py-2 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors">
            <Download className="h-4 w-4" />
            Export
          </Button>
          
          <Button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:opacity-90 transition-opacity">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      {!overviewLoading && overview && (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-5 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Customers</p>
                <p className="text-2xl font-bold" style={{ color: colors.primary }}>
                  {overview.totalCustomers?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.primary}15` }}>
                <Users className="h-6 w-6" style={{ color: colors.primary }} />
              </div>
            </div>
          </ThemedCard>
          
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Customers</p>
                <p className="text-2xl font-bold" style={{ color: colors.secondary }}>
                  {overview.activeCustomers?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.secondary}15` }}>
                <TrendingUp className="h-6 w-6" style={{ color: colors.secondary }} />
              </div>
            </div>
          </ThemedCard>
          
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Avg. LTV</p>
                <p className="text-2xl font-bold" style={{ color: colors.accent }}>
                  ₦{(overview.avgLifetimeValue || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.accent}15` }}>
                <Target className="h-6 w-6" style={{ color: colors.accent }} />
              </div>
            </div>
          </ThemedCard>
          
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Churn Rate</p>
                <p className="text-2xl font-bold" style={{ color: colors.primary }}>
                  {overview.churnRate || 0}%
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.primary}15` }}>
                <Calendar className="h-6 w-6" style={{ color: colors.primary }} />
              </div>
            </div>
          </ThemedCard>
          
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Attributed Revenue</p>
                <p className="text-2xl font-bold" style={{ color: colors.secondary }}>
                  ₦{(overview.revenueAttribution || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.secondary}15` }}>
                <BarChart className="h-6 w-6" style={{ color: colors.secondary }} />
              </div>
            </div>
          </ThemedCard>
        </motion.div>
      )}

      {/* Tab Content */}
      {activeTab === 'segments' && (
        <CustomerSegmentationWidget timeframe={timeframe} />
      )}
      
      {activeTab === 'cohorts' && (
        <CohortAnalysisWidget timeframe={timeframe} />
      )}
      
      {activeTab === 'attribution' && (
        <MarketingAttributionWidget timeframe={timeframe} />
      )}
    </div>
  );
}

// Customer Segmentation Widget
function CustomerSegmentationWidget({ timeframe }: { timeframe: string }) {
  const { store } = useStore();
  const { data: segments, isLoading } = useSWR<CustomerSegment[]>(
    `/api/analytics/customer-segments?range=${timeframe}`,
    async (url: string) => {
      try {
        const response = await apiJson<{ segments: CustomerSegment[] }>(url);
        return response.segments || [];
      } catch (error) {
        console.error('Failed to fetch customer segments:', error);
        return [];
      }
    }
  );

  if (isLoading) {
    return (
      <ThemedCard industry={store?.industrySlug || 'default'}>
        <div className="space-y-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </ThemedCard>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ThemedCard industry={store?.industrySlug || 'default'}>
        <h3 className="font-semibold mb-6 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Customer Segments
        </h3>
        
        <div className="space-y-4">
          {segments?.slice(0, 5).map((segment, index) => (
            <motion.div
              key={segment.id}
              className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-100 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div>
                <h4 className="font-medium">{segment.name}</h4>
                <p className="text-sm text-gray-500">
                  {segment.customerCount?.toLocaleString() || '0'} customers
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">₦{(segment.revenue || 0).toLocaleString()}</p>
                <p className={`text-sm ${segment.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {segment.growth >= 0 ? '+' : ''}{segment.growth || 0}%
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </ThemedCard>

      <ThemedCard industry={store?.industrySlug || 'default'}>
        <h3 className="font-semibold mb-6">Segment Distribution</h3>
        <div className="space-y-4">
          {segments?.slice(0, 5).map((segment, index) => (
            <div key={segment.id} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{segment.name}</span>
                <span>{segment.percentage || 0}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <motion.div
                  className="bg-green-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${segment.percentage || 0}%` }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                />
              </div>
            </div>
          ))}
        </div>
      </ThemedCard>
    </div>
  );
}

// Cohort Analysis Widget
function CohortAnalysisWidget({ timeframe }: { timeframe: string }) {
  const { store } = useStore();
  const { data: cohorts, isLoading } = useSWR<CohortData[]>(
    `/api/analytics/cohort-analysis?range=${timeframe}`,
    async (url: string) => {
      try {
        const response = await apiJson<{ cohorts: CohortData[] }>(url);
        return response.cohorts || [];
      } catch (error) {
        console.error('Failed to fetch cohort data:', error);
        return [];
      }
    }
  );

  if (isLoading) {
    return (
      <ThemedCard industry={store?.industrySlug || 'default'}>
        <div className="h-96 bg-gray-100 rounded-xl animate-pulse" />
      </ThemedCard>
    );
  }

  return (
    <ThemedCard industry={store?.industrySlug || 'default'}>
      <h3 className="font-semibold mb-6 flex items-center gap-2">
        <BarChart className="h-5 w-5" />
        Cohort Retention Analysis
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 font-medium">Cohort</th>
              <th className="text-center py-3 px-4 font-medium">Initial</th>
              <th className="text-center py-3 px-4 font-medium">7-Day</th>
              <th className="text-center py-3 px-4 font-medium">30-Day</th>
              <th className="text-center py-3 px-4 font-medium">90-Day</th>
              <th className="text-center py-3 px-4 font-medium">Revenue Retention</th>
            </tr>
          </thead>
          <tbody>
            {cohorts?.map((cohort, index) => (
              <motion.tr
                key={cohort.period}
                className="border-b border-gray-100 hover:bg-gray-100 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <td className="py-4 px-4 font-medium">
                  {new Date(cohort.startDate).toLocaleDateString()}
                </td>
                <td className="py-4 px-4 text-center">
                  {cohort.initialCustomers?.toLocaleString() || '0'}
                </td>
                <td className="py-4 px-4 text-center">
                  <RetentionCell 
                    rate={cohort.retentionRates?.day7 || 0} 
                    initial={cohort.initialCustomers || 0}
                  />
                </td>
                <td className="py-4 px-4 text-center">
                  <RetentionCell 
                    rate={cohort.retentionRates?.day30 || 0} 
                    initial={cohort.initialCustomers || 0}
                  />
                </td>
                <td className="py-4 px-4 text-center">
                  <RetentionCell 
                    rate={cohort.retentionRates?.day90 || 0} 
                    initial={cohort.initialCustomers || 0}
                  />
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="font-medium">
                    ₦{(cohort.revenueRetention || 0).toLocaleString()}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </ThemedCard>
  );
}

// Marketing Attribution Widget
function MarketingAttributionWidget({ timeframe }: { timeframe: string }) {
  const { store } = useStore();
  const { data: channels, isLoading } = useSWR<AttributionChannel[]>(
    `/api/analytics/attribution?range=${timeframe}`,
    async (url: string) => {
      try {
        const response = await apiJson<{ channels: AttributionChannel[] }>(url);
        return response.channels || [];
      } catch (error) {
        console.error('Failed to fetch attribution data:', error);
        return [];
      }
    }
  );

  if (isLoading) {
    return (
      <ThemedCard industry={store?.industrySlug || 'default'}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </ThemedCard>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <ThemedCard industry={store?.industrySlug || 'default'}>
        <h3 className="font-semibold mb-6">Channel Performance</h3>
        <div className="space-y-4">
          {channels?.map((channel, index) => (
            <motion.div
              key={channel.channel}
              className="p-4 border border-gray-100 rounded-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{channel.channel}</h4>
                <span className="text-2xl font-bold">₦{(channel.revenue || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mb-3">
                <span>{channel.conversions?.toLocaleString() || '0'} conversions</span>
                <span>ROI: {channel.roi || 0}x</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${channel.attributionPercent || 0}%` }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </ThemedCard>

      <ThemedCard industry={store?.industrySlug || 'default'}>
        <h3 className="font-semibold mb-6">ROI Analysis</h3>
        <div className="space-y-4">
          {channels?.sort((a, b) => (b.roi || 0) - (a.roi || 0)).map((channel, index) => (
            <div key={channel.channel} className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
              <span className="font-medium">{channel.channel}</span>
              <span className={`font-bold ${channel.roi >= 1 ? 'text-green-600' : 'text-red-600'}`}>
                {channel.roi || 0}x
              </span>
            </div>
          ))}
        </div>
      </ThemedCard>

      <ThemedCard industry={store?.industrySlug || 'default'}>
        <h3 className="font-semibold mb-6">Cost Efficiency</h3>
        <div className="space-y-4">
          {channels?.sort((a, b) => (a.cost || 0) - (b.cost || 0)).map((channel, index) => (
            <div key={channel.channel} className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
              <span className="font-medium">{channel.channel}</span>
              <span className="font-bold">₦{(channel.cost || 0).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </ThemedCard>
    </div>
  );
}

// Helper Components
function RetentionCell({ rate, initial }: { rate: number; initial: number }) {
  const retained = Math.round((initial * rate) / 100);
  const color = rate >= 50 ? 'text-green-600' : rate >= 25 ? 'text-yellow-600' : 'text-red-600';
  
  return (
    <div className="text-center">
      <div className={`font-medium ${color}`}>
        {rate}%
      </div>
      <div className="text-xs text-gray-500">
        {retained} customers
      </div>
    </div>
  );
}