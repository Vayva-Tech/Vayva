'use client';

import React from 'react';
import type { IndustrySlug } from '@/lib/templates/types';
import type { 
  DashboardVariant, 
  IndustryDashboardData, 
  DashboardError,
  DashboardDataResponse,
  AlertSeverity,
} from '@/config/dashboard-universal-types';
import { generateDashboardConfig } from '@/config/industry-dashboard-config';
import { useToast } from '@/hooks/use-toast';

interface UseUniversalDashboardOptions {
  industry: IndustrySlug;
  variant: DashboardVariant;
  userId: string;
  businessId: string;
  timeHorizon?: string;
  currency?: string;
  enabled?: boolean;
  refreshInterval?: number; // in milliseconds
}

interface UseUniversalDashboardReturn {
  data: IndustryDashboardData | null;
  config: ReturnType<typeof generateDashboardConfig> | null;
  loading: boolean;
  error: DashboardError | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  isValidating: boolean;
}

/**
 * useUniversalDashboard - Centralized data fetching hook for the universal dashboard
 * Handles API calls, caching, error handling, and real-time updates
 */
export function useUniversalDashboard({
  industry,
  variant,
  userId,
  businessId,
  timeHorizon = 'today',
  currency = 'USD',
  enabled = true,
  refreshInterval = 30000 // 30 seconds
}: UseUniversalDashboardOptions): UseUniversalDashboardReturn {
  const [data, setData] = React.useState<IndustryDashboardData | null>(null);
  const [config, setConfig] = React.useState<ReturnType<typeof generateDashboardConfig> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isValidating, setIsValidating] = React.useState(false);
  const [error, setError] = React.useState<DashboardError | null>(null);
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);
  const { toast } = useToast();

  // Generate initial config
  React.useEffect(() => {
    try {
      const dashboardConfig = generateDashboardConfig(industry, variant);
      setConfig(dashboardConfig);
    } catch (err) {
      setError({
        code: 'CONFIG_ERROR',
        message: err instanceof Error ? err.message : 'Failed to generate dashboard configuration',
        retryable: false
      });
    }
  }, [industry, variant]);

  // Fetch dashboard data
  const fetchData = React.useCallback(async (showLoading = true) => {
    if (!enabled || !config) return;

    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setIsValidating(true);
      }
      
      setError(null);

      // Build API endpoint
      const params = new URLSearchParams({
        industry,
        variant,
        userId,
        businessId,
        timeHorizon,
        currency
      });

      const response = await fetch(`/api/dashboard/universal?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: DashboardDataResponse = await response.json();

      // Validate response structure
      if (!result.data || !result.config) {
        throw new Error('Invalid response structure from dashboard API');
      }

      setData(result.data);
      setLastUpdated(new Date(result.lastUpdated));
      
    } catch (err: unknown) {
      const dashboardError: DashboardError = {
        code: 'FETCH_ERROR',
        message: err instanceof Error ? err.message : 'Failed to fetch dashboard data',
        details: err,
        retryable: true
      };
      
      setError(dashboardError);
      
      toast({
        title: "Dashboard Error",
        description: dashboardError.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setIsValidating(false);
    }
  }, [enabled, config, industry, variant, userId, businessId, timeHorizon, currency, toast]);

  // Initial data fetch
  React.useEffect(() => {
    if (enabled && config) {
      fetchData(true);
    }
  }, [fetchData, enabled, config]);

  // Refresh interval
  React.useEffect(() => {
    if (!enabled || !refreshInterval || refreshInterval <= 0) return;

    const interval = setInterval(() => {
      fetchData(false); // Background refresh without loading spinner
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchData, enabled, refreshInterval]);

  // Manual refresh function
  const refresh = React.useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  // Real-time updates via WebSocket (if available)
  React.useEffect(() => {
    if (!enabled) return;

    // Check if WebSocket is available
    if (typeof window !== 'undefined' && window.WebSocket) {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.host}/api/ws/dashboard?industry=${industry}&businessId=${businessId}`;
      
      const ws = new WebSocket(wsUrl);
      
      ws.onmessage = (event) => {
        try {
          const update: unknown = JSON.parse(String(event.data));
          if (
            typeof update === 'object' &&
            update !== null &&
            'type' in update &&
            (update as { type: unknown }).type === 'dashboard_update' &&
            'data' in update &&
            typeof (update as { data: unknown }).data === 'object' &&
            (update as { data: unknown }).data !== null
          ) {
            const patch = (update as { data: Record<string, unknown> }).data;
            setData((prevData) => {
              if (!prevData) return null;

              return {
                ...prevData,
                ...patch,
              } as IndustryDashboardData;
            });
            setLastUpdated(new Date());
          }
        } catch (err) {
          console.warn('Failed to parse WebSocket message:', err);
        }
      };
      
      ws.onerror = (error) => {
        console.warn('Dashboard WebSocket error:', error);
      };
      
      return () => {
        ws.close();
      };
    }
  }, [enabled, industry, businessId]);

  return {
    data,
    config,
    loading,
    error,
    lastUpdated,
    refresh,
    isValidating
  };
}

