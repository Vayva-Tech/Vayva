'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

interface RetailOrderRecord {
  id?: string;
  productId?: string;
  [key: string]: unknown;
}

interface RetailInventoryRecord {
  productId?: string;
  [key: string]: unknown;
}

interface RetailTransferRecord {
  id?: string;
  [key: string]: unknown;
}

interface DashboardData {
  orders?: RetailOrderRecord[];
  inventory?: RetailInventoryRecord[];
  transfers?: RetailTransferRecord[];
}

interface UseRetailRealtimeOptions {
  storeId: string;
  enabled?: boolean;
  onOrderUpdate?: (order: RetailOrderRecord) => void;
  onInventoryUpdate?: (inventory: RetailInventoryRecord) => void;
  onTransferUpdate?: (transfer: RetailTransferRecord) => void;
}

interface RetailChannelMessage {
  channel?: string;
  data?: unknown;
}

function isRetailChannelMessage(value: unknown): value is RetailChannelMessage {
  return typeof value === 'object' && value !== null;
}

export function useRetailRealtime({
  storeId,
  enabled = true,
  onOrderUpdate,
  onInventoryUpdate,
  onTransferUpdate,
}: UseRetailRealtimeOptions) {
  const [data, setData] = useState<DashboardData>({});
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const onOrderUpdateRef = useRef(onOrderUpdate);
  const onInventoryUpdateRef = useRef(onInventoryUpdate);
  const onTransferUpdateRef = useRef(onTransferUpdate);

  useEffect(() => {
    onOrderUpdateRef.current = onOrderUpdate;
    onInventoryUpdateRef.current = onInventoryUpdate;
    onTransferUpdateRef.current = onTransferUpdate;
  }, [onOrderUpdate, onInventoryUpdate, onTransferUpdate]);

  const sendPayload = useCallback(
    (payload: Record<string, unknown>) => {
      const ws = wsRef.current;
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(payload));
      }
    },
    []
  );

  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !storeId) {
      setIsConnected(false);
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
    let ws: WebSocket;
    try {
      ws = new WebSocket(baseUrl, ['retail-dashboard']);
    } catch {
      setIsConnected(false);
      return;
    }
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      sendPayload({ type: 'subscribe', channel: `store:${storeId}:orders` });
      sendPayload({ type: 'subscribe', channel: `store:${storeId}:inventory` });
      sendPayload({ type: 'subscribe', channel: `store:${storeId}:transfers` });
    };

    ws.onclose = () => {
      setIsConnected(false);
      wsRef.current = null;
    };

    ws.onerror = () => {
      setIsConnected(false);
    };

    ws.onmessage = (event) => {
      try {
        const parsed: unknown = JSON.parse(String(event.data));
        if (!isRetailChannelMessage(parsed)) return;

        const { channel, data: payload } = parsed;
        if (typeof channel !== 'string') return;

        if (channel === `store:${storeId}:orders` && payload !== undefined) {
          const order = payload as RetailOrderRecord;
          setData((prev) => ({
            ...prev,
            orders: [...(prev.orders || []), order],
          }));
          onOrderUpdateRef.current?.(order);
        } else if (channel === `store:${storeId}:inventory` && payload !== undefined) {
          const inventory = payload as RetailInventoryRecord;
          setData((prev) => {
            const existingIndex = prev.inventory?.findIndex(
              (item) => item.productId === inventory.productId
            );

            if (existingIndex !== undefined && existingIndex >= 0 && prev.inventory) {
              const updated = [...prev.inventory];
              updated[existingIndex] = inventory;
              return { ...prev, inventory: updated };
            }

            return {
              ...prev,
              inventory: [...(prev.inventory || []), inventory],
            };
          });
          onInventoryUpdateRef.current?.(inventory);
        } else if (channel === `store:${storeId}:transfers` && payload !== undefined) {
          const transfer = payload as RetailTransferRecord;
          setData((prev) => {
            const existingIndex = prev.transfers?.findIndex((t) => t.id === transfer.id);

            if (existingIndex !== undefined && existingIndex >= 0 && prev.transfers) {
              const updated = [...prev.transfers];
              updated[existingIndex] = transfer;
              return { ...prev, transfers: updated };
            }

            return {
              ...prev,
              transfers: [...(prev.transfers || []), transfer],
            };
          });
          onTransferUpdateRef.current?.(transfer);
        }
      } catch (error) {
        console.error('Error processing realtime message:', error);
      }
    };

    return () => {
      sendPayload({ type: 'unsubscribe', channel: `store:${storeId}:orders` });
      sendPayload({ type: 'unsubscribe', channel: `store:${storeId}:inventory` });
      sendPayload({ type: 'unsubscribe', channel: `store:${storeId}:transfers` });
      ws.close();
      wsRef.current = null;
      setIsConnected(false);
    };
  }, [enabled, storeId, sendPayload]);

  return {
    data,
    isConnected,
    isConnecting: !isConnected && enabled,
    error: null,
    refresh: () => {
      sendPayload({
        type: 'refresh',
        storeId,
      });
    },
  };
}
