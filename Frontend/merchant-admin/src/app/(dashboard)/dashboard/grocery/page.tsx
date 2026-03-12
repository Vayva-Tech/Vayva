/**
 * Grocery Dashboard Main Component
 * Root component for the grocery industry dashboard
 */

'use client';

import React from 'react';
import { useGroceryDashboard } from './hooks/useGroceryDashboard';
import { TodaysPerformance } from './components/TodaysPerformance';
import { SalesByDepartment } from './components/SalesByDepartment';
import { InventoryAlerts } from './components/InventoryAlerts';
import { OnlineOrders } from './components/OnlineOrders';
import { CustomerInsights } from './components/CustomerInsights';
import { PromotionPerformance, PriceOptimization, ExpirationTracking, SupplierDeliveries, StockLevels, ActionRequired } from './components/Stubs';

export function GroceryDashboard() {
  const { data, isLoading, error } = useGroceryDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your grocery dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-2">⚠️ Error loading dashboard</div>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">VAYVA GROCERY</h1>
          <p className="text-gray-600">Fresh Market Dashboard</p>
        </div>

        {/* Today's Performance */}
        <TodaysPerformance metrics={data.metrics} />

        {/* Department Performance & Inventory Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesByDepartment departments={data.departments} />
          <InventoryAlerts alerts={data.stockAlerts} ordersToPlace={data.ordersToPlace} />
        </div>

        {/* Online Orders & Customer Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OnlineOrders orders={data.onlineOrders} />
          <CustomerInsights segments={data.customerSegments} metrics={data.customerMetrics} />
        </div>

        {/* Promotions & Price Optimization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PromotionPerformance promotions={data.promotions} roi={data.promotionROI} />
          <PriceOptimization comparisons={data.competitorPricing} suggestions={data.priceSuggestions} />
        </div>

        {/* Expiration Tracking & Supplier Deliveries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ExpirationTracking expiring={data.expiringProducts} savings={data.wasteReductionSavings} />
          <SupplierDeliveries deliveries={data.supplierDeliveries} />
        </div>

        {/* Stock Levels & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StockLevels inventoryHealth={data.inventoryHealth} />
          <ActionRequired tasks={data.tasks} />
        </div>
      </div>
    </div>
  );
}
