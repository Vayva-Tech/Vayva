'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { UniversalMetricCard, UniversalSectionHeader, UniversalTaskItem, UniversalChartContainer, PrimaryObjectHealth, LiveOperations, AlertsList, SuggestedActionsList } from './universal';
import { AIPoweredInsights, PredictiveAnalytics, RealTimeMonitoring } from './advanced';
// Import KDS components for food industry
import { KitchenStatus, ActiveTicketsByStation, StationWorkload, EightySixBoard } from '@/components/dashboard/kitchen';
import { useRealTimeDashboard, useDashboardMetrics, useDashboardAlerts, useDashboardActions } from '@/hooks/useRealTimeDashboard';
import { SettingsButton } from './SettingsButton';
import { formatCurrency, formatDate } from '@/lib/utils';
import { AlertCircle, RefreshCw, TrendingUp, BarChart3, ChefHat } from 'lucide-react';
import { logger } from "@vayva/shared";
import { ActiveCoursesSection, StudentProgressPanel, AssignmentGradingQueue, InstructorPerformanceCard, CertificatesList, EngagementMetricsPanel, AtRiskAlert } from './education';
// Import Nonprofit components
// TODO: Fix workspace dependencies
// import { NonprofitDashboard } from '@vayva/industry-nonprofit';
// Import Tier 2 Industry Components
// TODO: Fix workspace dependencies
// import { CountdownTimerWidget, TicketSalesTrackerWidget, CheckInBoardWidget } from '@vayva/industry-events';
// import { VehicleGalleryWidget, TestDriveSchedulerWidget } from '@vayva/industry-automotive';
// import { OccupancyHeatmapWidget, GuestTimelineWidget } from '@vayva/industry-travel';
/**
 * UniversalProDashboard - Main dashboard component that serves all 22 industries
 * with adaptive layout based on industry, design category, and plan tier
 */
