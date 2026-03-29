/**
 * Dashboard Configuration and Constants
 */

import type { PlanTier } from '@/features/subscription/types';

/**
 * Dashboard plan feature matrix
 */
export const DASHBOARD_FEATURE_MATRIX = {
  starter: {
    kpis: ['revenue', 'orders'] as const,
    analytics: false,
    aiInsights: false,
    realtimeUpdates: false,
    exportData: false,
    customReports: false,
  },
  pro: {
    kpis: ['revenue', 'orders', 'customers', 'conversion'] as const,
    analytics: true,
    aiInsights: true,
    realtimeUpdates: true,
    exportData: true,
    customReports: false,
  },
  pro_plus: {
    kpis: 'all' as const,
    analytics: true,
    aiInsights: true,
    realtimeUpdates: true,
    exportData: true,
    customReports: true,
  },
} as const;

/**
 * Available KPI types
 */
export const KPI_TYPES = {
  revenue: {
    label: 'Revenue',
    icon: 'DollarSign',
    format: 'currency',
  },
  orders: {
    label: 'Orders',
    icon: 'ShoppingCart',
    format: 'number',
  },
  customers: {
    label: 'Customers',
    icon: 'Users',
    format: 'number',
  },
  conversion: {
    label: 'Conversion Rate',
    icon: 'Target',
    format: 'percentage',
  },
  aov: {
    label: 'Average Order Value',
    icon: 'TrendingUp',
    format: 'currency',
  },
  retention: {
    label: 'Retention Rate',
    icon: 'Repeat',
    format: 'percentage',
  },
} as const;

/**
 * Dashboard refresh intervals (in milliseconds)
 */
export const REFRESH_INTERVALS = {
  kpis: 2 * 60 * 1000, // 2 minutes
  alerts: 1 * 60 * 1000, // 1 minute
  trends: 5 * 60 * 1000, // 5 minutes
  aggregate: 5 * 60 * 1000, // 5 minutes
  realtime: 30 * 1000, // 30 seconds (Pro+ only)
} as const;

/**
 * Date range presets
 */
export const DATE_RANGE_PRESETS = [
  { label: 'Today', value: 'today' as const },
  { label: 'Last 7 days', value: 'week' as const },
  { label: 'Last 30 days', value: 'month' as const },
  { label: 'Last 90 days', value: '90d' as const },
] as const;

/**
 * Chart types available
 */
export const CHART_TYPES = {
  line: {
    label: 'Line Chart',
    icon: 'TrendingUp',
  },
  bar: {
    label: 'Bar Chart',
    icon: 'BarChart3',
  },
  area: {
    label: 'Area Chart',
    icon: 'ChartArea',
  },
} as const;

/**
 * Dashboard widget layout presets
 */
export const LAYOUT_PRESETS = {
  compact: {
    columns: 4,
    gap: 'md' as const,
  },
  comfortable: {
    columns: 3,
    gap: 'lg' as const,
  },
  spacious: {
    columns: 2,
    gap: 'lg' as const,
  },
} as const;

/**
 * Get available features for a plan tier
 */
export function getDashboardFeatures(planTier: PlanTier) {
  return DASHBOARD_FEATURE_MATRIX[planTier];
}

/**
 * Check if a feature is available for a plan tier
 */
export function isFeatureAvailable(
  planTier: PlanTier,
  feature: keyof typeof DASHBOARD_FEATURE_MATRIX['starter']
) {
  const features = DASHBOARD_FEATURE_MATRIX[planTier];
  return features[feature] !== false;
}

/**
 * Get available KPIs for a plan tier
 */
export function getAvailableKpis(planTier: PlanTier): string[] {
  const features = DASHBOARD_FEATURE_MATRIX[planTier];
  
  if (features.kpis === 'all') {
    return Object.keys(KPI_TYPES);
  }
  
  return Array.from(features.kpis);
}
