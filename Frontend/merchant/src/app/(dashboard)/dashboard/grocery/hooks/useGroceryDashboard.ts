/**
 * Grocery Dashboard Hook
 * Fetches all grocery dashboard data using React Query for caching and auto-refresh
 * Includes error handling, retry logic, and monitoring integration
 */

'use client';

import { useQuery } from '@tanstack/react-query';
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
import { QUERY_KEYS, DEFAULT_QUERY_CONFIG } from '@/lib/react-query';
import { logger } from '@vayva/shared';

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

const DEFAULT_DATA: DashboardData = {
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
};

export function useGroceryDashboard() {
  const queryKey = QUERY_KEYS.grocery.dashboard('default');
  
  const { data, isLoading, error, refetch, isFetching } = useQuery<DashboardData, Error>({
    queryKey,
    queryFn: async () => {
      try {
        const response = await fetch('/api/grocery/dashboard', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          // Add timeout handling
          signal: AbortSignal.timeout(30000), // 30 second timeout
        });
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => response.statusText);
          logger.error('[GROCERY_DASHBOARD] API error:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
          });
          throw new Error(`Failed to fetch grocery dashboard: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (!result.success || !result.data) {
          logger.warn('[GROCERY_DASHBOARD] Invalid response format:', result);
          return DEFAULT_DATA;
        }
        
        return result.data as DashboardData;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error occurred');
        logger.error('[GROCERY_DASHBOARD] Fetch failed:', {
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
        });
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Retry up to 3 times for network errors
      if (failureCount >= 3) return false;
      // Don't retry for authentication/authorization errors
      if (error.message.includes('401') || error.message.includes('403')) return false;
      return true;
    },
    retryDelay: (attemptIndex) => {
      // Exponential backoff: 1s, 2s, 4s
      return Math.min(1000 * Math.pow(2, attemptIndex), 10000);
    },
    ...DEFAULT_QUERY_CONFIG,
  });

  return {
    data: data || DEFAULT_DATA,
    loading: isLoading,
    fetching: isFetching,
    error: error?.message || null,
    refetch,
  };
}