export function UniversalProDashboard({ industry, variant, userId, businessId, designCategory = 'signature', planTier = 'pro', className, _onConfigChange, _onError }) {
    const { data: dashboardData, metrics: realtimeMetrics, alerts: realtimeAlerts, actions: realtimeActions, systemStatus, isLoading: loading, isError: error, wsConnected, refresh, mutate, subscribeToMetrics, subscribeToAlerts } = useRealTimeDashboard({
        industry,
        userId: userId || '',
        businessId: businessId || '',
        enabled: !!userId && !!businessId
    });
    // Subscribe to real-time updates when dashboard loads
    useEffect(() => {
        if (dashboardData) {
            subscribeToMetrics(['revenue', 'orders', 'customers', 'conversion_rate']);
            subscribeToAlerts();
        }
    }, [dashboardData, subscribeToMetrics, subscribeToAlerts]);
    // Extract data using helper hooks
    const metrics = useDashboardMetrics(dashboardData, [
        'revenue', 'orders', 'customers', 'conversion_rate'
    ]);
    const alerts = useDashboardAlerts(dashboardData, ['critical', 'warning']);
    const actions = useDashboardActions(dashboardData, ['inventory', 'sales', 'operations']);
    // Calculate last updated time
    const lastUpdated = dashboardData?.lastUpdated ? new Date(dashboardData.lastUpdated) : null;
    const isValidating = loading;
    // Handle loading state
    if (loading && !dashboardData) {
        return _jsx(DashboardSkeleton, {});
    }
    // Handle error state
    if (error) {
        return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Alert, { variant: "destructive", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium", children: "Failed to load dashboard" }), _jsx("p", { className: "text-sm opacity-90", children: error.message })] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: refresh, disabled: isValidating, children: [_jsx(RefreshCw, { className: `h-4 w-4 mr-2 ${isValidating ? 'animate-spin' : ''}` }), "Retry"] })] }) })] }), dashboardData && (_jsx("div", { className: "opacity-70", children: _jsx(DashboardContent, { dashboardData: dashboardData, config: config, metrics: metrics, alerts: alerts, actions: actions, lastUpdated: lastUpdated, refresh: refresh, isValidating: isValidating, variant: variant }) }))] }));
    }
    // Handle no data state
    if (!dashboardData) {
        return (_jsxs("div", { className: "flex flex-col items-center justify-center py-12 text-center", children: [_jsx("div", { className: "text-5xl mb-4", children: "\uD83D\uDCCA" }), _jsx("h3", { className: "text-lg font-semibold mb-2", children: "No dashboard data available" }), _jsx("p", { className: "text-text-secondary mb-4", children: "Your dashboard data is being prepared. This usually takes a few moments." }), _jsxs(Button, { onClick: refresh, disabled: isValidating, children: [_jsx(RefreshCw, { className: `h-4 w-4 mr-2 ${isValidating ? 'animate-spin' : ''}` }), "Refresh Data"] })] }));
    }
    return (_jsx(DashboardContent, { dashboardData: dashboardData, config: config, metrics: metrics, alerts: alerts, actions: actions, lastUpdated: lastUpdated, refresh: refresh, isValidating: isValidating, variant: variant, designCategory: designCategory, planTier: planTier, industry: industry, className: className }));
}
function DashboardContent({ dashboardData, config, metrics, alerts, actions, lastUpdated, refresh, isValidating, variant, designCategory, planTier, industry, className }) {
    return (_jsxs("div", { className: `space-y-6 ${className || ''}`, children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-text-primary", children: config?.industry ? formatIndustryTitle(config.industry) : 'Dashboard' }), _jsxs("p", { className: "text-text-secondary mt-1", children: [lastUpdated && (_jsxs("span", { children: ["Last updated ", formatDate(lastUpdated), " \u2022", ' '] })), _jsxs("span", { className: "capitalize", children: [variant, " plan"] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(SettingsButton, {}), _jsxs(Button, { variant: "outline", size: "sm", onClick: refresh, disabled: isValidating, children: [_jsx(RefreshCw, { className: `h-4 w-4 mr-2 ${isValidating ? 'animate-spin' : ''}` }), "Refresh"] })] })] }), metrics.length > 0 && (_jsxs("section", { children: [_jsx(UniversalSectionHeader, { title: "Key Performance Indicators", subtitle: "Track your most important metrics", icon: _jsx(TrendingUp, { className: "h-5 w-5" }) }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4", children: metrics.map((metric, index) => (_jsx(UniversalMetricCard, { title: formatMetricLabel(metric.key), value: formatMetricValue(metric), change: metric.change ? {
                                value: Math.abs(metric.change),
                                isPositive: metric.isPositive ?? metric.change >= 0
                            } : undefined, icon: getMetricIcon(metric.key), loading: false, status: getMetricStatus(metric) }, metric.key))) })] })), dashboardData.charts && Object.keys(dashboardData.charts).length > 0 && (_jsxs("section", { children: [_jsx(UniversalSectionHeader, { title: "Performance Trends", subtitle: "Historical data and trends", icon: _jsx(BarChart3, { className: "h-5 w-5" }) }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 mt-4", children: Object.entries(dashboardData.charts).slice(0, 2).map(([chartId, chartData]) => (_jsx(UniversalChartContainer, { title: formatChartTitle(chartId), height: 300, loading: false, children: _jsxs("div", { className: "flex items-center justify-center h-full text-text-secondary", children: ["Chart visualization for ", chartId] }) }, chartId))) })] })), alerts.length > 0 && (_jsxs("section", { children: [_jsx(UniversalSectionHeader, { title: "Alerts & Notifications", subtitle: `${alerts.length} pending action items`, icon: _jsx(AlertCircle, { className: "h-5 w-5" }) }), _jsx("div", { className: "mt-4 space-y-3", children: alerts.slice(0, 5).map((alert) => (_jsx(Alert, { variant: alert.severity === 'critical' ? 'destructive' : 'default', className: "p-4", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium", children: alert.title }), _jsx("p", { className: "text-sm text-text-secondary mt-1", children: alert.message })] }), alert.action && (_jsx(Button, { variant: "outline", size: "sm", children: alert.action.label }))] }) }, alert.id))) })] })), actions.length > 0 && (_jsxs("section", { children: [_jsx(UniversalSectionHeader, { title: "Suggested Actions", subtitle: "Opportunities to improve your business", icon: _jsx(TrendingUp, { className: "h-5 w-5" }) }), _jsx("div", { className: "mt-4 space-y-2", children: actions.slice(0, 5).map((action) => (_jsx(UniversalTaskItem, { id: action.id, title: action.title, subtitle: action.description, priority: action.priority, category: action.category, icon: getActionIcon(action.category), onToggle: (id, completed) => {
                                // Handle task completion
                                logger.info('Task toggled:', id, completed);
                            } }, action.id))) })] })), _jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8", children: industry === 'events' ? (_jsxs(_Fragment, { children: [_jsx(CountdownTimerWidget, { widget: { id: 'event-countdown', type: 'custom', title: 'Event Countdown', industry: 'events', dataSource: { type: 'event' } }, targetDate: dashboardData.event?.startDate || new Date(), eventName: dashboardData.event?.title, size: "large" }), _jsx(TicketSalesTrackerWidget, { widget: { id: 'ticket-sales', type: 'kpi-card', title: 'Ticket Sales', industry: 'events', dataSource: { type: 'analytics' } }, eventId: dashboardData.event?.id || '', totalCapacity: dashboardData.event?.capacity || 0, ticketsSold: dashboardData.event?.ticketsSold || 0, tiers: dashboardData.tiers || [] })] })) : industry === 'automotive' ? (_jsxs(_Fragment, { children: [_jsx(VehicleGalleryWidget, { widget: { id: 'vehicle-gallery', type: 'custom', title: 'Vehicle Inventory', industry: 'automotive', dataSource: { type: 'entity' } }, vehicles: dashboardData.vehicles || [], viewMode: "grid", showFilters: true }), _jsx(TestDriveSchedulerWidget, { widget: { id: 'test-drive-schedule', type: 'calendar', title: 'Test Drives', industry: 'automotive', dataSource: { type: 'calendar' } }, vehicles: dashboardData.vehicles || [], testDrives: dashboardData.testDrives || [] })] })) : industry === 'travel_hospitality' ? (_jsxs(_Fragment, { children: [_jsx(OccupancyHeatmapWidget, { widget: { id: 'occupancy-heatmap', type: 'heatmap', title: 'Occupancy Rate', industry: 'travel_hospitality', dataSource: { type: 'analytics' } }, occupancyData: dashboardData.occupancyHistory || [], viewMode: "month" }), _jsx(GuestTimelineWidget, { widget: { id: 'guest-timeline', type: 'timeline', title: 'Guest Stays', industry: 'travel_hospitality', dataSource: { type: 'timeline' } }, stays: dashboardData.guestStays || [], viewMode: "week" })] })) : industry === 'nonprofit' ? (_jsx(NonprofitDashboard, { industry: industry, variant: variant, userId: userId, businessId: businessId, designCategory: designCategory, planTier: planTier, className: "col-span-full" })) : industry === 'education' ? (_jsxs(_Fragment, { children: [_jsx(ActiveCoursesSection, { courses: dashboardData.courses || [], designCategory: designCategory }), _jsx(StudentProgressPanel, { students: dashboardData.students || [], designCategory: designCategory })] })) : industry === 'food' && planTier !== 'basic' ? (_jsxs(_Fragment, { children: [_jsx(KitchenStatus, { designCategory: designCategory, industry: industry, planTier: planTier }), _jsx(ActiveTicketsByStation, { designCategory: designCategory, industry: industry, planTier: planTier })] })) : (_jsxs(_Fragment, { children: [_jsx(PrimaryObjectHealth, { designCategory: designCategory, industry: industry, planTier: planTier }), _jsx(LiveOperations, { designCategory: designCategory, industry: industry, planTier: planTier })] })) }), industry === 'food' && planTier !== 'basic' && (_jsx(_Fragment, { children: _jsxs("section", { children: [_jsx(UniversalSectionHeader, { title: "Kitchen Operations", subtitle: "Real-time station management", icon: _jsx(ChefHat, { className: "h-5 w-5" }) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4", children: [_jsx(StationWorkload, { designCategory: designCategory, industry: industry, planTier: planTier }), _jsx(EightySixBoard, { designCategory: designCategory, industry: industry, planTier: planTier })] })] }) })), industry === 'education' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8", children: [_jsx(AssignmentGradingQueue, { assignments: dashboardData.assignments || [], pendingSubmissions: dashboardData.pendingSubmissions || [], designCategory: designCategory }), _jsx(InstructorPerformanceCard, { instructors: dashboardData.instructors || [], designCategory: designCategory })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8", children: [_jsx(CertificatesList, { certificates: dashboardData.certificates || [], designCategory: designCategory }), _jsx(EngagementMetricsPanel, { metrics: dashboardData.engagementMetrics || {}, designCategory: designCategory })] }), _jsx("div", { className: "mb-8", children: _jsx(AtRiskAlert, { students: dashboardData.atRiskStudents || [], designCategory: designCategory }) })] })), _jsx("div", { className: "mb-8", children: _jsx(AlertsList, { designCategory: designCategory, industry: industry, planTier: planTier }) }), _jsx("div", { children: _jsx(SuggestedActionsList, { designCategory: designCategory, industry: industry, planTier: planTier }) }), planTier !== 'basic' && (_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8", children: [_jsx(AIPoweredInsights, { industry: industry, designCategory: designCategory, planTier: planTier }), _jsx(PredictiveAnalytics, { industry: industry, designCategory: designCategory, planTier: planTier })] })), planTier === 'pro' && (_jsx("div", { className: "mb-8", children: _jsx(RealTimeMonitoring, { industry: industry, designCategory: designCategory, planTier: planTier }) }))] }));
}
// ---------------------------------------------------------------------------
// Loading Skeleton
// ---------------------------------------------------------------------------
function DashboardSkeleton() {
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Skeleton, { className: "h-8 w-64" }), _jsx(Skeleton, { className: "h-4 w-48" })] }), _jsx(Skeleton, { className: "h-9 w-24" })] }), _jsxs("section", { children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx(Skeleton, { className: "h-8 w-8 rounded-lg" }), _jsxs("div", { className: "space-y-1", children: [_jsx(Skeleton, { className: "h-5 w-48" }), _jsx(Skeleton, { className: "h-4 w-64" })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [...Array(4)].map((_, i) => (_jsxs("div", { className: "bg-card rounded-[28px] border p-6 space-y-4", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsx(Skeleton, { className: "h-4 w-20" }), _jsx(Skeleton, { className: "h-8 w-8 rounded-lg" })] }), _jsx(Skeleton, { className: "h-8 w-24" })] }, i))) })] }), _jsxs("section", { children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx(Skeleton, { className: "h-8 w-8 rounded-lg" }), _jsxs("div", { className: "space-y-1", children: [_jsx(Skeleton, { className: "h-5 w-40" }), _jsx(Skeleton, { className: "h-4 w-56" })] })] }), _jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [...Array(2)].map((_, i) => (_jsxs("div", { className: "bg-card rounded-[28px] border p-6", children: [_jsx(Skeleton, { className: "h-6 w-32 mb-4" }), _jsx(Skeleton, { className: "h-64 w-full rounded-2xl" })] }, i))) })] })] }));
}
// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------
function formatIndustryTitle(industry) {
    const titles = {
        retail: 'Retail Dashboard',
        fashion: 'Fashion Operations',
        food: 'Kitchen Control',
        services: 'Service Management',
        b2b: 'B2B Operations',
        events: 'Event Management',
        automotive: 'Auto Sales',
        travel_hospitality: 'Hospitality Dashboard',
        digital: 'Digital Products',
        nonprofit: 'Nonprofit Impact',
        education: 'Education Hub'
    };
    return titles[industry] || `${industry.charAt(0).toUpperCase() + industry.slice(1)} Dashboard`;
}
function formatMetricLabel(key) {
    const labels = {
        revenue: 'Total Revenue',
        orders: 'Total Orders',
        customers: 'Active Customers',
        conversion_rate: 'Conversion Rate',
        avg_order_value: 'Avg Order Value'
    };
    return labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
function formatMetricValue(metric) {
    if (metric.format === 'currency') {
        return formatCurrency(Number(metric.value) || 0);
    }
    if (metric.format === 'percentage') {
        return `${Number(metric.value || 0).toFixed(1)}%`;
    }
    if (typeof metric.value === 'number') {
        return metric.value.toLocaleString();
    }
    return String(metric.value || 0);
}
function getMetricIcon(key) {
    const icons = {
        revenue: _jsx(TrendingUp, { className: "h-4 w-4" }),
        orders: _jsx(BarChart3, { className: "h-4 w-4" }),
        customers: _jsx(BarChart3, { className: "h-4 w-4" }),
        conversion_rate: _jsx(BarChart3, { className: "h-4 w-4" })
    };
    return icons[key] || _jsx(BarChart3, { className: "h-4 w-4" });
}
function getMetricStatus(metric) {
    if (!metric.change)
        return 'default';
    const isPositive = metric.isPositive ?? metric.change >= 0;
    const absChange = Math.abs(metric.change);
    if (absChange > 20)
        return isPositive ? 'success' : 'error';
    if (absChange > 5)
        return isPositive ? 'success' : 'warning';
    return 'default';
}
function formatChartTitle(chartId) {
    const titles = {
        revenue_trend: 'Revenue Trend',
        order_volume: 'Order Volume',
        customer_growth: 'Customer Growth'
    };
    return titles[chartId] || chartId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
function getActionIcon(category) {
    const icons = {
        inventory: _jsx(BarChart3, { className: "h-4 w-4" }),
        sales: _jsx(TrendingUp, { className: "h-4 w-4" }),
        operations: _jsx(BarChart3, { className: "h-4 w-4" })
    };
    return icons[category] || _jsx(BarChart3, { className: "h-4 w-4" });
}
function formatHealthMetricLabel(key) {
    const labels = {
        top_products: 'Top Products',
        low_stock: 'Low Stock Items',
        pending_orders: 'Pending Orders'
    };
    return labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
function getHealthMetricIcon(key) {
    const icons = {
        top_products: _jsx(BarChart3, { className: "h-4 w-4" }),
        low_stock: _jsx(BarChart3, { className: "h-4 w-4" }),
        pending_orders: _jsx(BarChart3, { className: "h-4 w-4" })
    };
    return icons[key] || _jsx(BarChart3, { className: "h-4 w-4" });
}
