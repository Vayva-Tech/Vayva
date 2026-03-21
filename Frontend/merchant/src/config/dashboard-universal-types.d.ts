import type { IndustrySlug } from "@/lib/templates/types";
import type { DesignCategory } from "@/components/vayva-ui/VayvaThemeProvider";
export type DashboardVariant = 'basic' | 'standard' | 'advanced' | 'pro';
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
    data?: unknown;
}
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
export interface IndustryDashboardData {
    metrics: Record<string, {
        value: number | string;
        change?: number;
        trend?: 'up' | 'down' | 'neutral';
        target?: number;
    }>;
    liveOperations: Record<string, unknown>;
    alerts: DashboardAlert[];
    suggestedActions: SuggestedAction[];
    charts: Record<string, unknown[]>;
    primaryObjectHealth: Record<string, unknown>;
}
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
    details?: unknown;
    retryable: boolean;
}
export interface UniversalDashboardProps {
    industry: IndustrySlug;
    variant: DashboardVariant;
    userId: string;
    businessId: string;
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
    data: unknown[];
    config: unknown;
    loading?: boolean;
    className?: string;
}
export interface TaskListProps {
    tasks: SuggestedAction[];
    loading?: boolean;
    className?: string;
    onTaskAction?: (taskId: string, action: unknown) => void;
    onTaskDismiss?: (taskId: string) => void;
}
export interface AlertListProps {
    alerts: DashboardAlert[];
    loading?: boolean;
    className?: string;
    onAlertAction?: (alertId: string, action: unknown) => void;
    onAlertDismiss?: (alertId: string) => void;
}
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
    props: unknown;
    span: ResponsiveGridConfig;
    order: number;
    visible: boolean;
}
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
export declare const DASHBOARD_VARIANTS: DashboardVariant[];
export declare const PLAN_TIER_FEATURES: Record<DashboardVariant, PlanTierConfig>;
