"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface SSEOptions {
  url: string;
  onMessage?: (data: unknown) => void;
  onError?: (error: Event) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
}

interface SSEState {
  connected: boolean;
  lastMessageAt: Date | null;
  error: Error | null;
}

/**
 * SSE hook for real-time updates
 * Usage:
 * const { connected, error } = useSSE({
 *   url: "/api/sse/notifications",
 *   onMessage: (data) => console.log(data),
 *   autoReconnect: true,
 * });
 */
export function useSSE({
  url,
  onMessage,
  onError,
  onConnect,
  onDisconnect,
  autoReconnect = true,
  reconnectInterval = 5000,
}: SSEOptions) {
  const [state, setState] = useState<SSEState>({
    connected: false,
    lastMessageAt: null,
    error: null,
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReconnectRef = useRef(true);

  const connect = useCallback(() => {
    if (eventSourceRef.current?.readyState === EventSource.OPEN) {
      return;
    }

    try {
      const es = new EventSource(url);
      eventSourceRef.current = es;

      es.onopen = () => {
        setState((prev) => ({
          ...prev,
          connected: true,
          error: null,
        }));
        onConnect?.();
      };

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setState((prev) => ({
            ...prev,
            lastMessageAt: new Date(),
          }));
          onMessage?.(data);
        } catch {
          // Handle non-JSON messages
          onMessage?.(event.data);
        }
      };

      es.onerror = (error) => {
        setState((prev) => ({
          ...prev,
          connected: false,
          error: new Error("SSE connection error"),
        }));
        onError?.(error);
        es.close();

        if (autoReconnect && shouldReconnectRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else {
          onDisconnect?.();
        }
      };
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error("Failed to connect"),
      }));
    }
  }, [url, onMessage, onError, onConnect, onDisconnect, autoReconnect, reconnectInterval]);

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setState((prev) => ({ ...prev, connected: false }));
    onDisconnect?.();
  }, [onDisconnect]);

  useEffect(() => {
    shouldReconnectRef.current = true;
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    ...state,
    connect,
    disconnect,
  };
}

/**
 * Hook to detect reduced motion preference
 */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return reducedMotion;
}

/**
 * Hook for focus visible state (keyboard navigation)
 */
export function useFocusVisible(): boolean {
  const [focusVisible, setFocusVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = () => setFocusVisible(true);
    const handlePointerDown = () => setFocusVisible(false);

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, []);

  return focusVisible;
}
