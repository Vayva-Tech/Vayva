/**
 * Main Dashboard Page
 * 
 * Comprehensive dashboard using all new components
 * Demonstrates the complete Phase 3B implementation
 */

'use client';

import React from 'react';
import {
  AdaptiveDashboardLayout,
  RevenueKPICard,
  OrdersKPICard,
  CustomersKPICard,
  ConversionKPICard,
  RevenueChart,
  OrderTrendChart,
  DashboardNotifications,
} from '@/features/dashboard/components';
import { useDashboardAggregate } from '@/features/dashboard/hooks/useDashboard';
import { Button } from '@vayva/ui';
import { RefreshCw } from 'lucide-react';
import { useRefreshDashboard } from '@/features/dashboard/hooks/useDashboard';

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboardAggregate('month');
  const refreshMutation = useRefreshDashboard();

  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Error Loading Dashboard</h2>
          <p className="mt-2 text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <AdaptiveDashboardLayout
      title="Dashboard"
      description="Overview of your store performance"
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshMutation.isPending}
        >
          <RefreshCw className={cn('mr-2 h-4 w-4', refreshMutation.isPending && 'animate-spin')} />
          Refresh
        </Button>
      }
    >
      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-lg border bg-gray-200 dark:bg-gray-700"
            />
          ))}
        </div>
      )}

      {/* Dashboard Content */}
      {data && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <RevenueKPICard
              title="Revenue"
              value={data.kpiData.revenue}
              change={data.kpiData.revenueChange}
              loading={isLoading}
            />
            <OrdersKPICard
              title="Orders"
              value={data.kpiData.orders}
              change={data.kpiData.ordersChange}
              loading={isLoading}
            />
            <CustomersKPICard
              title="Customers"
              value={data.kpiData.customers}
              change={data.kpiData.customersChange}
              loading={isLoading}
            />
            <ConversionKPICard
              title="Conversion Rate"
              value={data.kpiData.conversionRate}
              change={data.kpiData.conversionChange}
              loading={isLoading}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RevenueChart
              title="Revenue Trend"
              description="Last 30 days revenue performance"
              data={[]} // TODO: Extract trend data from API
              loading={isLoading}
            />
            <OrderTrendChart
              title="Orders Trend"
              description="Daily order volume"
              data={[]} // TODO: Extract trend data from API
              loading={isLoading}
            />
          </div>

          {/* Alerts & Actions */}
          <DashboardNotifications
            alerts={data.todosAlertsData.alerts}
            actions={data.todosAlertsData.todos}
          />

          {/* Recent Activity */}
          <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {data.activityData.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                    <ActivityIcon type={activity.type} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.time} • {activity.user}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Customers */}
          <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Top Customers
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Name
                    </th>
                    <th className="py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Email
                    </th>
                    <th className="py-2 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                      Orders
                    </th>
                    <th className="py-2 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                      Total Spend
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.customerInsightsData.topCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b last:border-0 dark:border-gray-700">
                      <td className="py-3 text-sm text-gray-900 dark:text-gray-100">
                        {customer.name}
                      </td>
                      <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                        {customer.email || '—'}
                      </td>
                      <td className="py-3 text-right text-sm text-gray-900 dark:text-gray-100">
                        {customer.orders}
                      </td>
                      <td className="py-3 text-right font-medium text-gray-900 dark:text-gray-100">
                        ${customer.spend.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AdaptiveDashboardLayout>
  );
}

// Helper component for activity icons
function ActivityIcon({ type }: { type: string }) {
  switch (type) {
    case 'ORDER':
      return <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    case 'PAYOUT':
      return <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />;
    case 'TICKET':
      return <MessageSquare className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
    default:
      return <Activity className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
  }
}

// Import icons
import { ShoppingCart, DollarSign, MessageSquare, Activity } from 'lucide-react';
import { cn } from '@vayva/ui';
