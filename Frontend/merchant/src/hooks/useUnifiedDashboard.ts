 "use client";

import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';

interface DashboardData {
  metrics: {
    revenue: number;
    orders: number;
    customers: number;
    averageOrderValue: number;
  };
  tasks: Array<{
    id: string;
    title: string;
    completed: boolean;
    dueDate?: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  alerts: Array<{
    id: string;
    type: 'info' | 'warning' | 'error';
    title: string;
    message: string;
    action?: { label: string; href: string };
  }>;
  insights: {
    trends: Array<{ metric: string; change: number; direction: 'up' | 'down' }>;
    predictions?: Array<{ insight: string; confidence: number }>;
  };
}

interface UseUnifiedDashboardReturn extends DashboardData {
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
  isValidating: boolean;
}

const fetcher = async (url: string): Promise<any> => {
  const response = await fetch(url);
  if (!response.ok) {
    const error = new Error('Failed to fetch dashboard data');
    throw error;
  }
  return response.json();
};

/**
 * Unified dashboard data fetching hook
 * 
 * Consolidates multiple API calls into a single optimized request
 * Implements caching, revalidation, and error handling
 * 
 * @param industry - Industry slug for industry-specific data
 * @returns Dashboard data and state
 */
export function useUnifiedDashboardData(industry: string): UseUnifiedDashboardReturn {
  const [data, setData] = useState<DashboardData>({
    metrics: { revenue: 0, orders: 0, customers: 0, averageOrderValue: 0 },
    tasks: [],
    alerts: [],
    insights: { trends: [] },
  });
  
  // Single SWR call for all dashboard data
  const { data: swrData, error, mutate, isValidating } = useSWR(
    `/api/v1/dashboard/unified?industry=${industry}`,
    fetcher,
    {
      refreshInterval: 30000, // 30 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // 5 seconds
    }
  );
  
  // Transform API response into standardized format
  useEffect(() => {
    if (swrData) {
      setData({
        metrics: swrData.metrics || {
          revenue: 0,
          orders: 0,
          customers: 0,
          averageOrderValue: 0,
        },
        tasks: swrData.tasks || [],
        alerts: swrData.alerts || [],
        insights: swrData.insights || { trends: [] },
      });
    }
  }, [swrData]);
  
  // Manual refresh function
  const refresh = useCallback(async () => {
    try {
      await mutate();
    } catch (err) {
      console.error('Failed to refresh dashboard:', err);
    }
  }, [mutate]);
  
  return {
    ...data,
    isLoading: !swrData && !error,
    error: error as Error | null,
    refresh,
    isValidating,
  };
}

/**
 * Alternative: Fetch individual modules separately (for granular control)
 * Use this when you need different refresh intervals per module
 */
export function useDashboardModule<T>(
  moduleName: string,
  options?: {
    refreshInterval?: number;
    enabled?: boolean;
  }
) {
  const { refreshInterval = 60000, enabled = true } = options || {};
  
  const { data, error, mutate, isValidating } = useSWR(
    enabled ? `/api/v1/dashboard/module/${moduleName}` : null,
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );
  
  return {
    data: data as T | null,
    isLoading: !data && !error,
    error: error as Error | null,
    refresh: mutate,
    isValidating,
  };
}

// Example module types
export interface MetricsModuleData {
  revenue: number;
  orders: number;
  customers: number;
  averageOrderValue: number;
  conversionRate: number;
  customerLifetimeValue: number;
}

export interface TasksModuleData {
  pending: Array<{
    id: string;
    title: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  completed: number;
  overdue: number;
}

export interface AlertsModuleData {
  critical: number;
  warnings: number;
  items: Array<{
    id: string;
    type: 'info' | 'warning' | 'error';
    title: string;
    message: string;
  }>;
}
