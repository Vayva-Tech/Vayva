// ============================================================================
// useWidgetData Hook
// ============================================================================
// Fetches and manages widget data with caching and refresh capabilities
// ============================================================================

import { useCallback, useEffect, useState } from "react";
import type { DataSourceConfig, WidgetData } from "../types.js";

interface UseWidgetDataOptions {
  storeId?: string;
  refreshInterval?: number;
  enabled?: boolean;
}

interface UseWidgetDataReturn<T = unknown> {
  data: WidgetData<T> | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * useWidgetData - Hook for fetching widget data
 *
 * Fetches data for a specific widget based on its data source configuration.
 * Supports automatic refresh intervals and manual refresh.
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, refresh } = useWidgetData('widget-1', dataSource, { storeId: '123' });
 * ```
 */
export function useWidgetData<T = unknown>(
  widgetId: string,
  dataSource: DataSourceConfig,
  options: UseWidgetDataOptions = {}
): UseWidgetDataReturn<T> {
  const { storeId, refreshInterval, enabled = true } = options;
  const [data, setData] = useState<WidgetData<T> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!storeId) {
      setError(new Error("Store ID is required"));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/dashboard/widgets/${widgetId}/data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          widgetId,
          dataSource,
          storeId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch widget data: ${response.statusText}`);
      }

      const result: WidgetData<T> = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [widgetId, dataSource, storeId]);

  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, fetchData]);

  // Set up refresh interval if specified
  useEffect(() => {
    if (!enabled || !refreshInterval) {
      return;
    }

    const intervalId = setInterval(fetchData, refreshInterval);
    return () => clearInterval(intervalId);
  }, [enabled, refreshInterval, fetchData]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchData,
  };
}
