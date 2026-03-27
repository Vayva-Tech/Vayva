/**
 * Grocery Dashboard Main Component
 * Root component for the grocery industry dashboard
 */

'use client';

import { motion } from 'framer-motion';
import React from 'react';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { logger } from '@vayva/shared';
import { useGroceryDashboard } from './hooks/useGroceryDashboard';
import { GrocerySkeleton } from './components/GrocerySkeleton';
import { ComponentErrorState } from '@/components/error-boundary/ComponentErrorState';
import { TodaysPerformance } from './components/TodaysPerformance';
import { SalesByDepartment } from './components/SalesByDepartment';
import { InventoryAlerts } from './components/InventoryAlerts';
import { OnlineOrders } from './components/OnlineOrders';
import { CustomerInsights } from './components/CustomerInsights';
import { 
  PromotionPerformance, 
  PriceOptimization, 
  ExpirationTracking, 
  SupplierDeliveries, 
  StockLevels, 
  ActionRequired 
} from '@vayva/industry-grocery/components';

export function GroceryDashboard() {
  const { data, loading: isLoading, error, refetch } = useGroceryDashboard();

  // Show custom skeleton during initial load
  if (isLoading) {
    return <GrocerySkeleton />;
  }

  // Show error state with retry option
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-2 sm:p-4 md:p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-lg mb-2 font-semibold">⚠️ Error Loading Dashboard</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-2 sm:p-4 md:p-6"
    >
      <div className="max-w-[1800px] mx-auto space-y-4 sm:space-y-6">
        {/* Header - Mobile Responsive */}
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">VAYVA GROCERY</h1>
          <p className="text-sm sm:text-base text-gray-600">Fresh Market Dashboard</p>
        </div>

        <ErrorBoundary 
          serviceName="TodaysPerformance"
          fallback={<ComponentErrorState onRetry={() => refetch()} />}
          onError={(error) => logger.error('TodaysPerformance failed', error)}
        >
          <TodaysPerformance metrics={data.metrics} />
        </ErrorBoundary>

        {/* Department Performance & Inventory Alerts - Mobile Responsive Stack */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <ErrorBoundary 
            serviceName="SalesByDepartment"
            fallback={<ComponentErrorState onRetry={() => refetch()} />}
            onError={(error) => logger.error('SalesByDepartment failed', error)}
          >
            <SalesByDepartment departments={data.departments} />
          </ErrorBoundary>
          <ErrorBoundary 
            serviceName="InventoryAlerts"
            fallback={<ComponentErrorState onRetry={() => refetch()} />}
            onError={(error) => logger.error('InventoryAlerts failed', error)}
          >
            <InventoryAlerts alerts={data.stockAlerts} ordersToPlace={data.ordersToPlace} />
          </ErrorBoundary>
        </div>

        {/* Online Orders & Customer Insights - Mobile Responsive Stack */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <ErrorBoundary 
            serviceName="OnlineOrders"
            fallback={<ComponentErrorState onRetry={() => refetch()} />}
            onError={(error) => logger.error('OnlineOrders failed', error)}
          >
            <OnlineOrders orders={data.onlineOrders} />
          </ErrorBoundary>
          <ErrorBoundary 
            serviceName="CustomerInsights"
            fallback={<ComponentErrorState onRetry={() => refetch()} />}
            onError={(error) => logger.error('CustomerInsights failed', error)}
          >
            <CustomerInsights segments={data.customerSegments} metrics={data.customerMetrics} />
          </ErrorBoundary>
        </div>

        {/* Promotions & Price Optimization - Mobile Responsive Stack */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <ErrorBoundary 
            serviceName="PromotionPerformance"
            fallback={<ComponentErrorState onRetry={() => refetch()} />}
            onError={(error) => logger.error('PromotionPerformance failed', error)}
          >
            <PromotionPerformance promotions={data.promotions} roi={data.promotionROI} />
          </ErrorBoundary>
          <ErrorBoundary 
            serviceName="PriceOptimization"
            fallback={<ComponentErrorState onRetry={() => refetch()} />}
            onError={(error) => logger.error('PriceOptimization failed', error)}
          >
            <PriceOptimization comparisons={data.competitorPricing} suggestions={data.priceSuggestions} />
          </ErrorBoundary>
        </div>

        {/* Expiration Tracking & Supplier Deliveries - Mobile Responsive Stack */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <ErrorBoundary 
            serviceName="ExpirationTracking"
            fallback={<ComponentErrorState onRetry={() => refetch()} />}
            onError={(error) => logger.error('ExpirationTracking failed', error)}
          >
            <ExpirationTracking expiring={data.expiringProducts} savings={data.wasteReductionSavings} />
          </ErrorBoundary>
          <ErrorBoundary 
            serviceName="SupplierDeliveries"
            fallback={<ComponentErrorState onRetry={() => refetch()} />}
            onError={(error) => logger.error('SupplierDeliveries failed', error)}
          >
            <SupplierDeliveries deliveries={data.supplierDeliveries} />
          </ErrorBoundary>
        </div>

        {/* Stock Levels & Actions - Mobile Responsive Stack */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <ErrorBoundary 
            serviceName="StockLevels"
            fallback={<ComponentErrorState onRetry={() => refetch()} />}
            onError={(error) => logger.error('StockLevels failed', error)}
          >
            <StockLevels inventoryHealth={data.inventoryHealth} />
          </ErrorBoundary>
          <ErrorBoundary 
            serviceName="ActionRequired"
            fallback={<ComponentErrorState onRetry={() => refetch()} />}
            onError={(error) => logger.error('ActionRequired failed', error)}
          >
            <ActionRequired tasks={data.tasks} />
          </ErrorBoundary>
        </div>
      </div>
    </motion.div>
  );
}
