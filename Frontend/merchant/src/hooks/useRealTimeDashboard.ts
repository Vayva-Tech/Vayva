'use client';

import useSWR from 'swr';
import { useWebSocket } from './useWebSocket';
import { toast } from 'sonner';

interface RealTimeData {
  metrics: Record<string, any>;
  alerts: any[];
  actions: any[];
  notifications: any[];
  systemStatus: any;
}

interface UseRealTimeDashboardOptions {
  industry: string;
  userId: string;
  businessId: string;
  enabled?: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * useRealTimeDashboard - Consolidated hook for real-time dashboard data
 * Merges multiple API endpoints and adds WebSocket support
 */
export function useRealTimeDashboard({
  industry,
  userId,
  businessId,
  enabled = true
}: UseRealTimeDashboardOptions) {
  // Fetch base dashboard data with industry-specific endpoint
  const { data: baseData, error, isLoading, mutate } = useSWR(
    enabled ? [`/dashboard/universal`, userId, businessId, industry] : null,
    async ([endpoint, uid, bid, ind]) => {
      const url = `${API_BASE_URL}${endpoint}?userId=${uid}&businessId=${bid}&industry=${ind}&range=month`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      return response.json();
    },
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      dedupingInterval: 5000,
      onError: (error) => {
        toast.error(`Failed to load ${industry} dashboard: ${error.message}`);
      }
    }
  );

  // WebSocket connection for real-time updates
  const {
    isConnected: wsConnected,
    retryCount,
    sendMessage
  } = useWebSocket({
    url: `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'}/dashboard/${businessId}`,
    onMessage: (message) => {
      switch (message.type) {
        case 'METRIC_UPDATE':
          // Update specific metrics in cache
          mutate((current: any) => ({
            ...current,
            metrics: {
              ...current?.metrics,
              ...message.payload
            }
          }), { revalidate: false });
          break;
          
        case 'NEW_ALERT':
          // Add new alert
          mutate((current: any) => ({
            ...current,
            alerts: [message.payload, ...(current?.alerts || [])]
          }), { revalidate: false });
          toast.info(`New alert: ${message.payload.title}`);
          break;
          
        case 'ACTION_COMPLETED':
          // Update action status
          mutate((current: any) => ({
            ...current,
            actions: (current?.actions || []).map((action: any) =>
              action.id === message.payload.id 
                ? { ...action, completed: true, completedAt: new Date() }
                : action
            )
          }), { revalidate: false });
          break;
          
        case 'SYSTEM_STATUS_UPDATE':
          // Update system status
          mutate((current: any) => ({
            ...current,
            systemStatus: message.payload
          }), { revalidate: false });
          break;
      }
    },
    onOpen: () => {
      console.log('Real-time connection established');
      toast.success('Connected to real-time updates');
    },
    onClose: () => {
      console.log('Real-time connection closed');
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
      toast.error('Lost real-time connection');
    }
  });

  // Subscribe to specific data streams
  const subscribeToMetrics = (metricKeys: string[]) => {
    if (wsConnected) {
      sendMessage({
        type: 'SUBSCRIBE_METRICS',
        payload: { keys: metricKeys },
        timestamp: new Date().toISOString()
      });
    }
  };

  const subscribeToAlerts = () => {
    if (wsConnected) {
      sendMessage({
        type: 'SUBSCRIBE_ALERTS',
        payload: { severity: ['critical', 'warning'] },
        timestamp: new Date().toISOString()
      });
    }
  };

  // Trigger manual refresh
  const refresh = async () => {
    try {
      await mutate();
      toast.success('Dashboard refreshed');
    } catch (error) {
      toast.error('Failed to refresh dashboard');
    }
  };

  // Send user action
  const sendUserAction = (action: { type: string; payload: any }) => {
    if (wsConnected) {
      sendMessage({
        type: 'USER_ACTION',
        payload: action,
        timestamp: new Date().toISOString()
      });
    }
  };

  return {
    // Data
    data: baseData,
    metrics: baseData?.metrics || {},
    alerts: baseData?.alerts || [],
    actions: baseData?.actions || [],
    systemStatus: baseData?.systemStatus,
    
    // Connection status
    isLoading,
    isError: !!error,
    error,
    wsConnected,
    retryCount,
    
    // Methods
    refresh,
    mutate,
    subscribeToMetrics,
    subscribeToAlerts,
    sendUserAction
  };
}

// Helper hook for specific dashboard sections
export function useDashboardMetrics(data: any, keys: string[]) {
  return keys.map(key => ({
    key,
    value: data?.metrics?.[key]?.value ?? 0,
    change: data?.metrics?.[key]?.change ?? 0,
    isPositive: data?.metrics?.[key]?.isPositive ?? true,
    format: data?.metrics?.[key]?.format
  }));
}

export function useDashboardAlerts(data: any, severities: string[]) {
  return (data?.alerts || []).filter((alert: any) => 
    severities.includes(alert.severity)
  );
}

export function useDashboardActions(data: any, categories: string[]) {
  return (data?.actions || []).filter((action: any) => 
    categories.includes(action.category)
  );
}