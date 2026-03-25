'use client';

import React, { useState, useEffect } from 'react';
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

  // Initialize services
  const dashboardService = new RestaurantDashboardService();
  const kdsService = new KDSService();
  const tableService = new TableManagementService();
  const reservationService = new ReservationService();

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getLiveMetrics();
        setDashboardData(data);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [storeId]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const data = await dashboardService.getLiveMetrics();
      setDashboardData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setLoading(false);
    }
  };

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
              onClick={() => setActiveView('foh')}
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
            <KDSTicketGrid kdsService={kdsService} />
          </div>
          <div>
            <PrepList kdsService={kdsService} />
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
              onClick={() => setActiveView('kds')}
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
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            <div>
              <h2 className="text-lg font-semibold text-orange-900">Service Overview</h2>
              <p className="text-sm text-orange-600">Today&apos;s performance metrics</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
            <RestaurantMetricTile
              title="Revenue"
              value={formatCurrency(dashboardData.revenue?.current || 0)}
              change={dashboardData.revenue?.change ?? 0}
              icon={<Utensils className="h-5 w-5" />}
            />
            <RestaurantMetricTile
              title="Orders"
              value={(dashboardData.orders?.current || 0).toLocaleString()}
              change={dashboardData.orders?.change ?? 0}
              icon={<Users className="h-5 w-5" />}
            />
            <RestaurantMetricTile
              title="Guests"
              value={(dashboardData.guests?.current || 0).toLocaleString()}
              change={dashboardData.guests?.change ?? 0}
              icon={<Users className="h-5 w-5" />}
            />
            <RestaurantMetricTile
              title="Table Turn"
              value={`${dashboardData.tableTurnRate?.current || 0}x`}
              change={dashboardData.tableTurnRate?.change ?? 0}
              icon={<Clock className="h-5 w-5" />}
            />
            <RestaurantMetricTile
              title="Avg Ticket"
              value={formatCurrency(dashboardData.avgTicket?.current || 0)}
              change={dashboardData.avgTicket?.change ?? 0}
              icon={<TrendingUp className="h-5 w-5" />}
            />
          </div>
        </section>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Live Operations */}
        <div className="lg:col-span-2 space-y-6">
          <LiveOrderFeed dashboardService={dashboardService} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TableFloorPlan tableService={tableService} />
            <MenuPerformance dashboardService={dashboardService} />
          </div>
          
          <ReservationsTimeline reservationService={reservationService} />
        </div>

        {/* Right Column - Management */}
        <div className="space-y-6">
          <EightySixBoard dashboardService={dashboardService} />
          <StaffActivityPanel dashboardService={dashboardService} />
          
          {dashboardData?.alerts && dashboardData.alerts.length > 0 && (
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

// Helper Functions
function RestaurantMetricTile({
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
  const isPositive = change >= 0;
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
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
