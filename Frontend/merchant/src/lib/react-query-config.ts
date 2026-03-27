/**
 * React Query Global Cache Configuration
 * 
 * Centralized React Query configuration for consistent API caching.
 * Alternative to SWR with more advanced features for complex data management.
 * 
 * @see https://tanstack.com/query/v5/docs/react/overview
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Default query options
 */
const defaultOptions = {
  queries: {
    // Retry logic - don't retry on 4xx errors
    retry: (failureCount: number, error: any) => {
      const status = error?.status;
      if (status && status >= 400 && status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    
    // Stale time - how long before data is considered stale
    staleTime: 1000 * 60, // 1 minute
    
    // GC time - how long to keep inactive data in cache
    gcTime: 1000 * 60 * 5, // 5 minutes
    
    // Refetch on window focus
    refetchOnWindowFocus: true,
    
    // Refetch on reconnect
    refetchOnReconnect: true,
    
    // Don't refetch when stale (use stale-while-revalidate strategy)
    refetchOnMount: 'always',
    
    // Keep previous data while fetching
    placeholderData: (previousData: unknown) => previousData,
  } as const,
};

/**
 * Create React Query client with default options
 */
export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions,
  });
};

/**
 * Query key utilities for consistent cache keys
 */
export const queryKeys = {
  /**
   * Analytics queries
   */
  analytics: {
    all: ['analytics'] as const,
    overview: (businessId: string) => [...queryKeys.analytics.all, 'overview', businessId] as const,
    metrics: (businessId: string, timeframe?: string) => 
      [...queryKeys.analytics.all, 'metrics', businessId, timeframe] as const,
    trends: (businessId: string) => [...queryKeys.analytics.all, 'trends', businessId] as const,
  },
  
  /**
   * Merchant queries
   */
  merchant: {
    all: ['merchant'] as const,
    profile: (merchantId: string) => [...queryKeys.merchant.all, 'profile', merchantId] as const,
    stores: (merchantId: string) => [...queryKeys.merchant.all, 'stores', merchantId] as const,
    settings: (merchantId: string) => [...queryKeys.merchant.all, 'settings', merchantId] as const,
  },
  
  /**
   * Campaign queries
   */
  campaigns: {
    all: ['campaigns'] as const,
    list: (storeId: string) => [...queryKeys.campaigns.all, 'list', storeId] as const,
    details: (campaignId: string) => [...queryKeys.campaigns.all, 'details', campaignId] as const,
    performance: (campaignId: string) => [...queryKeys.campaigns.all, 'performance', campaignId] as const,
  },
  
  /**
   * Orders queries
   */
  orders: {
    all: ['orders'] as const,
    list: (storeId: string, status?: string) => 
      [...queryKeys.orders.all, 'list', storeId, status] as const,
    details: (orderId: string) => [...queryKeys.orders.all, 'details', orderId] as const,
    stats: (storeId: string) => [...queryKeys.orders.all, 'stats', storeId] as const,
  },
  
  /**
   * Products queries
   */
  products: {
    all: ['products'] as const,
    list: (storeId: string) => [...queryKeys.products.all, 'list', storeId] as const,
    categories: (storeId: string) => [...queryKeys.products.all, 'categories', storeId] as const,
    inventory: (storeId: string) => [...queryKeys.products.all, 'inventory', storeId] as const,
  },
  
  /**
   * Ad platform queries
   */
  adPlatforms: {
    all: ['adPlatforms'] as const,
    accounts: (storeId: string) => [...queryKeys.adPlatforms.all, 'accounts', storeId] as const,
  },
};

/**
 * Export singleton instance for use outside React components
 */
export const queryClient = createQueryClient();
