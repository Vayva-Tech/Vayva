/**
 * Hook to check trial status
 */

import { useQuery } from '@tanstack/react-query';

interface TrialStatus {
  isActive: boolean;
  daysRemaining: number;
  startDate: Date | null;
  endDate: Date | null;
  expired: boolean;
}

export function useTrialStatus() {
  const { data, isLoading, error } = useQuery<TrialStatus>({
    queryKey: ['trial', 'status'],
    queryFn: async () => {
      const res = await fetch('/trial/status');
      if (!res.ok) throw new Error('Failed to fetch trial status');
      return res.json();
    },
    refetchInterval: 3600000, // Check every hour
  });

  return {
    isActive: data?.isActive ?? false,
    daysRemaining: data?.daysRemaining ?? 0,
    startDate: data?.startDate,
    endDate: data?.endDate,
    expired: data?.expired ?? true,
    isLoading,
    error,
  };
}
