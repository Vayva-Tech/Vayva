'use client';

import useSWR from 'swr';
import { useEffect, useState } from 'react';
import { Ticket, KitchenStation } from '@/types/kitchen';

interface UseRealTimeKDSResult {
  tickets: Ticket[];
  stations: KitchenStation[];
  isLoading: boolean;
  error: Error | null;
  updateTicketStatus: (ticketId: string, status: string) => Promise<void>;
  bumpTicket: (ticketId: string) => Promise<void>;
  markItemComplete: (ticketId: string, itemId: string) => Promise<void>;
  voidTicket: (ticketId: string, reason: string) => Promise<void>;
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch');
  }
  return response.json();
};

/**
 * useRealTimeKDS Hook
 * 
 * Provides real-time KDS data and actions
 * Integrates with WebSocket for live updates
 */
export function useRealTimeKDS(): UseRealTimeKDSResult {
  const [storeId, setStoreId] = useState<string | null>(null);

  // Get store ID from user context/session
  useEffect(() => {
    const getStoreId = async () => {
      try {
        const response = await fetch('/api/merchant/me');
        if (response.ok) {
          const userData = await response.json();
          setStoreId(userData.storeId);
        } else {
          // Fallback to demo store ID
          setStoreId('demo-store-id');
        }
      } catch (error) {
        console.error('Failed to fetch user store ID:', error);
        // Fallback to demo store ID
        setStoreId('demo-store-id');
      }
    };
    
    getStoreId();
  }, []);

  // Fetch tickets with SWR
  const {
    data: ticketsData,
    error: ticketsError,
    mutate: refreshTickets,
    isLoading: ticketsLoading,
  } = useSWR(
    storeId ? `/api/restaurant/kds/tickets?storeId=${storeId}` : null,
    fetcher,
    {
      refreshInterval: 5000, // Auto-refresh every 5 seconds
      revalidateOnFocus: true,
    }
  );

  // Fetch stations with SWR
  const {
    data: stationsData,
    error: stationsError,
    mutate: refreshStations,
    isLoading: stationsLoading,
  } = useSWR(
    storeId ? `/api/restaurant/kds/stations?storeId=${storeId}` : null,
    fetcher,
    {
      refreshInterval: 10000, // Refresh stations less frequently
      revalidateOnFocus: true,
    }
  );

  // Subscribe to WebSocket updates for real-time KDS notifications
  useEffect(() => {
    if (!storeId) return;

    let ws: WebSocket | null = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const reconnectDelay = 3000;

    const connectWebSocket = () => {
      try {
        // Connect to WebSocket endpoint
        ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/ws/kds/${storeId}`);
        
        ws.onopen = () => {
          console.log('KDS WebSocket connected');
          reconnectAttempts = 0; // Reset reconnect counter on successful connection
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            // Handle different types of KDS updates
            if (data.type === 'ticket_update' || data.type === 'new_ticket' || data.type === 'ticket_status_change') {
              // Refresh tickets data
              refreshTickets();
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.onclose = (event) => {
          console.log('KDS WebSocket closed:', event.code, event.reason);
          // Attempt to reconnect if not closed intentionally
          if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            console.log(`Attempting to reconnect... (${reconnectAttempts}/${maxReconnectAttempts})`);
            setTimeout(connectWebSocket, reconnectDelay * reconnectAttempts);
          }
        };

        ws.onerror = (error) => {
          console.error('KDS WebSocket error:', error);
        };
      } catch (error) {
        console.error('Failed to establish WebSocket connection:', error);
      }
    };

    // Initial connection
    connectWebSocket();

    // Cleanup function
    return () => {
      if (ws) {
        ws.close(1000, 'Component unmounted');
      }
    };
  }, [storeId, refreshTickets]);

  // Action: Update ticket status
  const updateTicketStatus = async (ticketId: string, status: string) => {
    if (!storeId) return;
    
    const response = await fetch(
      `/api/restaurant/kds/tickets/${ticketId}/status?storeId=${storeId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update ticket status');
    }

    await refreshTickets();
  };

  // Action: Bump ticket
  const bumpTicket = async (ticketId: string) => {
    if (!storeId) return;

    const response = await fetch(
      `/api/restaurant/kds/tickets/${ticketId}/bump?storeId=${storeId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to bump ticket');
    }

    await refreshTickets();
  };

  // Action: Mark item complete
  const markItemComplete = async (ticketId: string, itemId: string) => {
    if (!storeId) return;

    const response = await fetch(
      `/api/restaurant/kds/tickets/${ticketId}/items/${itemId}/status?storeId=${storeId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to mark item complete');
    }

    await refreshTickets();
  };

  // Action: Void ticket
  const voidTicket = async (ticketId: string, reason: string) => {
    if (!storeId) return;

    const response = await fetch(
      `/api/restaurant/kds/tickets/${ticketId}/void?storeId=${storeId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to void ticket');
    }

    await refreshTickets();
  };

  return {
    tickets: ticketsData?.data || [],
    stations: stationsData?.stations || [],
    isLoading: ticketsLoading || stationsLoading,
    error: ticketsError || stationsError,
    updateTicketStatus,
    bumpTicket,
    markItemComplete,
    voidTicket,
  };
}
