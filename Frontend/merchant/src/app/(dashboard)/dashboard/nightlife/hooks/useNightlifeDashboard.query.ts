/**
 * Standardized React Query hooks for Nightlife Dashboard
 * Real-time data fetching with caching and auto-refresh
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import type {
  NightlifeMetrics,
  NightlifeTable,
  VIPGuest,
  BottleOrder,
  PromoterSale,
  SecurityIncident,
  DoorEntry,
  DemographicsBreakdown,
  TableReservation,
} from '@vayva/industry-nightlife/types';
import { QUERY_KEYS, DEFAULT_QUERY_CONFIG } from '@/lib/react-query';

interface NightlifeDashboardData {
  metrics: NightlifeMetrics;
  tables: NightlifeTable[];
  vipGuests: VIPGuest[];
  bottleOrders: BottleOrder[];
  promoters: PromoterSale[];
  doorActivity: { entries: DoorEntry[]; demographics: DemographicsBreakdown };
  securityIncidents: SecurityIncident[];
  reservations: TableReservation[];
  bottleInventory: Array<{ name: string; quantity: number; status: 'low' | 'ok' | 'critical' }>;
}

/**
 * Main hook for fetching complete nightlife dashboard data
 * Optimized for real-time updates with 30-second refresh
 */
export function useNightlifeDashboard(businessId: string) {
  const queryKey = QUERY_KEYS.nightlife.dashboard(businessId);
  
  const { data, isLoading, error, refetch, isFetching, isError } = useQuery<NightlifeDashboardData, Error>({
    queryKey,
    queryFn: async () => {
      const response = await fetch('/api/nightlife/dashboard');
      if (!response.ok) {
        throw new Error(`Failed to fetch nightlife dashboard: ${response.statusText}`);
      }
      const result = await response.json();
      return result.data as NightlifeDashboardData;
    },
    ...DEFAULT_QUERY_CONFIG,
    staleTime: 15 * 1000, // 15 seconds - nightlife data changes fast
    refetchInterval: 30 * 1000, // 30 seconds - frequent updates for real-time feel
    enabled: !!businessId,
  });

  return {
    data: data || null,
    loading: isLoading,
    fetching: isFetching,
    error: error?.message || null,
    isError,
    refetch,
  };
}

/**
 * Hook for fetching table reservations only
 */
export function useNightlifeReservations(businessId: string) {
  const queryKey = QUERY_KEYS.nightlife.reservations(businessId);
  
  const { data, isLoading, error, refetch } = useQuery<{
    tables: NightlifeTable[];
    reservations: TableReservation[];
  }, Error>({
    queryKey,
    queryFn: async () => {
      const response = await fetch(`/api/nightlife/reservations?businessId=${businessId}`);
      if (!response.ok) throw new Error('Failed to fetch reservations');
      return response.json();
    },
    ...DEFAULT_QUERY_CONFIG,
    enabled: !!businessId,
  });

  return {
    data: data || null,
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
}

/**
 * Hook for fetching VIP guest list
 */
export function useNightlifeVIP(businessId: string) {
  const queryKey = QUERY_KEYS.nightlife.vip(businessId);
  
  const { data, isLoading, error, refetch } = useQuery<{
    vipGuests: VIPGuest[];
  }, Error>({
    queryKey,
    queryFn: async () => {
      const response = await fetch(`/api/nightlife/vip?businessId=${businessId}`);
      if (!response.ok) throw new Error('Failed to fetch VIP guests');
      return response.json();
    },
    ...DEFAULT_QUERY_CONFIG,
    enabled: !!businessId,
  });

  return {
    data: data || null,
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
}

/**
 * Hook for fetching bottle service data
 */
export function useNightlifeBottleService(businessId: string) {
  const queryKey = QUERY_KEYS.nightlife.bottleService(businessId);
  
  const { data, isLoading, error, refetch } = useQuery<{
    bottleOrders: BottleOrder[];
    bottleInventory: Array<{ name: string; quantity: number; status: 'low' | 'ok' | 'critical' }>;
  }, Error>({
    queryKey,
    queryFn: async () => {
      const response = await fetch(`/api/nightlife/bottle-service?businessId=${businessId}`);
      if (!response.ok) throw new Error('Failed to fetch bottle service data');
      return response.json();
    },
    ...DEFAULT_QUERY_CONFIG,
    enabled: !!businessId,
  });

  return {
    data: data || null,
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
}
