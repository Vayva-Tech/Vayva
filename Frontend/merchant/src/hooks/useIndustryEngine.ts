/**
 * Hook to use industry engine data
 * Provides real-time data from industry-specific services
 */

import useSWR from 'swr';
import type { IndustrySlug } from '@/lib/templates/types';

const fetcher = <T,>(url: string) => fetch(url).then(res => res.json());

export function useIndustryEngine(industrySlug?: IndustrySlug) {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    data: {
      industry: IndustrySlug;
      displayName: string;
      engineData: any;
      features: any;
    };
  }>(
    industrySlug ? `/api/dashboard/industry-engine?industry=${industrySlug}` : null,
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: false,
    }
  );

  return {
    engineData: data?.data?.engineData,
    industryDisplayName: data?.data?.displayName,
    features: data?.data?.features,
    hasEngine: !!data?.data?.engineData?.hasNativeEngine,
    isLoading,
    isError: error,
    mutate,
  };
}
