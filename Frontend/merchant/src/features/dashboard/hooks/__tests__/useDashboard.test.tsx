/**
 * Dashboard Hooks Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { dashboardApi } from '../../api/dashboard.api';
import { useDashboardAggregate, useDashboardKpis, useDashboardAlerts } from '../useDashboard';

// Mock API client
vi.mock('../../api/dashboard.api', () => ({
  dashboardApi: {
    getAggregateData: vi.fn(),
    getKpis: vi.fn(),
    getAlerts: vi.fn(),
    getActions: vi.fn(),
    getTrends: vi.fn(),
    refreshCache: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Dashboard Hooks', () => {
  describe('useDashboardAggregate', () => {
    it('fetches aggregate data successfully', async () => {
      const mockData = {
        kpiData: { revenue: 1000, orders: 50 },
        metricsData: {},
        storeInfo: { industrySlug: 'retail' },
      };
      
      vi.mocked(dashboardApi.getAggregateData).mockResolvedValue(mockData);
      
      const { result } = renderHook(
        () => useDashboardAggregate('month'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      
      expect(result.current.data).toEqual(mockData);
      expect(dashboardApi.getAggregateData).toHaveBeenCalledWith('month');
    });

    it('handles fetch error', async () => {
      vi.mocked(dashboardApi.getAggregateData).mockRejectedValue(new Error('Failed to fetch'));
      
      const { result } = renderHook(
        () => useDashboardAggregate('month'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isError).toBe(true));
      
      expect(result.current.error?.message).toBe('Failed to fetch');
    });
  });

  describe('useDashboardKpis', () => {
    it('fetches KPI data successfully', async () => {
      const mockKpis = { revenue: 5000, orders: 100, customers: 250 };
      
      vi.mocked(dashboardApi.getKpis).mockResolvedValue(mockKpis);
      
      const { result } = renderHook(
        () => useDashboardKpis(),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      
      expect(result.current.data).toEqual(mockKpis);
    });
  });

  describe('useDashboardAlerts', () => {
    it('fetches alerts successfully', async () => {
      const mockAlerts = { 
        alerts: [
          { id: '1', type: 'warning', title: 'Test Alert', message: 'Test message' }
        ] 
      };
      
      vi.mocked(dashboardApi.getAlerts).mockResolvedValue(mockAlerts);
      
      const { result } = renderHook(
        () => useDashboardAlerts(),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      
      expect(result.current.data?.alerts).toHaveLength(1);
    });
  });
});
