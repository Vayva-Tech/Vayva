'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from './use-saas-react-query';
import type { AggregateMetrics } from '@/types/saas-dashboard';

interface WebSocketMessage {
  type: 'metrics_update' | 'churn_alert' | 'feature_release' | 'usage_spike';
  payload: any;
  timestamp: string;
}

/**
 * Hook for handling real-time metric updates via WebSocket
 * Invalidates React Query cache when real-time updates are received
 */
export function useRealTimeMetrics() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Listen for custom events dispatched by WebSocket provider
    const handleMetricsUpdate = (event: CustomEvent<WebSocketMessage>) => {
      const { type, payload } = event.detail;

      switch (type) {
        case 'metrics_update':
          // Update aggregate metrics in cache
          queryClient.setQueryData(QUERY_KEYS.saas.aggregate, (old: AggregateMetrics | undefined) => {
            if (!old) return old;
            return {
              ...old,
              ...payload,
            };
          });
          break;

        case 'churn_alert':
          // Invalidate churn risk data
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.saas.churnRisk });
          break;

        case 'feature_release':
          // Invalidate feature flags
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.saas.features });
          break;

        case 'usage_spike':
          // Invalidate usage analytics
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.saas.usage });
          break;

        default:
          console.warn('Unknown message type:', type);
      }
    };

    // Add event listener
    window.addEventListener('saas-metrics-update', handleMetricsUpdate as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('saas-metrics-update', handleMetricsUpdate as EventListener);
    };
  }, [queryClient]);

  return null;
}
