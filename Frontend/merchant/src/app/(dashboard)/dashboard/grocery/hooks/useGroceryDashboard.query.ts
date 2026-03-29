/**
 * Standardized React Query hooks for Grocery Dashboard
 * Replaces manual useEffect-based fetching with cached, auto-refreshing queries
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

/**
 * Main hook for fetching complete grocery dashboard data
 * Uses React Query for caching, background refetching, and automatic retries
 */
export function useGroceryDashboard(businessId: string) {
  const queryKey = QUERY_KEYS.grocery.dashboard(businessId);
  
  const { data, isLoading, error, refetch, isFetching, isError } = useQuery<DashboardData, Error>({
    queryKey,
    queryFn: async () => {
      const response = await fetch('/grocery/dashboard');
      if (!response.ok) {
        throw new Error(`Failed to fetch grocery dashboard: ${response.statusText}`);
      }
      const result = await response.json();
      return result.data as DashboardData;
    },
    ...DEFAULT_QUERY_CONFIG,
    enabled: !!businessId,
  });

  return {
    data: data || null,
    loading: isLoading,
    fetching: isFetching,
    error: error?.message || null,
    isError,
    refetch,
  };
}

/**
 * Hook for fetching only grocery promotions data
 * Useful for isolated promotion components
 */
export function useGroceryPromotions(businessId: string) {
  const queryKey = QUERY_KEYS.grocery.promotions(businessId);
  
  const { data, isLoading, error, refetch } = useQuery<{
    promotions: Promotion[];
    promotionROI: { revenue: number; discountGiven: number; roi: number; };
  }, Error>({
    queryKey,
    queryFn: async () => {
      const response = await fetch(`/api/grocery/promotions?businessId=${businessId}`);
      if (!response.ok) throw new Error('Failed to fetch promotions');
      return response.json();
    },
    ...DEFAULT_QUERY_CONFIG,
    enabled: !!businessId,
  });

  return {
    data: data || null,
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
}

/**
 * Hook for fetching inventory-related data
 * Combines stock alerts, inventory health, and expiration tracking
 */
export function useGroceryInventory(businessId: string) {
  const queryKey = QUERY_KEYS.grocery.inventory(businessId);
  
  const { data, isLoading, error, refetch } = useQuery<{
    stockAlerts: StockAlert[];
    ordersToPlace: number;
    inventoryHealth: InventoryHealth;
    expiringProducts: ExpiringProduct[];
    wasteReductionSavings: number;
  }, Error>({
    queryKey,
    queryFn: async () => {
      const response = await fetch(`/api/grocery/inventory?businessId=${businessId}`);
      if (!response.ok) throw new Error('Failed to fetch inventory data');
      return response.json();
    },
    ...DEFAULT_QUERY_CONFIG,
    enabled: !!businessId,
  });

  return {
    data: data || null,
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
}

/**
 * Hook for fetching supplier and delivery data
 */
export function useGrocerySuppliers(businessId: string) {
  const queryKey = QUERY_KEYS.grocery.suppliers(businessId);
  
  const { data, isLoading, error, refetch } = useQuery<{
    supplierDeliveries: SupplierDelivery[];
    tasks: Task[];
  }, Error>({
    queryKey,
    queryFn: async () => {
      const response = await fetch(`/api/grocery/suppliers?businessId=${businessId}`);
      if (!response.ok) throw new Error('Failed to fetch supplier data');
      return response.json();
    },
    ...DEFAULT_QUERY_CONFIG,
    enabled: !!businessId,
  });

  return {
    data: data || null,
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
}
