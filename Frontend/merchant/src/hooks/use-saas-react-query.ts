'use client';

import { useQuery } from '@tanstack/react-query';
import type { AggregateMetrics } from '@/types/saas-dashboard';

const QUERY_KEYS = {
  saas: {
    aggregate: ['saas', 'aggregate'] as const,
    subscriptions: ['saas', 'subscriptions'] as const,
    tenantGrowth: ['saas', 'tenantGrowth'] as const,
    churnRisk: ['saas', 'churnRisk'] as const,
    features: ['saas', 'features'] as const,
    usage: ['saas', 'usage'] as const,
  },
};

/**
 * Hook for fetching aggregate dashboard metrics with React Query caching
 */
export function useAggregateMetrics() {
  const { data, isLoading, error, refetch, isFetching } = useQuery<AggregateMetrics, Error>({
    queryKey: QUERY_KEYS.saas.aggregate,
    queryFn: async () => {
      const response = await fetch('/saas/dashboard/aggregate');
      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.statusText}`);
      }
      const result = await response.json();
      return result.metrics;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute for real-time feel
    retry: 2,
  });

  return {
    data: data || null,
    loading: isLoading,
    fetching: isFetching,
    error: error?.message || null,
    refetch,
  };
}

/**
 * Hook for fetching subscription metrics
 */
export function useSubscriptionMetrics() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.saas.subscriptions,
    queryFn: async () => {
      const response = await fetch('/saas/subscriptions/metrics');
      if (!response.ok) throw new Error('Failed to fetch subscription metrics');
      const result = await response.json();
      return result.metrics;
    },
    staleTime: 30 * 1000,
    retry: 1,
  });

  return {
    data: data || null,
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
}

/**
 * Hook for fetching tenant growth data
 */
export function useTenantGrowth() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.saas.tenantGrowth,
    queryFn: async () => {
      const response = await fetch('/saas/tenants/growth');
      if (!response.ok) throw new Error('Failed to fetch tenant growth');
      const result = await response.json();
      return result.metrics;
    },
    staleTime: 60 * 1000,
    retry: 1,
  });

  return {
    data: data || null,
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
}

/**
 * Hook for fetching churn risk analysis
 */
export function useChurnRisk() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.saas.churnRisk,
    queryFn: async () => {
      const response = await fetch('/saas/churn/risk-score');
      if (!response.ok) throw new Error('Failed to fetch churn risk');
      const result = await response.json();
      return result.risks;
    },
    staleTime: 60 * 1000,
    retry: 1,
  });

  return {
    data: data || null,
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
}

/**
 * Hook for fetching feature flags
 */
export function useFeatureFlags() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.saas.features,
    queryFn: async () => {
      const response = await fetch('/saas/features');
      if (!response.ok) throw new Error('Failed to fetch feature flags');
      const result = await response.json();
      return result.flags;
    },
    staleTime: 120 * 1000, // 2 minutes - features don't change often
    retry: 1,
  });

  return {
    data: data || null,
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
}

/**
 * Hook for fetching usage analytics
 */
export function useUsageAnalytics() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.saas.usage,
    queryFn: async () => {
      const response = await fetch('/saas/usage/metrics');
      if (!response.ok) throw new Error('Failed to fetch usage analytics');
      const result = await response.json();
      return result.metrics;
    },
    staleTime: 30 * 1000,
    retry: 1,
  });

  return {
    data: data || null,
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
}

export { QUERY_KEYS };
