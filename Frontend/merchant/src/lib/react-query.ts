/**
 * Core React Query setup for merchant dashboards
 * Provides standardized query client, hooks, and patterns
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

/**
 * Default query configuration for dashboard data
 * - Stale time: 30 seconds (data is fresh for 30s)
 * - Refetch interval: 60 seconds (auto-refresh every minute)
 * - Retry: 2 attempts with exponential backoff
 * - GC time: 5 minutes (keep unused data in cache)
 */
export const DEFAULT_QUERY_CONFIG = {
  staleTime: 30 * 1000, // 30 seconds
  refetchInterval: 60 * 1000, // 60 seconds
  retry: 2,
  retryDelay: (attemptIndex: number) => Math.min(1000 * Math.pow(2, attemptIndex), 10000),
  gcTime: 5 * 60 * 1000, // 5 minutes
};

/**
 * Create a configured QueryClient instance
 */
export function createDashboardQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        ...DEFAULT_QUERY_CONFIG,
        refetchOnWindowFocus: false, // Don't refocus when switching tabs
        refetchOnReconnect: true, // Refetch when reconnecting
      },
    },
  });
}

/**
 * Query key factory for consistent cache keys
 */
export const QUERY_KEYS = {
  // Universal dashboard
  universalDashboard: (industry: string, variant: string, businessId: string) => 
    ['dashboard', 'universal', industry, variant, businessId] as const,
  
  // Industry-specific dashboards
  grocery: {
    dashboard: (businessId: string) => ['dashboard', 'grocery', businessId] as const,
    promotions: (businessId: string) => ['dashboard', 'grocery', 'promotions', businessId] as const,
    inventory: (businessId: string) => ['dashboard', 'grocery', 'inventory', businessId] as const,
    suppliers: (businessId: string) => ['dashboard', 'grocery', 'suppliers', businessId] as const,
  },
  
  nightlife: {
    dashboard: (businessId: string) => ['dashboard', 'nightlife', businessId] as const,
    reservations: (businessId: string) => ['dashboard', 'nightlife', 'reservations', businessId] as const,
    vip: (businessId: string) => ['dashboard', 'nightlife', 'vip', businessId] as const,
    bottleService: (businessId: string) => ['dashboard', 'nightlife', 'bottle-service', businessId] as const,
  },
  
  nonprofit: {
    dashboard: (businessId: string) => ['dashboard', 'nonprofit', businessId] as const,
    donations: (businessId: string) => ['dashboard', 'nonprofit', 'donations', businessId] as const,
    campaigns: (businessId: string) => ['dashboard', 'nonprofit', 'campaigns', businessId] as const,
    grants: (businessId: string) => ['dashboard', 'nonprofit', 'grants', businessId] as const,
  },
  
  healthcare: {
    dashboard: (businessId: string) => ['dashboard', 'healthcare', businessId] as const,
    patients: (businessId: string) => ['dashboard', 'healthcare', 'patients', businessId] as const,
    appointments: (businessId: string) => ['dashboard', 'healthcare', 'appointments', businessId] as const,
  },
  
  legal: {
    dashboard: (businessId: string) => ['dashboard', 'legal', businessId] as const,
    trust: (businessId: string) => ['dashboard', 'legal', 'trust', businessId] as const,
    matters: (businessId: string) => ['dashboard', 'legal', 'matters', businessId] as const,
  },
  
  fashion: {
    dashboard: (businessId: string) => ['dashboard', 'fashion', businessId] as const,
    inventory: (businessId: string) => ['dashboard', 'fashion', 'inventory', businessId] as const,
    orders: (businessId: string) => ['dashboard', 'fashion', 'orders', businessId] as const,
  },
  
  beauty: {
    dashboard: (businessId: string) => ['dashboard', 'beauty', businessId] as const,
    appointments: (businessId: string) => ['dashboard', 'beauty', 'appointments', businessId] as const,
    staff: (businessId: string) => ['dashboard', 'beauty', 'staff', businessId] as const,
  },
  
  restaurant: {
    dashboard: (businessId: string) => ['dashboard', 'restaurant', businessId] as const,
    orders: (businessId: string) => ['dashboard', 'restaurant', 'orders', businessId] as const,
    reservations: (businessId: string) => ['dashboard', 'restaurant', 'reservations', businessId] as const,
  },
  
  professional: {
    dashboard: (businessId: string) => ['dashboard', 'professional', businessId] as const,
    projects: (businessId: string) => ['dashboard', 'professional', 'projects', businessId] as const,
    clients: (businessId: string) => ['dashboard', 'professional', 'clients', businessId] as const,
  },
  
  creative: {
    dashboard: (businessId: string) => ['dashboard', 'creative', businessId] as const,
    projects: (businessId: string) => ['dashboard', 'creative', 'projects', businessId] as const,
  },
};

// Re-export for convenience
export { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