// ---------------------------------------------------------------------------
// Helper Hooks
// ---------------------------------------------------------------------------

/**
 * useDashboardMetrics - Extract metrics from dashboard data
 */
export function useDashboardMetrics(
  dashboardData: IndustryDashboardData | null,
  metricKeys: string[]
) {
  return React.useMemo(() => {
    if (!dashboardData?.metrics) return [];
    
    return metricKeys
      .map((key) => {
        const m = dashboardData.metrics[key];
        return m ? { key, ...m } : null;
      })
      .filter(
        (metric): metric is { key: string; value: number | string } & Record<string, unknown> =>
          metric !== null && metric.value !== undefined,
      );
  }, [dashboardData, metricKeys]);
}

/**
 * useDashboardAlerts - Filter and sort alerts
 */
export function useDashboardAlerts(
  dashboardData: IndustryDashboardData | null,
  severityFilter?: string[]
) {
  return React.useMemo(() => {
    if (!dashboardData?.alerts) return [];
    
    let filtered = dashboardData.alerts.filter(alert => !alert.resolved);
    
    if (severityFilter && severityFilter.length > 0) {
      filtered = filtered.filter(alert => 
        severityFilter.includes(alert.severity)
      );
    }
    
    return filtered.sort((a, b) => {
      const severityOrder: Record<AlertSeverity, number> = {
        critical: 3,
        warning: 2,
        info: 1,
      };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      
      if (severityDiff !== 0) return severityDiff;
      
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [dashboardData, severityFilter]);
}

/**
 * useDashboardActions - Filter and sort suggested actions
 */
export function useDashboardActions(
  dashboardData: IndustryDashboardData | null,
  categoryFilter?: string[]
) {
  return React.useMemo(() => {
    if (!dashboardData?.suggestedActions) return [];
    
    let filtered = dashboardData.suggestedActions;
    
    if (categoryFilter && categoryFilter.length > 0) {
      filtered = filtered.filter(action => 
        categoryFilter.includes(action.category)
      );
    }
    
    return filtered.sort((a, b) => {
      const priorityOrder: Record<
        'critical' | 'high' | 'medium' | 'low',
        number
      > = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      return a.condition.localeCompare(b.condition);
    });
  }, [dashboardData, categoryFilter]);
}

/**
 * useDashboardTimeSeries - Prepare time series data for charts
 */
export function useDashboardTimeSeries(
  dashboardData: IndustryDashboardData | null,
  chartKey: string,
  timeField: string = 'date'
) {
  return React.useMemo(() => {
    const series = dashboardData?.charts?.[chartKey];
    if (!series?.length) return [];

    return series
      .map((item: Record<string, unknown>) => {
        const raw = item[timeField];
        const t =
          raw instanceof Date
            ? raw
            : typeof raw === 'string' || typeof raw === 'number'
              ? new Date(raw)
              : new Date(NaN);
        return { ...item, [timeField]: t } as Record<string, unknown> & {
          [k: string]: Date;
        };
      })
      .sort(
        (a, b) =>
          (a[timeField] as Date).getTime() - (b[timeField] as Date).getTime()
      );
  }, [dashboardData, chartKey, timeField]);
}

// ---------------------------------------------------------------------------
// Cache Management
// ---------------------------------------------------------------------------

class DashboardCache {
  private cache: Map<string, { data: unknown; timestamp: number; ttl: number }> = new Map();
  
  set(key: string, data: unknown, ttl: number = 300000) { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  get(key: string) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  clear() {
    this.cache.clear();
  }
  
  clearExpired() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const dashboardCache = new DashboardCache();