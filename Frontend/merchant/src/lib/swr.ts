"use client";

import useSWR, { SWRConfiguration, SWRResponse, Key } from "swr";
import { useOffline } from "@/context/OfflineContext";
import { useEffect, useCallback } from "react";

// Default fetcher with error handling
const defaultFetcher = async (url: string): Promise<unknown> => {
  const response = await fetch(url);
  
  if (!response.ok) {
    const error = new Error(`API Error: ${response.status}`);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }
  
  return response.json();
};

// Generate cache key for localStorage
function getCacheKey(key: Key): string {
  if (typeof key === "string") return key;
  if (Array.isArray(key)) return key.join("_");
  return String(key);
}

interface UseCachedSWRConfig<T> extends SWRConfiguration {
  cacheTTL?: number; // minutes
  cacheKey?: string;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

/**
 * Enhanced SWR hook with localStorage fallback for offline support
 * Automatically caches successful responses and uses cache when offline
 */
export function useCachedSWR<T = unknown>(
  key: Key,
  fetcher: (url: string) => Promise<T> = defaultFetcher as (url: string) => Promise<T>,
  config: UseCachedSWRConfig<T> = {}
): SWRResponse<T, Error> {
  const { 
    cacheTTL = 60, 
    cacheKey: customCacheKey,
    onSuccess,
    onError,
    ...swrConfig 
  } = config;
  
  const { getCachedData, setCachedData, isOnline } = useOffline();
  const cacheKey = customCacheKey || getCacheKey(key);
  
  // Get cached data for fallback
  const fallbackData = getCachedData<T>(cacheKey);
  
  // Custom fetcher that caches successful responses
  const cachingFetcher = useCallback(
    async (url: string): Promise<T> => {
      try {
        const data = await fetcher(url);
        // Cache successful response
        setCachedData(cacheKey, data, cacheTTL);
        onSuccess?.(data);
        return data;
      } catch (error) {
        // If offline and we have cached data, return it
        if (!isOnline) {
          const cached = getCachedData<T>(cacheKey);
          if (cached) {
            return cached;
          }
        }
        onError?.(error as Error);
        throw error;
      }
    },
    [fetcher, cacheKey, cacheTTL, isOnline, setCachedData, getCachedData, onSuccess, onError]
  );
  
  const swr = useSWR<T, Error>(key, cachingFetcher, {
    ...swrConfig,
    fallbackData: fallbackData ?? swrConfig.fallbackData,
    // Refresh when coming back online
    refreshWhenHidden: false,
    refreshWhenOffline: false,
    revalidateOnFocus: isOnline,
    revalidateOnReconnect: true,
    // Don't retry on 4xx errors
    shouldRetryOnError: (err: Error & { status?: number }) => {
      if (err.status && err.status >= 400 && err.status < 500) {
        return false;
      }
      return true;
    },
    // Retry up to 3 times
    errorRetryCount: 3,
  });
  
  // Update cache when data changes
  useEffect(() => {
    if (swr.data && isOnline) {
      setCachedData(cacheKey, swr.data, cacheTTL);
    }
  }, [swr.data, cacheKey, cacheTTL, isOnline, setCachedData]);
  
  return swr;
}

/**
 * Hook for mutations with offline queue support
 */
export function useOfflineMutation<T, R = unknown>(
  endpoint: string,
  method: "POST" | "PATCH" | "DELETE" = "POST"
) {
  const { isOnline, queueAction, processQueuedActions } = useOffline();
  
  const mutate = async (payload: T): Promise<R | null> => {
    if (!isOnline) {
      // Queue for later
      queueAction({
        id: `${endpoint}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: method.toLowerCase() as "create" | "update" | "delete",
        endpoint,
        payload,
        timestamp: Date.now(),
        retryCount: 0,
      });
      
      throw new Error("You are offline. Changes will be synced when connection is restored.");
    }
    
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      // Process any queued actions after successful mutation
      void processQueuedActions();
      
      return await response.json() as R;
    } catch (error) {
      // If network error, queue for retry
      if ((error as Error).message?.includes("fetch") || (error as Error).message?.includes("network")) {
        queueAction({
          id: `${endpoint}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: method.toLowerCase() as "create" | "update" | "delete",
          endpoint,
          payload,
          timestamp: Date.now(),
          retryCount: 0,
        });
      }
      throw error;
    }
  };
  
  return { mutate, isOnline };
}

/**
 * Preload data into cache
 */
export function usePreloadData() {
  const { setCachedData } = useOffline();
  
  const preload = async <T,>(url: string, cacheKey: string, ttl = 60): Promise<void> => {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json() as T;
        setCachedData(cacheKey, data, ttl);
      }
    } catch {
      // Silently fail preloading
    }
  };
  
  return { preload };
}

// Re-export SWR hooks for convenience
export { useSWR };
export type { SWRConfiguration, SWRResponse, Key };
