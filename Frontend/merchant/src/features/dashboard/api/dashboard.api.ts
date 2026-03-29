/**
 * Dashboard API Client
 * 
 * Centralized API client for all dashboard endpoints
 */

import { apiClient } from '@/lib/api-client';
import type {
  ApiResponse,
  DashboardAggregateData,
  DashboardKpis,
  DashboardAlerts,
  DashboardActions,
  DashboardTrends,
  DashboardMetrics,
  DashboardRefreshResponse,
} from './types';

export const dashboardApi = {
  /**
   * Fetch all dashboard data in one call
   */
  async getAggregateData(range: 'today' | 'week' | 'month' = 'month'): Promise<DashboardAggregateData> {
    const response = await apiClient.get<ApiResponse<DashboardAggregateData>>('/dashboard/aggregate', {
      params: { range },
    });
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch dashboard data');
    }
    
    return response.data.data;
  },

  /**
   * Fetch KPIs only
   */
  async getKpis(): Promise<DashboardKpis> {
    const response = await apiClient.get<ApiResponse<DashboardKpis>>('/dashboard/kpis');
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch KPIs');
    }
    
    return response.data.data;
  },

  /**
   * Fetch active alerts
   */
  async getAlerts(): Promise<DashboardAlerts> {
    const response = await apiClient.get<ApiResponse<DashboardAlerts>>('/dashboard/alerts');
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch alerts');
    }
    
    return response.data.data;
  },

  /**
   * Fetch suggested actions
   */
  async getActions(): Promise<DashboardActions> {
    const response = await apiClient.get<ApiResponse<DashboardActions>>('/dashboard/actions');
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch actions');
    }
    
    return response.data.data;
  },

  /**
   * Fetch trend data for a specific metric
   */
  async getTrends(
    metric: string,
    period: '7d' | '30d' | '90d' = '30d'
  ): Promise<DashboardTrends> {
    const response = await apiClient.get<ApiResponse<DashboardTrends>>(
      `/dashboard/trends/${metric}`,
      {
        params: { period },
      }
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch trends');
    }
    
    return response.data.data;
  },

  /**
   * Fetch metrics only (legacy endpoint)
   */
  async getMetrics(): Promise<DashboardMetrics> {
    const response = await apiClient.get<ApiResponse<DashboardMetrics>>('/dashboard/metrics');
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch metrics');
    }
    
    return response.data.data;
  },

  /**
   * Force refresh dashboard cache
   */
  async refreshCache(): Promise<DashboardRefreshResponse> {
    const response = await apiClient.post<ApiResponse<DashboardRefreshResponse>>(
      '/dashboard/refresh'
    );
    
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to refresh cache');
    }
    
    return response.data;
  },
};
