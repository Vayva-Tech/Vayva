/**
 * SaaS Dashboard Data Hooks
 * React hooks for fetching and managing dashboard data
 */

import { useState, useEffect } from 'react';
import type {
  AggregateMetrics,
  SubscriptionMetrics,
  TenantGrowthMetrics,
  ChurnRiskResponse,
  FeatureFlagsResponse,
  UsageAnalytics,
} from '@/types/saas-dashboard';

export function useAggregateMetrics() {
  const [data, setData] = useState<AggregateMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/saas/dashboard/aggregate');
        if (!response.ok) throw new Error('Failed to fetch metrics');
        const result = await response.json();
        setData(result.metrics);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return { data, loading, error };
}

export function useSubscriptionMetrics() {
  const [data, setData] = useState<SubscriptionMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/saas/subscriptions/metrics');
        if (!response.ok) throw new Error('Failed to fetch subscription metrics');
        const result = await response.json();
        setData(result.metrics);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return { data, loading, error };
}

export function useTenantGrowth() {
  const [data, setData] = useState<TenantGrowthMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGrowth = async () => {
      try {
        const response = await fetch('/saas/tenants/growth');
        if (!response.ok) throw new Error('Failed to fetch tenant growth');
        const result = await response.json();
        setData(result.metrics);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchGrowth();
  }, []);

  return { data, loading, error };
}

export function useChurnRisk() {
  const [data, setData] = useState<ChurnRiskResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChurn = async () => {
      try {
        const response = await fetch('/saas/churn/risk-score');
        if (!response.ok) throw new Error('Failed to fetch churn risk');
        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchChurn();
  }, []);

  return { data, loading, error };
}

export function useFeatureFlags() {
  const [data, setData] = useState<FeatureFlagsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await fetch('/saas/features');
        if (!response.ok) throw new Error('Failed to fetch feature flags');
        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchFeatures();
  }, []);

  return { data, loading, error };
}

export function useUsageAnalytics() {
  const [data, setData] = useState<UsageAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const response = await fetch('/saas/usage/metrics');
        if (!response.ok) throw new Error('Failed to fetch usage analytics');
        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
  }, []);

  return { data, loading, error };
}
