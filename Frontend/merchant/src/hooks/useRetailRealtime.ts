// @ts-nocheck
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

interface DashboardData {
  orders?: any[];
  inventory?: any[];
  transfers?: any[];
  [key: string]: any;
}

interface UseRetailRealtimeOptions {
  storeId: string;
  enabled?: boolean;
  onOrderUpdate?: (order: any) => void;
  onInventoryUpdate?: (inventory: any) => void;
  onTransferUpdate?: (transfer: any) => void;
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

  // Connect to WebSocket
  const { sendMessage, lastMessage, connected } = useWebSocket({
    url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
    enabled,
    protocols: ['retail-dashboard'],
  });

  useEffect(() => {
    setIsConnected(connected);
  }, [connected]);

  // Subscribe to channels
  useEffect(() => {
    if (!connected || !storeId) return;

    // Subscribe to store-specific channels
    sendMessage({
      type: 'subscribe',
      channel: `store:${storeId}:orders`,
    });

    sendMessage({
      type: 'subscribe',
      channel: `store:${storeId}:inventory`,
    });

    sendMessage({
      type: 'subscribe',
      channel: `store:${storeId}:transfers`,
    });

    return () => {
      sendMessage({
        type: 'unsubscribe',
        channel: `store:${storeId}:orders`,
      });
      sendMessage({
        type: 'unsubscribe',
        channel: `store:${storeId}:inventory`,
      });
      sendMessage({
        type: 'unsubscribe',
        channel: `store:${storeId}:transfers`,
      });
    };
  }, [connected, storeId, sendMessage]);

  // Handle incoming messages
  useEffect(() => {
    if (!lastMessage) return;

    try {
      const message = JSON.parse(lastMessage.data as string);

      switch (message.channel) {
        case `store:${storeId}:orders`:
          handleOrderUpdate(message.data);
          break;
        case `store:${storeId}:inventory`:
          handleInventoryUpdate(message.data);
          break;
        case `store:${storeId}:transfers`:
          handleTransferUpdate(message.data);
          break;
      }
    } catch (error) {
      console.error('Error processing realtime message:', error);
    }
  }, [lastMessage, storeId]);

  const handleOrderUpdate = useCallback((order: any) => {
    setData(prev => ({
      ...prev,
      orders: [...(prev.orders || []), order],
    }));
    onOrderUpdate?.(order);
  }, [onOrderUpdate]);

  const handleInventoryUpdate = useCallback((inventory: any) => {
    setData(prev => {
      const existingIndex = prev.inventory?.findIndex(
        item => item.productId === inventory.productId
      );

      if (existingIndex !== undefined && existingIndex >= 0) {
        const updated = [...prev.inventory!];
        updated[existingIndex] = inventory;
        return { ...prev, inventory: updated };
      }

      return {
        ...prev,
        inventory: [...(prev.inventory || []), inventory],
      };
    });
    onInventoryUpdate?.(inventory);
  }, [onInventoryUpdate]);

  const handleTransferUpdate = useCallback((transfer: any) => {
    setData(prev => {
      const existingIndex = prev.transfers?.findIndex(
        t => t.id === transfer.id
      );

      if (existingIndex !== undefined && existingIndex >= 0) {
        const updated = [...prev.transfers!];
        updated[existingIndex] = transfer;
        return { ...prev, transfers: updated };
      }

      return {
        ...prev,
        transfers: [...(prev.transfers || []), transfer],
      };
    });
    onTransferUpdate?.(transfer);
  }, [onTransferUpdate]);

  return {
    data,
    isConnected,
    isConnecting: !connected && enabled,
    error: null,
    refresh: () => {
      // Request fresh data
      sendMessage({
        type: 'refresh',
        storeId,
      });
    },
  };
}
