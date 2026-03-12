/**
 * Grocery Dashboard Hook
 * Fetches all grocery dashboard data
 */

'use client';

import { useState, useEffect } from 'react';
import type { 
  DashboardMetrics,
  Department,
  StockAlert,
  OnlineOrder,
  CustomerSegment,
  Promotion,
  ExpiringProduct,
  SupplierDelivery,
  InventoryHealth,
  PriceOptimization,
  Task,
} from '@vayva/industry-grocery/types';

interface DashboardData {
  metrics: DashboardMetrics;
  departments: Department[];
  stockAlerts: StockAlert[];
  ordersToPlace: number;
  onlineOrders: OnlineOrder[];
  customerSegments: CustomerSegment[];
  customerMetrics: {
    totalCustomers: number;
    loyaltyMembers: number;
    newThisWeek: number;
    returningRate: number;
  };
  promotions: Promotion[];
  promotionROI: {
    revenue: number;
    discountGiven: number;
    roi: number;
  };
  competitorPricing: Array<{
    productId: string;
    productName: string;
    ourPrice: number;
    competitorAvg: number;
    difference: number;
  }>;
  priceSuggestions: PriceOptimization[];
  expiringProducts: ExpiringProduct[];
  wasteReductionSavings: number;
  supplierDeliveries: SupplierDelivery[];
  inventoryHealth: InventoryHealth;
  tasks: Task[];
}

export function useGroceryDashboard() {
  const [data, setData] = useState<DashboardData>({
    metrics: {
      salesToday: 0,
      salesTrend: 0,
      transactions: 0,
      onlineTransactions: 0,
      inStoreTransactions: 0,
      averageBasketSize: 0,
      basketSizeTrend: 0,
      notifications: 0,
    },
    departments: [],
    stockAlerts: [],
    ordersToPlace: 0,
    onlineOrders: [],
    customerSegments: [],
    customerMetrics: {
      totalCustomers: 0,
      loyaltyMembers: 0,
      newThisWeek: 0,
      returningRate: 0,
    },
    promotions: [],
    promotionROI: { revenue: 0, discountGiven: 0, roi: 0 },
    competitorPricing: [],
    priceSuggestions: [],
    expiringProducts: [],
    wasteReductionSavings: 0,
    supplierDeliveries: [],
    inventoryHealth: {
      inStock: 0,
      lowStock: 0,
      outOfStock: 0,
      overstocked: 0,
      turnoverDays: 0,
      shrinkageRate: 0,
      totalValue: 0,
    },
    tasks: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true);
        
        // Fetch from real API
        const response = await fetch('/api/grocery/dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const result = await response.json();
        const data = result.data;
        
        setData(data);
        
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch dashboard data'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return { data, isLoading, error };
}
