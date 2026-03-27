/**
 * SWR Global Cache Configuration
 * 
 * Centralized SWR configuration for consistent API caching across the application.
 * This reduces duplicate API calls and improves performance through shared caches.
 * 
 * @see https://swr.vercel.app/docs/advanced/cache
 */

import type { SWRConfiguration } from 'swr';

/**
 * Default fetcher for SWR
 */
export const swrFetcher = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  
  if (!response.ok) {
    const error = new Error(`API Error: ${response.status}`);
    (error as any).status = response.status;
    throw error;
  }
  
  return response.json();
};

/**
 * Default SWR configuration
 * 
 * Features:
 * - 2 second deduping interval to prevent duplicate requests
 * - 60 second revalidation on focus (can be disabled per-request)
 * - 30 second revalidation on reconnect
 * - Retry logic with exponential backoff
 */
export const defaultConfig: SWRConfiguration = {
  // Dedupe requests within 2 seconds
  dedupingInterval: 2000,
  
  // Revalidate on focus by default
  revalidateOnFocus: true,
  
  // Reconnect on network reconnection
  revalidateOnReconnect: true,
  
  // Don't revalidate when window becomes visible (optional optimization)
  revalidateIfStale: true,
  
  // Keep data in cache even when component unmounts
  keepPreviousData: true,
  
  // Retry logic
  shouldRetryOnError: (error: unknown) => {
    const status = (error as any)?.status;
    // Don't retry on 4xx errors (client errors)
    if (status && status >= 400 && status < 500) {
      return false;
    }
    return true;
  },
  
  // Maximum retry count
  errorRetryCount: 3,
  
  // Exponential backoff for retries
  errorRetryInterval: (retryCount: number) => {
    // First retry: 1s, Second: 2s, Third: 4s
    return Math.min(1000 * Math.pow(2, retryCount), 10000);
  },
  
  // Loading timeout (10 seconds)
  loadingTimeout: 10000,
};

/**
 * Cache key utilities
 */
export const cacheKeys = {
  /**
   * Analytics endpoints
   */
  analytics: {
    overview: (businessId: string) => `/api/analytics/overview?businessId=${businessId}`,
    metrics: (businessId: string, timeframe?: string) => 
      `/api/analytics/metrics?businessId=${businessId}${timeframe ? `&timeframe=${timeframe}` : ''}`,
    trends: (businessId: string) => `/api/analytics/trends?businessId=${businessId}`,
  },
  
  /**
   * Merchant/Business endpoints
   */
  merchant: {
    profile: (merchantId: string) => `/api/merchant/${merchantId}/profile`,
    stores: (merchantId: string) => `/api/merchant/${merchantId}/stores`,
    settings: (merchantId: string) => `/api/merchant/${merchantId}/settings`,
  },
  
  /**
   * Campaign endpoints
   */
  campaigns: {
    list: (storeId: string) => `/api/campaigns?storeId=${storeId}`,
    details: (campaignId: string) => `/api/campaigns/${campaignId}`,
    performance: (campaignId: string) => `/api/campaigns/${campaignId}/performance`,
  },
  
  /**
   * Orders endpoints
   */
  orders: {
    list: (storeId: string, status?: string) => 
      `/api/orders?storeId=${storeId}${status ? `&status=${status}` : ''}`,
    details: (orderId: string) => `/api/orders/${orderId}`,
    stats: (storeId: string) => `/api/orders/stats?storeId=${storeId}`,
  },
  
  /**
   * Products endpoints
   */
  products: {
    list: (storeId: string) => `/api/products?storeId=${storeId}`,
    categories: (storeId: string) => `/api/products/categories?storeId=${storeId}`,
    inventory: (storeId: string) => `/api/products/inventory?storeId=${storeId}`,
  },
  
  /**
   * Ad platform accounts
   */
  adPlatforms: {
    accounts: (storeId: string) => `/api/ad-platforms/accounts?storeId=${storeId}`,
  },
};

/**
 * Pre-configured hooks for common API calls
 */

/**
 * Analytics cache configuration
 * Refresh every 60 seconds when in view
 */
export const analyticsConfig: SWRConfiguration = {
  ...defaultConfig,
  refreshInterval: 60000, // 1 minute
  revalidateOnFocus: false, // Don't revalidate on focus for analytics
};

/**
 * Real-time data configuration
 * Refresh every 10 seconds for live data
 */
export const realtimeConfig: SWRConfiguration = {
  ...defaultConfig,
  refreshInterval: 10000, // 10 seconds
  dedupingInterval: 5000, // 5 seconds
};

/**
 * Static data configuration
 * Rarely changes, cache for 5 minutes
 */
export const staticConfig: SWRConfiguration = {
  ...defaultConfig,
  refreshInterval: 300000, // 5 minutes
  revalidateOnFocus: false,
};

/**
 * User-specific data configuration
 * Revalidate on focus to ensure fresh data
 */
export const userConfig: SWRConfiguration = {
  ...defaultConfig,
  refreshInterval: 0, // No auto-refresh
  revalidateOnFocus: true,
};

/**
 * Helper function to invalidate specific cache keys
 */
export const invalidateCache = async (pattern: string | string[]): Promise<void> => {
  const { mutate } = await import('swr');
  
  if (typeof pattern === 'string') {
    await mutate((key) => {
      if (typeof key === 'string') {
        return key.includes(pattern);
      }
      return false;
    });
  } else {
    await Promise.all(
      pattern.map((p) =>
        mutate((key) => {
          if (typeof key === 'string') {
            return key.includes(p);
          }
          return false;
        })
      )
    );
  }
};

/**
 * Helper function to clear entire cache
 */
export const clearCache = async (): Promise<void> => {
  const { mutate } = await import('swr');
  await mutate(() => true);
};
