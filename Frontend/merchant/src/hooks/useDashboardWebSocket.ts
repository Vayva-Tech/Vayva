// ============================================================================
// DASHBOARD WEBSOCKET HOOK
// ============================================================================
// React hook for connecting to dashboard WebSocket server
// Handles reconnection, message handling, and cleanup
// ============================================================================

"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { logger } from "@vayva/shared";

// WebSocket message format
export interface WebSocketMessage {
  event: string;
  data: unknown;
  timestamp: number;
}

function isWebSocketMessage(value: unknown): value is WebSocketMessage {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.event === "string" &&
    typeof o.timestamp === "number" &&
    "data" in o
  );
}

// Connection status
export type WebSocketStatus = "connecting" | "connected" | "disconnected" | "error";

// Configuration options
interface UseWebSocketOptions {
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onMessage?: (message: WebSocketMessage) => void;
  onStatusChange?: (status: WebSocketStatus) => void;
}

export function useDashboardWebSocket(
  _industrySlug: string,
  options: UseWebSocketOptions = {}
) {
  const { token } = useAuth();
  
  const {
    autoReconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    onMessage,
    onStatusChange
  } = options;
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const [status, setStatus] = useState<WebSocketStatus>("disconnected");
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  // Update status and notify callback
  const updateStatus = useCallback((newStatus: WebSocketStatus) => {
    setStatus(newStatus);
    onStatusChange?.(newStatus);
  }, [onStatusChange]);

  // Connect to WebSocket server
  const connect = useCallback(() => {
    if (!token) {
      logger.warn("[WEBSOCKET_HOOK] No auth token available");
      return;
    }

    // Clear any existing reconnection attempts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    try {
      updateStatus("connecting");
      
      // Build WebSocket URL
      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${wsProtocol}//${window.location.host}/ws/dashboard?token=${token}`;
      
      logger.info(`[WEBSOCKET_HOOK] Connecting to ${wsUrl}`);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        logger.info("[WEBSOCKET_HOOK] Connected to dashboard WebSocket");
        updateStatus("connected");
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const raw: unknown = JSON.parse(String(event.data));
          if (!isWebSocketMessage(raw)) {
            logger.warn("[WEBSOCKET_HOOK] Ignoring malformed message shape");
            return;
          }
          const message = raw;
          logger.debug("[WEBSOCKET_HOOK] Received message:", message);
          
          setLastMessage(message);
          onMessage?.(message);
        } catch (error: unknown) {
          logger.error("[WEBSOCKET_HOOK] Failed to parse message:", {
            error: error instanceof Error ? error.message : String(error),
          });
        }
      };

      ws.onerror = (error: Event) => {
        logger.error("[WEBSOCKET_HOOK] WebSocket error:", {
          type: error.type,
        });
        updateStatus("error");
      };

      ws.onclose = (event) => {
        logger.info(`[WEBSOCKET_HOOK] Connection closed: ${event.code} ${event.reason}`);
        updateStatus("disconnected");
        
        // Handle reconnection
        if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = reconnectInterval * Math.pow(1.5, reconnectAttemptsRef.current);
          logger.info(`[WEBSOCKET_HOOK] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          logger.error("[WEBSOCKET_HOOK] Max reconnection attempts reached");
        }
      };

    } catch (error: unknown) {
      logger.error("[WEBSOCKET_HOOK] Connection failed:", {
        error: error instanceof Error ? error.message : String(error),
      });
      updateStatus("error");
    }
  }, [
    token,
    autoReconnect,
    reconnectInterval,
    maxReconnectAttempts,
    onMessage,
    onStatusChange,
    updateStatus,
  ]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, "Client disconnect");
      wsRef.current = null;
    }
    
    updateStatus("disconnected");
  }, [updateStatus]);

  // Send message to server
  const sendMessage = useCallback((event: string, data: unknown = {}) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        event,
        data,
        timestamp: Date.now()
      };
      
      wsRef.current.send(JSON.stringify(message));
      logger.debug("[WEBSOCKET_HOOK] Sent message:", message);
    } else {
      logger.warn("[WEBSOCKET_HOOK] Cannot send message - not connected");
    }
  }, []);

  // Subscribe to a channel
  const subscribe = useCallback((channel: string) => {
    sendMessage("subscribe", { channel });
  }, [sendMessage]);

  // Unsubscribe from a channel
  const unsubscribe = useCallback((channel: string) => {
    sendMessage("unsubscribe", { channel });
  }, [sendMessage]);

  // Effect to manage connection lifecycle
  useEffect(() => {
    // Only connect if we have a token
    if (token) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [token, connect, disconnect]);

  // Reset reconnection attempts when token changes
  useEffect(() => {
    reconnectAttemptsRef.current = 0;
  }, [token]);

  return {
    // Connection state
    status,
    isConnected: status === "connected",
    lastMessage,
    
    // Methods
    connect,
    disconnect,
    sendMessage,
    subscribe,
    unsubscribe,
    
    // Utilities
    sendPing: () => sendMessage("ping"),
  };
}

// Specific hooks for common dashboard updates
export function useOrderUpdates(onOrderUpdate: (data: unknown) => void) {
  const { lastMessage } = useDashboardWebSocket("orders");
  
  useEffect(() => {
    if (lastMessage?.event === "order_updated") {
      onOrderUpdate(lastMessage.data);
    }
  }, [lastMessage, onOrderUpdate]);
  
  return lastMessage?.event === "order_updated" ? lastMessage.data : null;
}

export function useKitchenUpdates(onKitchenUpdate: (data: unknown) => void) {
  const { lastMessage } = useDashboardWebSocket("kitchen");
  
  useEffect(() => {
    if (lastMessage?.event === "kitchen_status") {
      onKitchenUpdate(lastMessage.data);
    }
  }, [lastMessage, onKitchenUpdate]);
  
  return lastMessage?.event === "kitchen_status" ? lastMessage.data : null;
}

export function useBookingUpdates(onBookingUpdate: (data: unknown) => void) {
  const { lastMessage } = useDashboardWebSocket("bookings");
  
  useEffect(() => {
    if (lastMessage?.event === "booking_confirmed") {
      onBookingUpdate(lastMessage.data);
    }
  }, [lastMessage, onBookingUpdate]);
  
  return lastMessage?.event === "booking_confirmed" ? lastMessage.data : null;
}