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
 * 
 * Special handling for marketing demo mode:
 * - Detects demo user/business IDs (marketing-demo)
 * - Returns realistic pre-populated data for showcasing
 * - Maintains exact same UI/UX as production
 */
export function useRealTimeDashboard({
  industry,
  userId,
  businessId,
  enabled = true
}: UseRealTimeDashboardOptions) {
  // Detect marketing demo mode
  const isDemoMode = userId === 'marketing-demo' || businessId === 'marketing-demo';
  
  // Generate realistic demo data for marketing showcase
  const getDemoData = () => ({
    success: true,
    data: {
      kpis: [
        { key: "revenue", value: 2400000, change: 12.5, isPositive: true, format: "currency" as const },
        { key: "orders", value: 384, change: 8.2, isPositive: true, format: "number" as const },
        { key: "customers", value: 1247, change: 5.1, isPositive: true, format: "number" as const },
        { key: "conversion_rate", value: 3.8, change: -0.4, isPositive: false, format: "percentage" as const },
      ],
      metrics: {},
      overview: {
        title: "Retail Operations",
        subtitle: "Move the right inventory without stockouts or dead stock",
      },
      todosAlerts: [],
      activity: [],
      primaryObjects: {
        top_products: [
          { id: "1", name: "Ankara Print Maxi Dress", sold: 89, revenue: 445000, image: null },
          { id: "2", name: "Handwoven Aso-Oke Set", sold: 64, revenue: 384000, image: null },
          { id: "3", name: "Adire Silk Headwrap", sold: 52, revenue: 156000, image: null },
          { id: "4", name: "Beaded Statement Necklace", sold: 41, revenue: 123000, image: null },
        ],
        low_stock: [],
        dead_stock: [],
      },
      inventoryAlerts: [],
      customerInsights: {},
      earnings: {},
      storeInfo: {
        name: "Luxe Fashion",
        currency: "NGN",
      },
      charts: {
        revenue_trend: {
          labels: ["Mar 1", "Mar 5", "Mar 10", "Mar 15", "Mar 20", "Mar 25"],
          values: [180000, 220000, 195000, 320000, 275000, 240000],
        },
      },
      liveOperations: {
        pending_orders: { value: 12 },
        active_carts: { value: 27 },
        recent_signups: { value: 8 },
      },
    },
    timestamp: new Date().toISOString(),
  });

  // Fetch base dashboard data with industry-specific endpoint
  const { data: baseData, error: swrError, isLoading, mutate } = useSWR(
    enabled && !isDemoMode ? [`/dashboard/universal`, userId, businessId, industry] : null,
    async ([endpoint, uid, bid, ind]) => {
      const url = `${API_BASE_URL}${endpoint}?userId=${uid}&businessId=${bid}&industry=${ind}&range=month`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      return response.json();
    },
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      dedupingInterval: 5000,
      fallbackData: isDemoMode ? getDemoData() : undefined,
      revalidateOnFocus: !isDemoMode,
      revalidateOnReconnect: !isDemoMode,
      onError: (error) => {
        if (!isDemoMode) {
          toast.error(`Failed to load ${industry} dashboard: ${error.message}`);
        }
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
      toast.success('Connected to real-time updates');
    },
    onClose: () => {
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
    isError: !!swrError,
    error: swrError,
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