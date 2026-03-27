/**
 * Healthcare Dashboard Data Hook
 */

import { useQuery } from '@tanstack/react-query';
import { logger } from '@vayva/shared';

export interface HealthcareDashboardData {
  todayStats: {
    totalAppointments: number;
    checkedIn: number;
    waiting: number;
    withProvider: number;
    completed: number;
    noShows: number;
  };
  appointments: Array<{
    id: string;
    patientName: string;
    provider: string;
    time: string;
    type: 'CHECKUP' | 'FOLLOW_UP' | 'CONSULTATION' | 'PROCEDURE';
    status: 'SCHEDULED' | 'CHECKED_IN' | 'IN_PROGRESS' | 'COMPLETED' | 'NO_SHOW';
  }>;
  patientQueue: Array<{
    id: string;
    patientName: string;
    checkInTime: string;
    waitTime: number; // minutes
    assignedRoom?: string;
    priority: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  }>;
  criticalAlerts: Array<{
    id: string;
    type: 'ALLERGY' | 'MEDICATION' | 'LAB_RESULT' | 'FOLLOW_UP';
    message: string;
    patientName: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    timestamp: string;
  }>;
  billingOverview: {
    dailyRevenue: number;
    pendingClaims: number;
    deniedClaims: number;
    outstandingBalance: number;
  };
  tasks: Array<{
    id: string;
    title: string;
    assignee: string;
    dueDate: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    completed: boolean;
  }>;
}

const DEFAULT_DATA: HealthcareDashboardData = {
  todayStats: {
    totalAppointments: 0,
    checkedIn: 0,
    waiting: 0,
    withProvider: 0,
    completed: 0,
    noShows: 0,
  },
  appointments: [],
  patientQueue: [],
  criticalAlerts: [],
  billingOverview: {
    dailyRevenue: 0,
    pendingClaims: 0,
    deniedClaims: 0,
    outstandingBalance: 0,
  },
  tasks: [],
};

export function useHealthcareDashboard() {
  const query = useQuery({
    queryKey: ['healthcare-dashboard'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/healthcare/dashboard', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(30000),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result.data as HealthcareDashboardData;
      } catch (error) {
        logger.error('[HEALTHCARE_DASHBOARD] Fetch failed:', { error });
        return DEFAULT_DATA;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 10000),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    ...query,
    data: query.data || DEFAULT_DATA,
  };
}
