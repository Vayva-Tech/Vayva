interface UseRealTimeDashboardOptions {
    industry: string;
    userId: string;
    businessId: string;
    enabled?: boolean;
}
/**
 * useRealTimeDashboard - Consolidated hook for real-time dashboard data
 * Merges multiple API endpoints and adds WebSocket support
 */
export declare function useRealTimeDashboard({ industry, userId, businessId, enabled }: UseRealTimeDashboardOptions): {
    data: unknown;
    metrics: unknown;
    alerts: unknown;
    actions: unknown;
    systemStatus: unknown;
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    wsConnected: boolean;
    retryCount: number;
    refresh: () => Promise<void>;
    mutate: import("swr").KeyedMutator<any>;
    subscribeToMetrics: (metricKeys: string[]) => void;
    subscribeToAlerts: () => void;
    sendUserAction: (action: {
        type: string;
        payload: unknown;
    }) => void;
};
export declare function useDashboardMetrics(data: unknown, keys: string[]): {
    key: string;
    value: unknown;
    change: unknown;
    isPositive: unknown;
    format: unknown;
}[];
export declare function useDashboardAlerts(data: unknown, severities: string[]): unknown;
export declare function useDashboardActions(data: unknown, categories: string[]): unknown;
export {};
