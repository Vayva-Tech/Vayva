// @ts-nocheck
'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
const useUser = () => { const { merchant } = useAuth(); return { user: merchant ? { id: (merchant as any)?.id, fullName: (merchant as any)?.name } : null }; };
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  UniversalMetricCard,
  UniversalSectionHeader,
  UniversalTaskItem,
  UniversalChartContainer,
  PrimaryObjectHealth,
  LiveOperations,
  AlertsList,
  SuggestedActionsList
} from './universal';
import { 
  AIPoweredInsights,
  PredictiveAnalytics,
  RealTimeMonitoring
} from './advanced';
// Import KDS components for food industry
import {
  KitchenStatus,
  ActiveTicketsByStation,
  StationWorkload,
  EightySixBoard
} from '@/components/dashboard/kitchen';
import { useRealTimeDashboard , useDashboardMetrics, useDashboardAlerts, useDashboardActions } from '@/hooks/useRealTimeDashboard';
import { SettingsButton } from './SettingsButton';
import type { UniversalDashboardProps } from '@/config/dashboard-universal-types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { AlertCircle, RefreshCw, TrendingUp, BarChart3, ChefHat, Layers, Lock } from 'lucide-react';
import {
  ActiveCoursesSection,
  StudentProgressPanel,
  AssignmentGradingQueue,
  InstructorPerformanceCard,
  CertificatesList,
  EngagementMetricsPanel,
  AtRiskAlert
} from './education';

// Import Nonprofit components
import { NonprofitDashboard } from '@vayva/industry-nonprofit/dashboard';

// Import Tier 2 Industry Components from their component sub-paths
import { CountdownTimerWidget, TicketSalesTrackerWidget, CheckInBoardWidget } from '@vayva/industry-events/components';
import { VehicleGalleryWidget, TestDriveSchedulerWidget } from '@vayva/industry-automotive/components';
import { OccupancyHeatmapWidget, GuestTimelineWidget } from '@vayva/industry-travel';

/**
 * UniversalProDashboard - Main dashboard component that serves all 22 industries
 * with adaptive layout based on industry, design category, and plan tier
 */
