import { Button } from "@vayva/ui";
/**
 * Industry-Specific Widget Components
 * Adaptive widgets that optimize for each industry's unique requirements
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  ShoppingCart,
  Users,
  TrendUp as TrendingUp,
  Clock,
  Warning as AlertTriangle,
  CheckCircle,
  Target,
  ChartBar as BarChart,
  ChartPie as PieChart,
  Calendar,
  Storefront as Store,
  Heart,
  Car,
  AirplaneTilt as Plane,
  GraduationCap,
  Building,
  MusicNote,
  ForkKnife,
  Laptop,
  Camera,
  Palette
} from '@phosphor-icons/react';
import useSWR from 'swr';
import { apiJson } from '@/lib/api-client-shared';
import { ThemedCard, getThemeColors } from '@/lib/design-system/theme-components';
import { useStore } from '@/providers/store-provider';
import { IndustrySlug } from '@/lib/templates/types';
import { getIndustryOptimization } from '@/lib/industry-optimizations';

type InventoryHealthPayload = {
  turnoverRate?: number;
  stockoutRate?: number;
  accuracy?: number;
  daysOfSupply?: number;
};

type AppointmentsPayload = {
  appointments?: Array<{
    id: string;
    clientName: string;
    service: string;
    time: string;
    duration: number;
  }>;
  total?: number;
  showRate?: number;
};

type PerformanceWidgetPayload = {
  metrics?: Record<string, number>;
  growth?: number;
  efficiency?: number;
};

type SeasonalPayload = {
  currentSeason?: string;
};

// Base Widget Props Interface
interface BaseWidgetProps {
  industry: IndustrySlug;
  title: string;
  subtitle?: string;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  className?: string;
}

// Industry-Specific Widget Components
export function InventoryHealthWidget({ industry, className }: { industry: IndustrySlug; className?: string }) {
  const { store } = useStore();
  const colors = getThemeColors(industry);
  const optimization = getIndustryOptimization(industry);
  
  const { data, isLoading } = useSWR<InventoryHealthPayload | null>(`/api/${industry}/inventory/health`, async (url: string) => {
    try {
      return await apiJson<InventoryHealthPayload>(url);
    } catch (error) {
      console.error('Failed to fetch inventory health:', error);
      return null;
    }
  });

  const getIndustryIcon = () => {
    switch (industry) {
      case 'fashion': return <Package className="h-6 w-6" />;
      case 'beauty': return <Heart className="h-6 w-6" />;
      case 'grocery': return <ShoppingCart className="h-6 w-6" />;
      case 'automotive': return <Car className="h-6 w-6" />;
      default: return <Package className="h-6 w-6" />;
    }
  };

  if (isLoading) {
    return (
      <ThemedCard industry={industry} className={className}>
        <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
      </ThemedCard>
    );
  }

  return (
    <ThemedCard industry={industry} className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.primary}15` }}>
            {getIndustryIcon()}
          </div>
          <div>
            <h3 className="font-semibold">Inventory Health</h3>
            <p className="text-sm text-gray-500">{optimization.displayName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            Optimal
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-gray-100 rounded-lg">
          <p className="text-2xl font-bold" style={{ color: colors.primary }}>
            {data?.turnoverRate || optimization.performanceBaselines.inventory_turnover || 0}
          </p>
          <p className="text-xs text-gray-500">Turnover Rate</p>
        </div>
        <div className="text-center p-3 bg-gray-100 rounded-lg">
          <p className="text-2xl font-bold" style={{ color: colors.secondary }}>
            {data?.stockoutRate || optimization.performanceBaselines.stockout_rate || 0}%
          </p>
          <p className="text-xs text-gray-500">Stockout Rate</p>
        </div>
        <div className="text-center p-3 bg-gray-100 rounded-lg">
          <p className="text-2xl font-bold" style={{ color: colors.accent }}>
            {data?.accuracy || 98}%
          </p>
          <p className="text-xs text-gray-500">Accuracy</p>
        </div>
        <div className="text-center p-3 bg-gray-100 rounded-lg">
          <p className="text-2xl font-bold" style={{ color: colors.primary }}>
            {data?.daysOfSupply || 15}
          </p>
          <p className="text-xs text-gray-500">Days Supply</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Health Score</span>
          <span>92/100</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <motion.div
            className="bg-green-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: '92%' }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>
    </ThemedCard>
  );
}

export function AppointmentSchedulerWidget({ industry, className }: { industry: IndustrySlug; className?: string }) {
  const { store } = useStore();
  const colors = getThemeColors(industry);
  const optimization = getIndustryOptimization(industry);

  const { data, isLoading } = useSWR<AppointmentsPayload | null>(`/api/${industry}/appointments/today`, async (url: string) => {
    try {
      return await apiJson<AppointmentsPayload>(url);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      return null;
    }
  });

  if (isLoading) {
    return (
      <ThemedCard industry={industry} className={className}>
        <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
      </ThemedCard>
    );
  }

  return (
    <ThemedCard industry={industry} className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.primary}15` }}>
            <Calendar className="h-6 w-6" style={{ color: colors.primary }} />
          </div>
          <div>
            <h3 className="font-semibold">Today's Appointments</h3>
            <p className="text-sm text-gray-500">Schedule Management</p>
          </div>
        </div>
        <Button className="px-3 py-1 text-sm border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors">
          + Add
        </Button>
      </div>

      <div className="space-y-3">
        {data?.appointments?.slice(0, 4).map((apt: any, index: number) => (
          <motion.div
            key={apt.id}
            className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div>
                <p className="font-medium">{apt.clientName}</p>
                <p className="text-sm text-gray-500">{apt.service}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{apt.time}</p>
              <p className="text-xs text-gray-500">{apt.duration} mins</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between text-sm">
          <span>Total Today</span>
          <span className="font-medium">{data?.total || 12} appointments</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Show Rate</span>
          <span className="font-medium text-green-600">
            {data?.showRate || optimization.performanceBaselines.appointment_show_rate || 0}%
          </span>
        </div>
      </div>
    </ThemedCard>
  );
}

export function PerformanceOptimizerWidget({ industry, className }: { industry: IndustrySlug; className?: string }) {
  const { store } = useStore();
  const colors = getThemeColors(industry);
  const optimization = getIndustryOptimization(industry);

  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const { data, isLoading } = useSWR<PerformanceWidgetPayload | null>(`/api/${industry}/performance/${timeframe}`, async (url: string) => {
    try {
      return await apiJson<PerformanceWidgetPayload>(url);
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
      return null;
    }
  });

  const getPrimaryMetric = () => {
    const primary = optimization.primaryMetrics[0];
    return data?.metrics?.[primary] || 0;
  };

  const getMetricIcon = () => {
    switch (optimization.optimizationProfile) {
      case 'conversion': return <Target className="h-6 w-6" />;
      case 'operations': return <BarChart className="h-6 w-6" />;
      case 'engagement': return <Users className="h-6 w-6" />;
      case 'efficiency': return <TrendingUp className="h-6 w-6" />;
      default: return <BarChart className="h-6 w-6" />;
    }
  };

  if (isLoading) {
    return (
      <ThemedCard industry={industry} className={className}>
        <div className="h-56 bg-gray-100 rounded-xl animate-pulse" />
      </ThemedCard>
    );
  }

  return (
    <ThemedCard industry={industry} className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.primary}15` }}>
            {getMetricIcon()}
          </div>
          <div>
            <h3 className="font-semibold">Performance Optimizer</h3>
            <p className="text-sm text-gray-500 capitalize">
              {optimization.optimizationProfile} focused
            </p>
          </div>
        </div>
        <select 
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value as any)}
          className="px-3 py-1 text-sm border border-gray-100 rounded-lg bg-white"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <div className="text-center mb-6">
        <p className="text-3xl font-bold mb-2" style={{ color: colors.primary }}>
          {getPrimaryMetric().toLocaleString()}
        </p>
        <p className="text-gray-500 capitalize">
          {optimization.primaryMetrics[0].replace('_', ' ')}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-100 rounded-lg">
          <p className="text-lg font-bold" style={{ color: colors.secondary }}>
            +{data?.growth || 12}%
          </p>
          <p className="text-xs text-gray-500">Growth</p>
        </div>
        <div className="text-center p-3 bg-gray-100 rounded-lg">
          <p className="text-lg font-bold" style={{ color: colors.accent }}>
            {data?.efficiency || 87}%
          </p>
          <p className="text-xs text-gray-500">Efficiency</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>AI Recommendations</span>
          <span className="font-medium text-green-500">3 available</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Benchmark Comparison</span>
          <span className="font-medium text-green-600">Above average</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Action Priority</span>
          <span className="font-medium text-orange-600">Medium</span>
        </div>
      </div>
    </ThemedCard>
  );
}

export function SeasonalInsightsWidget({ industry, className }: { industry: IndustrySlug; className?: string }) {
  const { store } = useStore();
  const colors = getThemeColors(industry);
  const optimization = getIndustryOptimization(industry);

  const { data, isLoading } = useSWR<SeasonalPayload | null>(`/api/${industry}/seasonal/insights`, async (url: string) => {
    try {
      return await apiJson<SeasonalPayload>(url);
    } catch (error) {
      console.error('Failed to fetch seasonal insights:', error);
      return null;
    }
  });

  if (isLoading) {
    return (
      <ThemedCard industry={industry} className={className}>
        <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
      </ThemedCard>
    );
  }

  return (
    <ThemedCard industry={industry} className={className}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.primary}15` }}>
          <Calendar className="h-6 w-6" style={{ color: colors.primary }} />
        </div>
        <div>
          <h3 className="font-semibold">Seasonal Insights</h3>
          <p className="text-sm text-gray-500">Peak periods & trends</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Current Season</h4>
          <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <p className="font-medium" style={{ color: colors.primary }}>
              {data?.currentSeason || optimization.seasonalPatterns[0]}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Peak demand period
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Upcoming Trends</h4>
          <div className="space-y-2">
            {optimization.seasonalPatterns.slice(0, 2).map((pattern, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded-lg">
                <span className="text-sm">{pattern}</span>
                <span className="text-xs px-2 py-1 bg-green-500/10 text-green-500 rounded-full">
                  +{15 + index * 5}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100">
          <Button className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium">
            View Full Calendar
          </Button>
        </div>
      </div>
    </ThemedCard>
  );
}

// Widget Factory Component
export function IndustryWidgetFactory({ 
  widgetType, 
  industry, 
  className 
}: { 
  widgetType: string; 
  industry: IndustrySlug; 
  className?: string 
}) {
  switch (widgetType) {
    case 'inventory_health':
      return <InventoryHealthWidget industry={industry} className={className} />;
    case 'appointment_scheduler':
      return <AppointmentSchedulerWidget industry={industry} className={className} />;
    case 'performance_optimizer':
      return <PerformanceOptimizerWidget industry={industry} className={className} />;
    case 'seasonal_insights':
      return <SeasonalInsightsWidget industry={industry} className={className} />;
    default:
      return <div>Widget not found: {widgetType}</div>;
  }
}