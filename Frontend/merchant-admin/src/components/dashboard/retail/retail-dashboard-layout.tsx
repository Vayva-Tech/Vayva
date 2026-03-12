'use client';

import React, { useState, useEffect } from 'react';
import { RetailKpiCard } from './retail-kpi-card';
import { SalesByChannelChart } from './sales-by-channel-chart';
import { StorePerformanceList } from './store-performance-list';
import { InventoryAlertsList } from './inventory-alerts-list';
import { TopProductsTable } from './top-products-table';
import { RecentOrdersTable } from './recent-orders-table';
import { CustomerInsightsChart } from './customer-insights-chart';
import { TransferKanban } from './transfer-kanban';
import { DollarSign, ShoppingCart, Users, Package, Percent } from 'lucide-react';
import { RETAIL_DASHBOARD_CONFIG } from '@vayva/industry-retail';

interface RetailDashboardLayoutProps {
  storeId: string;
  className?: string;
}

export function RetailDashboardLayout({ storeId, className }: RetailDashboardLayoutProps) {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    // Fetch dashboard data from API
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/retail/dashboard');
        const result = await response.json();
        
        if (result.success) {
          setDashboardData(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch retail dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [storeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading retail dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center text-destructive">
          <p>Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  const { metrics, channels, stores, inventory } = dashboardData;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Retail Overview</h1>
          <p className="text-muted-foreground mt-1">
            Multi-Channel Performance - {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <RetailKpiCard
          title="Revenue"
          value={metrics?.revenue || 0}
          change={0.153}
          trend="up"
          format="currency"
          icon={<DollarSign className="w-5 h-5" />}
          chartData={[120, 150, 180, 220, 200, 240, 280]}
        />
        <RetailKpiCard
          title="Orders"
          value={metrics?.orders || 0}
          change={0.221}
          trend="up"
          format="number"
          icon={<ShoppingCart className="w-5 h-5" />}
          chartData={[80, 95, 110, 130, 120, 140, 160]}
        />
        <RetailKpiCard
          title="Customers"
          value={metrics?.customers || 0}
          change={0.184}
          trend="up"
          format="number"
          icon={<Users className="w-5 h-5" />}
        />
        <RetailKpiCard
          title="Inventory Value"
          value={metrics?.inventoryValue || 0}
          change={0.082}
          trend="up"
          format="currency"
          icon={<Package className="w-5 h-5" />}
        />
        <RetailKpiCard
          title="Conversion Rate"
          value={metrics?.conversionRate || 0}
          change={0.006}
          trend="up"
          format="percent"
          icon={<Percent className="w-5 h-5" />}
        />
      </div>

      {/* Main Content - 3 Column Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Sales by Channel - 2 columns */}
        <div className="md:col-span-2">
          <SalesByChannelChart
            channels={channels?.map((c: any, i: number) => ({
              name: c.name || `Channel ${i + 1}`,
              value: c.revenue || 0,
              percentage: c.percent || 0,
              color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][i],
            })) || []}
          />
        </div>

        {/* Store Performance - 1 column */}
        <StorePerformanceList
          stores={stores?.map((s: any) => ({
            id: s.id,
            name: s.name,
            revenue: s.revenue,
            growth: s.growth,
            performancePercent: s.performancePercent,
          })) || []}
        />
      </div>

      {/* Second Row - Orders, Products, Customers */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Recent Orders */}
        <RecentOrdersTable
          orders={dashboardData.orders?.recent || []}
        />

        {/* Top Products */}
        <TopProductsTable
          products={dashboardData.products?.top || []}
        />

        {/* Customer Insights */}
        <CustomerInsightsChart
          newCustomers={dashboardData.customers?.new || 0}
          returningCustomers={dashboardData.customers?.returning || 0}
          churnRate={dashboardData.customers?.churnRate || 0.05}
        />
      </div>

      {/* Bottom Row - Inventory and Transfers */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Inventory Alerts */}
        <InventoryAlertsList
          alerts={inventory?.alerts?.map((a: any) => ({
            productId: a.productId,
            productName: a.productName,
            sku: a.sku,
            currentStock: a.currentStock,
            reorderPoint: a.reorderPoint,
            status: a.status,
          })) || []}
        />

        {/* Transfer Kanban Board */}
        <TransferKanban
          transfers={dashboardData.transfers || []}
        />
      </div>
    </div>
  );
}
