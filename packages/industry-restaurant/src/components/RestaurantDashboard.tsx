'use client';

import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { 
  RestaurantDashboardService,
  KDSService,
  TableManagementService,
  ReservationService
} from '../services';
import { Button, Card } from '@vayva/ui';
import {
  Utensils,
  Users,
  Clock,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { DashboardErrorBoundary } from '@/components/error-boundary/error-boundary-utils';

// Restaurant-specific components
import { LiveOrderFeed } from './foh/LiveOrderFeed';
import { TableFloorPlan } from './foh/TableFloorPlan';
import { EightySixBoard } from './foh/EightySixBoard';
import { ReservationsTimeline } from './foh/ReservationsTimeline';
import { StaffActivityPanel } from './foh/StaffActivityPanel';
import { MenuPerformance } from './foh/MenuPerformance';

// KDS components
import { KDSTicketGrid } from './kds/KDSTicketGrid';
import { PrepList } from './kds/PrepList';

interface RestaurantDashboardProps {
  viewMode?: 'foh' | 'kds';
  storeId: string;
  onConfigChange?: (config: any) => void;
}

export function RestaurantDashboard({
  viewMode = 'foh',
  storeId,
  onConfigChange
}: RestaurantDashboardProps) {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeView, setActiveView] = useState<'foh' | 'kds'>(viewMode);

  // Memoize service instances to prevent recreation on re-renders
  const services = useMemo(
    () => ({
      dashboardService: new RestaurantDashboardService(),
      kdsService: new KDSService(),
      tableService: new TableManagementService(),
      reservationService: new ReservationService(),
    }),
    []
  );

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await services.dashboardService.getLiveMetrics();
      setDashboardData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [services.dashboardService]);

  useEffect(() => {
    fetchDashboardData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Memoized event handlers
  const handleRefresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await services.dashboardService.getLiveMetrics();
      setDashboardData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setLoading(false);
    }
  }, [services.dashboardService]);

  const handleViewChange = useCallback((view: 'foh' | 'kds') => {
    setActiveView(view);
  }, []);

  const handleConfigChange = useCallback((config: any) => {
    onConfigChange?.(config);
  }, [onConfigChange]);

  if (loading && !dashboardData) {
    return <RestaurantDashboardSkeleton />;
  }

  if (activeView === 'kds') {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-cyan-400">Kitchen Display System</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => handleViewChange('foh')}
              className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
            >
              Switch to FOH
            </Button>
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={loading}
              className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DashboardErrorBoundary serviceName="KDSTicketGrid">
              <KDSTicketGrid kdsService={services.kdsService} />
            </DashboardErrorBoundary>
          </div>
          <div>
            <DashboardErrorBoundary serviceName="PrepList">
              <PrepList kdsService={services.kdsService} />
            </DashboardErrorBoundary>
          </div>
        </div>
      </div>
    );
  }

  // FOH Dashboard View
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-orange-800">Restaurant Operations</h1>
            <p className="text-orange-600 mt-1">
              {lastUpdated && (
                <span>
                  Last updated {lastUpdated.toLocaleTimeString()} •{' '}
                </span>
              )}
              Front of House Dashboard
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => handleViewChange('kds')}
              className="border-orange-500 text-orange-700 hover:bg-orange-100"
            >
              Switch to KDS
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={loading}
              className="border-orange-500 text-orange-700 hover:bg-orange-100"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {dashboardData && (
        <DashboardErrorBoundary serviceName="ServiceOverviewKPIs">
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <div>
                <h2 className="text-lg font-semibold text-orange-900">Service Overview</h2>
                <p className="text-sm text-orange-600">Today&apos;s performance metrics</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
              <MemoizedMetricTile
                title="Revenue"
                value={formatCurrency(dashboardData.revenue?.current || 0)}
                change={dashboardData.revenue?.change ?? 0}
                icon={<Utensils className="h-5 w-5" />}
              />
              <MemoizedMetricTile
                title="Orders"
                value={(dashboardData.orders?.current || 0).toLocaleString()}
                change={dashboardData.orders?.change ?? 0}
                icon={<Users className="h-5 w-5" />}
              />
              <MemoizedMetricTile
                title="Guests"
                value={(dashboardData.guests?.current || 0).toLocaleString()}
                change={dashboardData.guests?.change ?? 0}
                icon={<Users className="h-5 w-5" />}
              />
              <MemoizedMetricTile
                title="Table Turn"
                value={`${dashboardData.tableTurnRate?.current || 0}x`}
                change={dashboardData.tableTurnRate?.change ?? 0}
                icon={<Clock className="h-5 w-5" />}
              />
              <MemoizedMetricTile
                title="Avg Ticket"
                value={formatCurrency(dashboardData.avgTicket?.current || 0)}
                change={dashboardData.avgTicket?.change ?? 0}
                icon={<TrendingUp className="h-5 w-5" />}
              />
            </div>
          </section>
        </DashboardErrorBoundary>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Live Operations */}
        <div className="lg:col-span-2 space-y-6">
          <DashboardErrorBoundary serviceName="LiveOrderFeed">
            <LiveOrderFeed dashboardService={services.dashboardService} />
          </DashboardErrorBoundary>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DashboardErrorBoundary serviceName="TableFloorPlan">
              <TableFloorPlan tableService={services.tableService} />
            </DashboardErrorBoundary>
            <DashboardErrorBoundary serviceName="MenuPerformance">
              <MenuPerformance dashboardService={services.dashboardService} />
            </DashboardErrorBoundary>
          </div>
          
          <DashboardErrorBoundary serviceName="ReservationsTimeline">
            <ReservationsTimeline reservationService={services.reservationService} />
          </DashboardErrorBoundary>
        </div>

        {/* Right Column - Management */}
        <div className="space-y-6">
          <DashboardErrorBoundary serviceName="EightySixBoard">
            <EightySixBoard dashboardService={services.dashboardService} />
          </DashboardErrorBoundary>
          <DashboardErrorBoundary serviceName="StaffActivityPanel">
            <StaffActivityPanel dashboardService={services.dashboardService} />
          </DashboardErrorBoundary>
          
          {dashboardData?.alerts && dashboardData.alerts.length > 0 && (
            <DashboardErrorBoundary serviceName="AlertsPanel">
              <div className="bg-white rounded-2xl border border-orange-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <h3 className="font-semibold text-orange-800">Alerts</h3>
                </div>
                <div className="space-y-3">
                  {dashboardData.alerts.slice(0, 3).map((alert: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-orange-800">{alert.title}</p>
                        <p className="text-xs text-orange-600">{alert.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </DashboardErrorBoundary>
          )}
        </div>
      </div>
    </div>
  );
}

// Skeleton Loader
function RestaurantDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-orange-200 rounded animate-pulse"></div>
            <div className="h-4 w-48 bg-orange-100 rounded animate-pulse"></div>
          </div>
          <div className="h-9 w-24 bg-orange-200 rounded animate-pulse"></div>
        </div>
      </div>

      {/* KPI Skeleton */}
      <section className="mb-8">
        <div className="h-6 w-48 bg-orange-200 rounded mb-4 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-orange-200 p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="h-4 w-20 bg-orange-100 rounded animate-pulse"></div>
                <div className="h-8 w-8 bg-orange-100 rounded-lg animate-pulse"></div>
              </div>
              <div className="h-8 w-24 bg-orange-100 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-orange-200 p-6">
            <div className="h-6 w-32 bg-orange-200 rounded mb-4 animate-pulse"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-orange-50 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-orange-200 p-6">
            <div className="h-6 w-24 bg-orange-200 rounded mb-4 animate-pulse"></div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-orange-50 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Functions - Memoized for performance
const RestaurantMetricTile = memo(function RestaurantMetricTile({
  title,
  value,
  change,
  icon,
}: {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
}): React.JSX.Element {
  const isPositive = useMemo(() => change >= 0, [change]);
  
  return (
    <Card className="border border-orange-200 bg-white p-4">
      <div className="flex justify-between items-start gap-2">
        <div>
          <p className="text-sm text-orange-600">{title}</p>
          <p className="text-2xl font-bold text-orange-900 mt-1">{value}</p>
          {change !== 0 && (
            <p className={`text-xs mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}
              {typeof change === 'number' && change % 1 !== 0 ? change.toFixed(1) : change}% vs prior
            </p>
          )}
        </div>
        <div className="text-orange-500 shrink-0">{icon}</div>
      </div>
    </Card>
  );
});

// Create a named export for the memoized version
const MemoizedMetricTile = RestaurantMetricTile;

// Pure function - no need to memoize
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
