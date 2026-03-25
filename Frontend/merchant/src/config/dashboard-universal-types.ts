// ============================================================================
// DASHBOARD UNIVERSAL TYPE DEFINITIONS
// ============================================================================
// Shared types for the unified dashboard system
// ============================================================================

import type { IndustrySlug } from "@vayva/industry-core";
import type { DesignCategory } from "@/components/vayva-ui/VayvaThemeProvider";

export type { IndustrySlug };

// ---------------------------------------------------------------------------
// Core Dashboard Types
// ---------------------------------------------------------------------------

export type DashboardVariant = 'basic' | 'standard' | 'advanced' | 'pro' | 'legacy';
export type DashboardTimeHorizon = 'now' | 'today' | 'week' | 'month' | 'quarter' | 'year';

export interface DashboardMetric {
  key: string;
  label: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  isPositive?: boolean;
  format?: 'currency' | 'number' | 'percentage' | 'duration';
  precision?: number;
  icon?: string;
}

export interface DashboardSection {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  visible: boolean;
  order: number;
  componentType: 'metric-grid' | 'chart' | 'task-list' | 'alert-list' | 'custom';
  data?: any;
}

// ---------------------------------------------------------------------------
// Universal Dashboard Configuration
// ---------------------------------------------------------------------------

export interface UniversalDashboardConfig {
  industry: IndustrySlug;
  variant: DashboardVariant;
  designCategory: DesignCategory;
  timeHorizon: DashboardTimeHorizon;
  sections: DashboardSection[];
  metrics: DashboardMetric[];
  featureFlags: {
    alerts: boolean;
    suggestions: boolean;
    charts: boolean;
    kpiComparison: boolean;
    exportData: boolean;
  };
}

// ---------------------------------------------------------------------------
// Industry-Specific Dashboard Data
// ---------------------------------------------------------------------------

export interface IndustryDashboardData {
  // Core metrics (industry-specific KPIs)
  metrics: Record<string, {
    value: number | string;
    change?: number;
    trend?: 'up' | 'down' | 'neutral';
    target?: number;
  }>;
  
  // Live operations data
  liveOperations: Record<string, any>;
  
  // Alerts and notifications
  alerts: DashboardAlert[];
  
  // Suggested actions
  suggestedActions: SuggestedAction[];
  
  // Chart data
  charts: Record<string, any[]>;
  
  // Primary object health
  primaryObjectHealth: Record<string, any>;
}

// ---------------------------------------------------------------------------
// Alert and Action Types
// ---------------------------------------------------------------------------

export type AlertSeverity = 'info' | 'warning' | 'critical';
export type ActionType = 'navigate' | 'api' | 'modal' | 'external';

export interface DashboardAlert {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  timestamp: string;
  resolved: boolean;
  action?: {
    type: ActionType;
    label: string;
    target: string;
  };
}

export interface SuggestedAction {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  condition: string;
  action: {
    type: ActionType;
    label: string;
    target: string;
  };
  dismissible: boolean;
}

// ---------------------------------------------------------------------------
// Plan Tier Configuration
// ---------------------------------------------------------------------------

export interface PlanTierConfig {
  name: DashboardVariant;
  features: {
    maxMetrics: number;
    maxSections: number;
    chartTypes: string[];
    alertTypes: AlertSeverity[];
    exportFormats: string[];
    customSections: boolean;
    advancedAnalytics: boolean;
    aiInsights: boolean;
    customBranding: boolean;
  };
  limits: {
    dataRetentionDays: number;
    apiRequestsPerHour: number;
    teamMembers: number;
  };
}

// ---------------------------------------------------------------------------
// Data Fetching Types
// ---------------------------------------------------------------------------

export interface DashboardDataContext {
  industry: IndustrySlug;
  variant: DashboardVariant;
  userId: string;
  businessId: string;
  timeHorizon: DashboardTimeHorizon;
  currency: string;
}

export interface DashboardDataResponse {
  data: IndustryDashboardData;
  config: UniversalDashboardConfig;
  lastUpdated: string;
  cacheKey: string;
}

export interface DashboardError {
  code: string;
  message: string;
  details?: any;
  retryable: boolean;
}

// ---------------------------------------------------------------------------
// Component Props Interfaces
// ---------------------------------------------------------------------------

export interface UniversalDashboardProps {
  industry: IndustrySlug;
  variant: DashboardVariant;
  userId: string;
  businessId: string;
  designCategory?: DesignCategory;
  planTier?: string;
  className?: string;
  onConfigChange?: (config: Partial<UniversalDashboardConfig>) => void;
  onError?: (error: DashboardError) => void;
}

