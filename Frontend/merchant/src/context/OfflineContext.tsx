"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  lastOnlineAt: Date | null;
}

interface OfflineContextType extends NetworkStatus {
  // Cache management
  getCachedData: <T>(key: string) => T | null;
  setCachedData: <T>(key: string, data: T, ttl?: number) => void;
  clearCache: (key?: string) => void;
  // Queue for offline actions
  queueAction: (action: QueuedAction) => void;
  getQueuedActions: () => QueuedAction[];
  clearQueuedActions: () => void;
  processQueuedActions: () => Promise<void>;
}

interface QueuedAction {
  id: string;
  type: "create" | "update" | "delete";
  endpoint: string;
  payload: unknown;
  timestamp: number;
  retryCount: number;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

const CACHE_PREFIX = "vayva_cache_";
const QUEUE_KEY = "vayva_offline_queue";
const MAX_QUEUE_SIZE = 50;

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    isSlowConnection: false,
    lastOnlineAt: new Date(),
  });

  useEffect(() => {
    const handleOnline = () => {
      setStatus((prev) => ({
        ...prev,
        isOnline: true,
        lastOnlineAt: new Date(),
      }));
      // Process queued actions when coming back online
      void processQueuedActions();
    };

    const handleOffline = () => {
      setStatus((prev) => ({
        ...prev,
        isOnline: false,
      }));
    };

    // Check connection speed
    const checkConnectionSpeed = () => {
      if ("connection" in navigator) {
        const conn = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection;
        if (conn?.effectiveType) {
          setStatus((prev) => ({
            ...prev,
            isSlowConnection: ["2g", "slow-2g"].includes(conn.effectiveType || ""),
          }));
        }
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial speed check
    checkConnectionSpeed();

    // Listen for connection changes
    if ("connection" in navigator) {
      const conn = (navigator as Navigator & { connection?: { addEventListener?: (event: string, handler: () => void) => void } }).connection;
      conn?.addEventListener?.("change", checkConnectionSpeed);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const getCachedData = <T,>(key: string): T | null => {
    if (typeof window === "undefined") return null;
    
    try {
      const item = localStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!item) return null;

      const { data, expiry } = JSON.parse(item) as { data: T; expiry?: number };
      
      // Check if expired
      if (expiry && Date.now() > expiry) {
        localStorage.removeItem(`${CACHE_PREFIX}${key}`);
        return null;
      }

      return data;
    } catch {
      return null;
    }
  };

  const setCachedData = <T,>(key: string, data: T, ttlMinutes = 60): void => {
    if (typeof window === "undefined") return;

    try {
      const expiry = Date.now() + ttlMinutes * 60 * 1000;
      localStorage.setItem(
        `${CACHE_PREFIX}${key}`,
        JSON.stringify({ data, expiry })
      );
    } catch (error) {
      // Handle quota exceeded - clear old cache
      if ((error as Error).name === "QuotaExceededError") {
        clearOldCache();
        // Retry once
        try {
          const expiry = Date.now() + ttlMinutes * 60 * 1000;
          localStorage.setItem(
            `${CACHE_PREFIX}${key}`,
            JSON.stringify({ data, expiry })
          );
        } catch {
          // Silently fail if still can't store
        }
      }
    }
  };

  const clearCache = (key?: string): void => {
    if (typeof window === "undefined") return;

    if (key) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
    } else {
      // Clear all vayva cache
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k?.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(k);
        }
      }
    }
  };

  const clearOldCache = (): void => {
    const now = Date.now();
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const { expiry } = JSON.parse(item) as { expiry?: number };
            if (expiry && now > expiry) {
              localStorage.removeItem(key);
            }
          }
        } catch {
          // Remove invalid entries
          localStorage.removeItem(key);
        }
      }
    }
  };

  const queueAction = (action: QueuedAction): void => {
    if (typeof window === "undefined") return;

    try {
      const queue = getQueuedActions();
      
      // Prevent duplicates
      const exists = queue.some(
        (q) => q.endpoint === action.endpoint && 
               JSON.stringify(q.payload) === JSON.stringify(action.payload)
      );
      
      if (!exists) {
        queue.push(action);
        // Limit queue size
        if (queue.length > MAX_QUEUE_SIZE) {
          queue.shift();
        }
        localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
      }
    } catch {
      // Silently fail
    }
  };

  const getQueuedActions = (): QueuedAction[] => {
    if (typeof window === "undefined") return [];

    try {
      const queue = localStorage.getItem(QUEUE_KEY);
      return queue ? (JSON.parse(queue) as QueuedAction[]) : [];
    } catch {
      return [];
    }
  };

  const clearQueuedActions = (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(QUEUE_KEY);
  };

  const processQueuedActions = async (): Promise<void> => {
    const queue = getQueuedActions();
    if (queue.length === 0 || !status.isOnline) return;

    const failed: QueuedAction[] = [];

    for (const action of queue) {
      try {
        const response = await fetch(action.endpoint, {
          method: action.type === "delete" ? "DELETE" : action.type === "update" ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(action.payload),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch {
        // Retry up to 3 times
        if (action.retryCount < 3) {
          failed.push({ ...action, retryCount: action.retryCount + 1 });
        }
      }
    }

    // Save failed actions back to queue
    localStorage.setItem(QUEUE_KEY, JSON.stringify(failed));
  };

  return (
    <OfflineContext.Provider
      value={{
        ...status,
        getCachedData,
        setCachedData,
        clearCache,
        queueAction,
        getQueuedActions,
        clearQueuedActions,
        processQueuedActions,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error("useOffline must be used within OfflineProvider");
  }
  return context;
}
