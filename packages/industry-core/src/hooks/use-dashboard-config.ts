'use client';

// ============================================================================
// useDashboardConfig Hook
// ============================================================================
// Fetches and manages dashboard configuration for a specific industry
// ============================================================================

import { useCallback, useEffect, useState } from "react";
import type { DashboardConfigResponse, DashboardEngineConfig, IndustrySlug, LayoutPreset } from "../types";

interface UseDashboardConfigOptions {
  storeId?: string;
  enabled?: boolean;
}

interface UseDashboardConfigReturn {
  config: DashboardEngineConfig | null;
  layout: LayoutPreset | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * useDashboardConfig - Hook for fetching dashboard configuration
 *
 * Fetches the dashboard configuration and layout for a specific industry.
 * Handles loading states and error handling.
 *
 * @example
 * ```tsx
 * const { config, layout, isLoading, error } = useDashboardConfig('fashion', { storeId: '123' });
 * ```
 */
export function useDashboardConfig(
  industry: IndustrySlug,
  options: UseDashboardConfigOptions = {}
): UseDashboardConfigReturn {
  const { storeId, enabled = true } = options;
  const [config, setConfig] = useState<DashboardEngineConfig | null>(null);
  const [layout, setLayout] = useState<LayoutPreset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchConfig = useCallback(async () => {
    if (!storeId) {
      setError(new Error("Store ID is required"));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/v1/dashboard/${industry}/config?storeId=${storeId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard config: ${response.statusText}`);
      }

      const data: DashboardConfigResponse = await response.json();
      setConfig(data.config);
      setLayout(data.layout);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [industry, storeId]);

  useEffect(() => {
    if (enabled) {
      fetchConfig();
    }
  }, [enabled, fetchConfig]);

  return {
    config,
    layout,
    isLoading,
    error,
    refetch: fetchConfig,
  };
}
