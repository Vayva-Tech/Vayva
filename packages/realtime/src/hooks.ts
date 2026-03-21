/**
 * React Hooks for Live Dashboard
 * Client-side hooks for connecting to real-time updates
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
    DashboardEvent,
    DashboardEventType,
    LiveMetrics,
    OrderEventData,
    PaymentEventData,
    AIConversationEventData,
    ConversationEventData,
} from './types';

interface UseLiveDashboardOptions {
    storeId: string;
    events?: DashboardEventType[];
    onEvent?: (event: DashboardEvent) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
}

interface UseLiveDashboardReturn {
    isConnected: boolean;
    isConnecting: boolean;
    error: Error | null;
    metrics: LiveMetrics | null;
    reconnect: () => void;
}

/**
 * Main hook for connecting to the live dashboard WebSocket
 */
export function useLiveDashboard(options: UseLiveDashboardOptions): UseLiveDashboardReturn {
    const {
        storeId,
        events = Object.values(DashboardEventType),
        onEvent,
        onConnect,
        onDisconnect,
        reconnectInterval = 5000,
        maxReconnectAttempts = 10,
    } = options;

    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [metrics, setMetrics] = useState<LiveMetrics | null>(null);

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            return;
        }

        setIsConnecting(true);
        setError(null);

        const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/v1/live`;

        try {
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                setIsConnected(true);
                setIsConnecting(false);
                setError(null);
                reconnectAttemptsRef.current = 0;

                // Subscribe to events
                ws.send(JSON.stringify({
                    action: 'subscribe',
                    storeId,
                    events,
                }));

                onConnect?.();
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);

                    if (message.type === 'event') {
                        onEvent?.(message.data);
                    } else if (message.type === 'initial') {
                        setMetrics(message.data);
                    }
                } catch (err) {
                    console.error('Error parsing WebSocket message:', err);
                }
            };

            ws.onclose = () => {
                setIsConnected(false);
                onDisconnect?.();

                // Attempt reconnection
                if (reconnectAttemptsRef.current < maxReconnectAttempts) {
                    reconnectAttemptsRef.current++;
                    reconnectTimerRef.current = setTimeout(() => {
                        connect();
                    }, reconnectInterval * reconnectAttemptsRef.current);
                }
            };

            ws.onerror = (err) => {
                setError(new Error('WebSocket connection error'));
                setIsConnecting(false);
            };
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to connect'));
            setIsConnecting(false);
        }
    }, [storeId, events, onEvent, onConnect, onDisconnect, reconnectInterval, maxReconnectAttempts]);

    const disconnect = useCallback(() => {
        if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
        }
        wsRef.current?.close();
        wsRef.current = null;
    }, []);

    const reconnect = useCallback(() => {
        disconnect();
        reconnectAttemptsRef.current = 0;
        connect();
    }, [disconnect, connect]);

    useEffect(() => {
        connect();

        return () => {
            disconnect();
        };
    }, [connect, disconnect]);

    return {
        isConnected,
        isConnecting,
        error,
        metrics,
        reconnect,
    };
}

/**
 * Hook for live order feed
 */
export function useLiveOrders(storeId: string) {
    const [orders, setOrders] = useState<OrderEventData[]>([]);
    const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());

    const handleEvent = useCallback((event: DashboardEvent) => {
        if (event.type === DashboardEventType.ORDER_CREATED) {
            const orderData = event.data as unknown as OrderEventData;
            setOrders((prev) => [orderData, ...prev].slice(0, 50)); // Keep last 50
            setNewOrderIds((prev) => new Set(prev).add(orderData.orderId));

            // Clear "new" status after 5 seconds
            setTimeout(() => {
                setNewOrderIds((prev) => {
                    const next = new Set(prev);
                    next.delete(orderData.orderId);
                    return next;
                });
            }, 5000);
        }
    }, []);

    const { isConnected, error } = useLiveDashboard({
        storeId,
        events: [DashboardEventType.ORDER_CREATED, DashboardEventType.ORDER_PAID],
        onEvent: handleEvent,
    });

    return {
        orders,
        newOrderIds,
        isConnected,
        error,
    };
}

/**
 * Hook for live payment updates
 */
export function useLivePayments(storeId: string) {
    const [payments, setPayments] = useState<PaymentEventData[]>([]);
    const [totalRevenue, setTotalRevenue] = useState(0);

    const handleEvent = useCallback((event: DashboardEvent) => {
        if (event.type === DashboardEventType.PAYMENT_RECEIVED) {
            const paymentData = event.data as unknown as PaymentEventData;
            setPayments((prev) => [paymentData, ...prev].slice(0, 20));
            setTotalRevenue((prev) => prev + paymentData.amount);
        }
    }, []);

    const { isConnected, error } = useLiveDashboard({
        storeId,
        events: [DashboardEventType.PAYMENT_RECEIVED],
        onEvent: handleEvent,
    });

    return {
        payments,
        totalRevenue,
        isConnected,
        error,
    };
}

/**
 * Hook for live AI conversation monitoring
 */
export function useLiveConversations(storeId: string) {
    const [conversations, setConversations] = useState<AIConversationEventData[]>([]);
    const [activeCount, setActiveCount] = useState(0);
    const [totalSales, setTotalSales] = useState(0);

    const handleEvent = useCallback((event: DashboardEvent) => {
        switch (event.type) {
            case DashboardEventType.AI_CONVERSATION_STARTED:
                setActiveCount((prev) => prev + 1);
                break;

            case DashboardEventType.AI_CONVERSATION_COMPLETED: {
                const convData = event.data as unknown as AIConversationEventData;
                setConversations((prev) => [convData, ...prev].slice(0, 30));
                setActiveCount((prev) => Math.max(0, prev - 1));
                const saleValue = convData.saleValue;
                if (typeof saleValue === 'number') {
                    setTotalSales((prev) => prev + saleValue);
                }
                break;
            }

            case DashboardEventType.CONVERSATION_STARTED:
                setActiveCount((prev) => prev + 1);
                break;

            case DashboardEventType.CONVERSATION_ENDED:
                setActiveCount((prev) => Math.max(0, prev - 1));
                break;
        }
    }, []);

    const { isConnected, error } = useLiveDashboard({
        storeId,
        events: [
            DashboardEventType.AI_CONVERSATION_STARTED,
            DashboardEventType.AI_CONVERSATION_COMPLETED,
            DashboardEventType.CONVERSATION_STARTED,
            DashboardEventType.CONVERSATION_ENDED,
        ],
        onEvent: handleEvent,
    });

    return {
        conversations,
        activeCount,
        totalSales,
        isConnected,
        error,
    };
}

/**
 * Hook for live metrics dashboard
 */
export function useLiveMetrics(storeId: string) {
    const [metrics, setMetrics] = useState<LiveMetrics | null>(null);

    const handleEvent = useCallback((event: DashboardEvent) => {
        if (event.type === DashboardEventType.METRICS_UPDATE) {
            setMetrics(event.data as unknown as LiveMetrics);
        }
    }, []);

    const { isConnected, error, reconnect } = useLiveDashboard({
        storeId,
        events: [DashboardEventType.METRICS_UPDATE],
        onEvent: handleEvent,
    });

    return {
        metrics,
        isConnected,
        error,
        reconnect,
    };
}
