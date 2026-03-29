/**
 * Nightlife Dashboard Hook
 * Fetches all nightlife dashboard data using React Query for caching and auto-refresh
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { logger } from '@vayva/shared';
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

const DEFAULT_DATA: NightlifeDashboardData = {
  metrics: {
    revenue: 0,
    revenueChange: 0,
    covers: 0,
    coversChange: 0,
    vipCount: 0,
    vipCountChange: 0,
    bottleSales: 0,
    bottleSalesChange: 0,
    occupancyRate: 0,
    occupancyChange: 0,
    waitTime: '0 min',
    walksCount: 0,
  },
  tables: [],
  vipGuests: [],
  bottleOrders: [],
  promoters: [],
  doorActivity: {
    entries: [],
    demographics: {
      gender: { male: 0, female: 0, other: 0 },
      ageGroups: { '21-25': 0, '26-30': 0, '31-35': 0, '35+': 0 },
    },
  },
  securityIncidents: [],
  reservations: [],
  bottleInventory: [],
};

export function useNightlifeDashboard() {
  const queryKey = QUERY_KEYS.nightlife.dashboard('default');
  
  const { data, isLoading, error, refetch, isFetching } = useQuery<NightlifeDashboardData, Error>({
    queryKey,
    queryFn: async () => {
      const response = await fetch('/nightlife/dashboard');
      if (!response.ok) {
        throw new Error(`Failed to fetch nightlife dashboard: ${response.statusText}`);
      }
      const result = await response.json();
      return result.data as NightlifeDashboardData || DEFAULT_DATA;
    },
    ...DEFAULT_QUERY_CONFIG,
    staleTime: 15 * 1000, // 15 seconds - nightlife data changes fast
    refetchInterval: 30 * 1000, // 30 seconds - frequent updates for real-time feel
  });

  return {
    data: data || DEFAULT_DATA,
    loading: isLoading,
    fetching: isFetching,
    error: error?.message || null,
    refetch,
  };
}