export function UniversalProDashboard({
  industry,
  variant,
  userId,
  businessId,
  designCategory = 'signature',
  planTier = 'pro',
  className,
  onConfigChange,
  onError
}: UniversalDashboardProps) {
  const { user } = useUser();
  const {
    data: dashboardData,
    metrics: realtimeMetrics,
    alerts: realtimeAlerts,
    actions: realtimeActions,
    systemStatus,
    isLoading: loading,
    isError: error,
    wsConnected,
    refresh,
    mutate,
    subscribeToMetrics,
    subscribeToAlerts
  } = useRealTimeDashboard({
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
    return <DashboardSkeleton />;
  }

  // Handle error state
  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Failed to load dashboard</h3>
                <p className="text-sm opacity-90">{error.message}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refresh}
                disabled={isValidating}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isValidating ? 'animate-spin' : ''}`} />
                Retry
              </Button>
            </div>
          </AlertDescription>
        </Alert>
        
        {/* Show cached data if available */}
        {dashboardData && (
          <div className="opacity-70">
            <DashboardContent 
              dashboardData={dashboardData}
              config={config}
              metrics={metrics}
              alerts={alerts}
              actions={actions}
              lastUpdated={lastUpdated}
              refresh={refresh}
              isValidating={isValidating}
              variant={variant}
            />
          </div>
        )}
      </div>
    );
  }

  // Handle no data state
  if (!dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-5xl mb-4">📊</div>
        <h3 className="text-lg font-semibold mb-2">No dashboard data available</h3>
        <p className="text-gray-500 mb-4">
          Your dashboard data is being prepared. This usually takes a few moments.
        </p>
        <Button onClick={refresh} disabled={isValidating}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isValidating ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>
    );
  }

  return (
    <DashboardContent 
      dashboardData={dashboardData}
      config={config}
      metrics={metrics}
      alerts={alerts}
      actions={actions}
      lastUpdated={lastUpdated}
      refresh={refresh}
      isValidating={isValidating}
      variant={variant}
      designCategory={designCategory}
      planTier={planTier}
      industry={industry}
      className={className}
    />
  );
}

// ---------------------------------------------------------------------------
// Dashboard Content Component
// ---------------------------------------------------------------------------

interface DashboardContentProps {
  dashboardData: any;
  config: any;
  metrics: any[];
  alerts: any[];
  actions: any[];
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  isValidating: boolean;
  variant: string;
  designCategory: string;
  planTier: string;
  industry: string;
  className?: string;
}

function DashboardContent({
  dashboardData,
  config,
  metrics,
  alerts,
  actions,
  lastUpdated,
  refresh,
  isValidating,
  variant,
  designCategory,
  planTier,
  industry,
  className
}: DashboardContentProps) {
  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {config?.industry ? formatIndustryTitle(config.industry) : 'Dashboard'}
          </h1>
          <p className="text-gray-500 mt-1">
            {lastUpdated && (
              <span>
                Last updated {formatDate(lastUpdated)} •{' '}
              </span>
            )}
            <span className="capitalize">{variant} plan</span>
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <SettingsButton />
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isValidating}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isValidating ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      {metrics.length > 0 && (
        <section>
          <UniversalSectionHeader
            title="Key Performance Indicators"
            subtitle="Track your most important metrics"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {metrics.map((metric, index) => (
              <UniversalMetricCard
                key={metric.key}
                title={formatMetricLabel(metric.key)}
                value={formatMetricValue(metric)}
                change={metric.change ? {
                  value: Math.abs(metric.change),
                  isPositive: metric.isPositive ?? metric.change >= 0
                } : undefined}
                icon={getMetricIcon(metric.key)}
                loading={false}
                status={getMetricStatus(metric)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Charts Section */}
      {dashboardData.charts && Object.keys(dashboardData.charts).length > 0 && (
        <section>
          <UniversalSectionHeader
            title="Performance Trends"
            subtitle="Historical data and trends"
            icon={<BarChart3 className="h-5 w-5" />}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {Object.entries(dashboardData.charts).slice(0, 2).map(([chartId, chartData]) => (
              <UniversalChartContainer
                key={chartId}
                title={formatChartTitle(chartId)}
                height={300}
                loading={false}
              >
                {/* Chart component would go here */}
                <div className="flex items-center justify-center h-full text-gray-500">
                  Chart visualization for {chartId}
                </div>
              </UniversalChartContainer>
            ))}
          </div>
        </section>
      )}

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <section>
          <UniversalSectionHeader
            title="Alerts & Notifications"
            subtitle={`${alerts.length} pending action items`}
            icon={<AlertCircle className="h-5 w-5" />}
          />
          
          <div className="mt-4 space-y-3">
            {alerts.slice(0, 5).map((alert) => (
              <Alert 
                key={alert.id} 
                variant={alert.severity === 'critical' ? 'destructive' : 'default'}
                className="p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{alert.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{alert.message}</p>
                  </div>
                  {alert.action && (
                    <Button variant="outline" size="sm">
                      {alert.action.label}
                    </Button>
                  )}
                </div>
              </Alert>
            ))}
          </div>
        </section>
      )}

      {/* Actions Section */}
      {actions.length > 0 && (
        <section>
          <UniversalSectionHeader
            title="Suggested Actions"
            subtitle="Opportunities to improve your business"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          
          <div className="mt-4 space-y-2">
            {actions.slice(0, 5).map((action) => (
              <UniversalTaskItem
                key={action.id}
                id={action.id}
                title={action.title}
                subtitle={action.description}
                priority={action.priority}
                category={action.category}
                icon={getActionIcon(action.category)}
                onToggle={(id, completed) => {
                  // Handle task completion
                  console.log('Task toggled:', id, completed);
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Industry Operations - PRO_PLUS merged view */}
      {planTier === 'pro_plus' ? (
        <>
          {/* Industry Operations Section Header */}
          <section>
            <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                <Layers className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-green-900">Industry Operations</h2>
                <p className="text-sm text-green-700">
                  Live operational controls for your {industry?.replace(/_/g, ' ')} business
                </p>
              </div>
            </div>

            {/* Industry-Specific Sections (inline for PRO_PLUS) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {industry === 'events' ? (
                <>
                  <CountdownTimerWidget
                    widget={{ id: 'event-countdown', type: 'custom', title: 'Event Countdown', industry: 'events', dataSource: { type: 'event' } }}
                    targetDate={dashboardData.event?.startDate || new Date()}
                    eventName={dashboardData.event?.title}
                    size="large"
                  />
                  <TicketSalesTrackerWidget
                    widget={{ id: 'ticket-sales', type: 'kpi-card', title: 'Ticket Sales', industry: 'events', dataSource: { type: 'analytics' } }}
                    eventId={dashboardData.event?.id || ''}
                    totalCapacity={dashboardData.event?.capacity || 0}
                    ticketsSold={dashboardData.event?.ticketsSold || 0}
                    tiers={dashboardData.tiers || []}
                  />
                </>
              ) : industry === 'automotive' ? (
                <>
                  <VehicleGalleryWidget
                    widget={{ id: 'vehicle-gallery', type: 'custom', title: 'Vehicle Inventory', industry: 'automotive', dataSource: { type: 'entity' } }}
                    vehicles={dashboardData.vehicles || []}
                    viewMode="grid"
                    showFilters={true}
                  />
                  <TestDriveSchedulerWidget
                    widget={{ id: 'test-drive-schedule', type: 'calendar', title: 'Test Drives', industry: 'automotive', dataSource: { type: 'calendar' } }}
                    vehicles={dashboardData.vehicles || []}
                    testDrives={dashboardData.testDrives || []}
                  />
                </>
              ) : industry === 'travel_hospitality' ? (
                <>
                  <OccupancyHeatmapWidget
                    widget={{ id: 'occupancy-heatmap', type: 'heatmap', title: 'Occupancy Rate', industry: 'travel_hospitality', dataSource: { type: 'analytics' } }}
                    occupancyData={dashboardData.occupancyHistory || []}
                    viewMode="month"
                  />
                  <GuestTimelineWidget
                    widget={{ id: 'guest-timeline', type: 'timeline', title: 'Guest Stays', industry: 'travel_hospitality', dataSource: { type: 'timeline' } }}
                    stays={dashboardData.guestStays || []}
                    viewMode="week"
                  />
                </>
              ) : industry === 'nonprofit' ? (
                <NonprofitDashboard
                  industry={industry}
                  variant={variant}
                  userId={userId}
                  businessId={businessId}
                  designCategory={designCategory}
                  planTier={planTier}
                  className="col-span-full"
                />
              ) : industry === 'education' ? (
                <>
                  <ActiveCoursesSection courses={dashboardData.courses || []} designCategory={designCategory} />
                  <StudentProgressPanel students={dashboardData.students || []} designCategory={designCategory} />
                </>
              ) : industry === 'food' ? (
                <>
                  <KitchenStatus
                    designCategory={designCategory}
                    industry={industry}
                    planTier={planTier}
                  />
                  <ActiveTicketsByStation
                    designCategory={designCategory}
                    industry={industry}
                    planTier={planTier}
                  />
                </>
              ) : (
                <>
                  <PrimaryObjectHealth
                    designCategory={designCategory}
                    industry={industry}
                    planTier={planTier}
                  />
                  <LiveOperations
                    designCategory={designCategory}
                    industry={industry}
                    planTier={planTier}
                  />
                </>
              )}
            </div>
          </section>

          {/* Food/KDS Industry Additional Sections (PRO_PLUS) */}
          {industry === 'food' && (
            <section>
              <UniversalSectionHeader
                title="Kitchen Operations"
                subtitle="Real-time station management"
                icon={<ChefHat className="h-5 w-5" />}
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                <StationWorkload
                  designCategory={designCategory}
                  industry={industry}
                  planTier={planTier}
                />
                <EightySixBoard
                  designCategory={designCategory}
                  industry={industry}
                  planTier={planTier}
                />
              </div>
            </section>
          )}

          {/* Education-Specific Sections (PRO_PLUS) */}
          {industry === 'education' && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <AssignmentGradingQueue
                  assignments={dashboardData.assignments || []}
                  pendingSubmissions={dashboardData.pendingSubmissions || []}
                  designCategory={designCategory}
                />
                <InstructorPerformanceCard
                  instructors={dashboardData.instructors || []}
                  designCategory={designCategory}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <CertificatesList
                  certificates={dashboardData.certificates || []}
                  designCategory={designCategory}
                />
                <EngagementMetricsPanel
                  metrics={dashboardData.engagementMetrics || {}}
                  designCategory={designCategory}
                />
              </div>

              <div className="mb-8">
                <AtRiskAlert
                  students={dashboardData.atRiskStudents || []}
                  designCategory={designCategory}
                />
              </div>
            </>
          )}
        </>
      ) : (
        /* Non-PRO_PLUS: Show locked upgrade prompt instead of industry sections */
        <section>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <div className="flex flex-col items-center text-center py-6">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <Lock className="h-7 w-7 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Industry Operations
              </h3>
              <p className="text-sm text-gray-500 max-w-md mb-5">
                Unlock inline industry-specific dashboards, real-time operational controls,
                and advanced sector analytics by upgrading to PRO+.
              </p>
              <Button
                onClick={() => window.location.href = '/dashboard/billing'}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Layers className="h-4 w-4 mr-2" />
                Upgrade to PRO+
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Alerts Section */}
      <div className="mb-8">
        <AlertsList 
          designCategory={designCategory} 
          industry={industry} 
          planTier={planTier}
        />
      </div>

      {/* Suggested Actions */}
      <div>
        <SuggestedActionsList 
          designCategory={designCategory} 
          industry={industry} 
          planTier={planTier}
        />
      </div>

      {/* Advanced Features Section */}
      {planTier !== 'basic' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <AIPoweredInsights 
            industry={industry}
            designCategory={designCategory}
            planTier={planTier}
          />
          
          <PredictiveAnalytics 
            industry={industry}
            designCategory={designCategory}
            planTier={planTier}
          />
        </div>
      )}

      {/* Real-Time Monitoring */}
      {planTier === 'pro' && (
        <div className="mb-8">
          <RealTimeMonitoring 
            industry={industry}
            designCategory={designCategory}
            planTier={planTier}
          />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading Skeleton
// ---------------------------------------------------------------------------

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>

      {/* Metrics grid skeleton */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border p-6 space-y-4">
              <div className="flex justify-between items-start">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>
      </section>

      {/* Charts skeleton */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

function formatIndustryTitle(industry: string): string {
  const titles: Record<string, string> = {
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

function formatMetricLabel(key: string): string {
  const labels: Record<string, string> = {
    revenue: 'Total Revenue',
    orders: 'Total Orders',
    customers: 'Active Customers',
    conversion_rate: 'Conversion Rate',
    avg_order_value: 'Avg Order Value'
  };
  
  return labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatMetricValue(metric: any): string {
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

function getMetricIcon(key: string): React.ReactNode {
  const icons: Record<string, React.ReactNode> = {
    revenue: <TrendingUp className="h-4 w-4" />,
    orders: <BarChart3 className="h-4 w-4" />,
    customers: <BarChart3 className="h-4 w-4" />,
    conversion_rate: <BarChart3 className="h-4 w-4" />
  };
  
  return icons[key] || <BarChart3 className="h-4 w-4" />;
}

function getMetricStatus(metric: any): 'default' | 'success' | 'warning' | 'error' {
  if (!metric.change) return 'default';
  
  const isPositive = metric.isPositive ?? metric.change >= 0;
  const absChange = Math.abs(metric.change);
  
  if (absChange > 20) return isPositive ? 'success' : 'error';
  if (absChange > 5) return isPositive ? 'success' : 'warning';
  
  return 'default';
}

function formatChartTitle(chartId: string): string {
  const titles: Record<string, string> = {
    revenue_trend: 'Revenue Trend',
    order_volume: 'Order Volume',
    customer_growth: 'Customer Growth'
  };
  
  return titles[chartId] || chartId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function getActionIcon(category: string): React.ReactNode {
  const icons: Record<string, React.ReactNode> = {
    inventory: <BarChart3 className="h-4 w-4" />,
    sales: <TrendingUp className="h-4 w-4" />,
    operations: <BarChart3 className="h-4 w-4" />
  };
  
  return icons[category] || <BarChart3 className="h-4 w-4" />;
}

function formatHealthMetricLabel(key: string): string {
  const labels: Record<string, string> = {
    top_products: 'Top Products',
    low_stock: 'Low Stock Items',
    pending_orders: 'Pending Orders'
  };
  
  return labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function getHealthMetricIcon(key: string): React.ReactNode {
  const icons: Record<string, React.ReactNode> = {
    top_products: <BarChart3 className="h-4 w-4" />,
    low_stock: <BarChart3 className="h-4 w-4" />,
    pending_orders: <BarChart3 className="h-4 w-4" />
  };
  
  return icons[key] || <BarChart3 className="h-4 w-4" />;
}