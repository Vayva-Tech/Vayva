/**
 * Dashboard Hooks
 * 
 * React Query hooks for dashboard data fetching
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import type {
  DashboardAggregateData,
  DashboardKpis,
  DashboardAlerts,
  DashboardActions,
  DashboardTrends,
} from '../types';

// ─── Query Keys ────────────────────────────────────────────────
export const dashboardKeys = {
  all: ['dashboard'] as const,
  aggregate: (range: 'today' | 'week' | 'month' = 'month') => [...dashboardKeys.all, 'aggregate', range] as const,
  kpis: () => [...dashboardKeys.all, 'kpis'] as const,
  alerts: () => [...dashboardKeys.all, 'alerts'] as const,
  actions: () => [...dashboardKeys.all, 'actions'] as const,
  trends: (metric: string, period: '7d' | '30d' | '90d') => [...dashboardKeys.all, 'trends', metric, period] as const,
  metrics: () => [...dashboardKeys.all, 'metrics'] as const,
};

// ─── Hooks ─────────────────────────────────────────────────────

/**
 * Hook to fetch all dashboard data in one call
 */
export function useDashboardAggregate(range: 'today' | 'week' | 'month' = 'month') {
  return useQuery({
    queryKey: dashboardKeys.aggregate(range),
    queryFn: () => dashboardApi.getAggregateData(range),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch KPIs only
 */
export function useDashboardKpis() {
  return useQuery({
    queryKey: dashboardKeys.kpis(),
    queryFn: () => dashboardApi.getKpis(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch active alerts
 */
export function useDashboardAlerts() {
  return useQuery({
    queryKey: dashboardKeys.alerts(),
    queryFn: () => dashboardApi.getAlerts(),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });
}

/**
 * Hook to fetch suggested actions
 */
export function useDashboardActions() {
  return useQuery({
    queryKey: dashboardKeys.actions(),
    queryFn: () => dashboardApi.getActions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}

/**
 * Hook to fetch trend data
 */
export function useDashboardTrends(metric: string, period: '7d' | '30d' | '90d' = '30d') {
  return useQuery({
    queryKey: dashboardKeys.trends(metric, period),
    queryFn: () => dashboardApi.getTrends(metric, period),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch metrics (legacy)
 */
export function useDashboardMetrics() {
  return useQuery({
    queryKey: dashboardKeys.metrics(),
    queryFn: () => dashboardApi.getMetrics(),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
}

/**
 * Hook to refresh dashboard cache
 */
export function useRefreshDashboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => dashboardApi.refreshCache(),
    onSuccess: () => {
      // Invalidate all dashboard queries
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

/**
 * Hook to fetch dashboard data with smart polling
 * Polls more frequently for real-time data
 */
export function useDashboardWithPolling(
  range: 'today' | 'week' | 'month' = 'month',
  enablePolling = false
) {
  const query = useQuery({
    queryKey: dashboardKeys.aggregate(range),
    queryFn: () => dashboardApi.getAggregateData(range),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    refetchInterval: enablePolling ? 30 * 1000 : false, // Poll every 30s if enabled
  });

  return query;
}