export interface MetricGridProps {
  metrics: DashboardMetric[];
  variant: DashboardVariant;
  loading?: boolean;
  className?: string;
  onMetricClick?: (metric: DashboardMetric) => void;
}

export interface ChartSectionProps {
  chartId: string;
  title: string;
  type: 'line' | 'bar' | 'area' | 'pie' | 'radar';
  data: any[];
  config: any;
  loading?: boolean;
  className?: string;
}

export interface TaskListProps {
  tasks: SuggestedAction[];
  loading?: boolean;
  className?: string;
  onTaskAction?: (taskId: string, action: any) => void;
  onTaskDismiss?: (taskId: string) => void;
}

export interface AlertListProps {
  alerts: DashboardAlert[];
  loading?: boolean;
  className?: string;
  onAlertAction?: (alertId: string, action: any) => void;
  onAlertDismiss?: (alertId: string) => void;
}

// ---------------------------------------------------------------------------
// Utility Types
// ---------------------------------------------------------------------------

export type ResponsiveBreakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type GridSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface ResponsiveGridConfig {
  sm?: GridSpan;
  md?: GridSpan;
  lg?: GridSpan;
  xl?: GridSpan;
  '2xl'?: GridSpan;
}

export interface DashboardLayoutItem {
  id: string;
  component: React.ComponentType<any>;
  props: any;
  span: ResponsiveGridConfig;
  order: number;
  visible: boolean;
}

// ---------------------------------------------------------------------------
// Theme Integration Types
// ---------------------------------------------------------------------------

export interface DesignCategoryStyles {
  card: {
    background: string;
    border: string;
    shadow: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  accent: {
    primary: string;
    secondary: string;
  };
  interactive: {
    hover: string;
    active: string;
    focus: string;
  };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const DASHBOARD_VARIANTS: DashboardVariant[] = ['basic', 'standard', 'advanced', 'pro'];

export const PLAN_TIER_FEATURES: Record<DashboardVariant, PlanTierConfig> = {
  basic: {
    name: 'basic',
    features: {
      maxMetrics: 4,
      maxSections: 3,
      chartTypes: ['bar'],
      alertTypes: ['info'],
      exportFormats: ['csv'],
      customSections: false,
      advancedAnalytics: false,
      aiInsights: false,
      customBranding: false
    },
    limits: {
      dataRetentionDays: 30,
      apiRequestsPerHour: 100,
      teamMembers: 1
    }
  },
  standard: {
    name: 'standard',
    features: {
      maxMetrics: 8,
      maxSections: 6,
      chartTypes: ['bar', 'line', 'pie'],
      alertTypes: ['info', 'warning'],
      exportFormats: ['csv', 'pdf'],
      customSections: false,
      advancedAnalytics: false,
      aiInsights: false,
      customBranding: false
    },
    limits: {
      dataRetentionDays: 90,
      apiRequestsPerHour: 500,
      teamMembers: 3
    }
  },
  advanced: {
    name: 'advanced',
    features: {
      maxMetrics: 12,
      maxSections: 10,
      chartTypes: ['bar', 'line', 'area', 'pie', 'radar'],
      alertTypes: ['info', 'warning', 'critical'],
      exportFormats: ['csv', 'pdf', 'excel'],
      customSections: true,
      advancedAnalytics: true,
      aiInsights: false,
      customBranding: true
    },
    limits: {
      dataRetentionDays: 365,
      apiRequestsPerHour: 2000,
      teamMembers: 10
    }
  },
  pro: {
    name: 'pro',
    features: {
      maxMetrics: 20,
      maxSections: 15,
      chartTypes: ['bar', 'line', 'area', 'pie', 'radar', 'scatter', 'heatmap'],
      alertTypes: ['info', 'warning', 'critical'],
      exportFormats: ['csv', 'pdf', 'excel', 'json'],
      customSections: true,
      advancedAnalytics: true,
      aiInsights: true,
      customBranding: true
    },
    limits: {
      dataRetentionDays: 730,
      apiRequestsPerHour: 10000,
      teamMembers: 50
    }
  },
  legacy: {
    name: 'legacy',
    features: {
      maxMetrics: 4,
      maxSections: 3,
      chartTypes: ['bar'],
      alertTypes: ['info'],
      exportFormats: ['csv'],
      customSections: false,
      advancedAnalytics: false,
      aiInsights: false,
      customBranding: false
    },
    limits: {
      dataRetentionDays: 30,
      apiRequestsPerHour: 100,
      teamMembers: 1
    }
  }
};