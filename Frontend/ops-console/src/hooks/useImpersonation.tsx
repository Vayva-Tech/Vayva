"use client";

import { useState, useCallback, useEffect, createContext, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ImpersonationSession {
  id: string;
  impersonatorId: string;
  targetUserId: string;
  targetType: string;
  reason: string;
  startedAt: string;
  expiresAt: string;
  targetUser: {
    id: string;
    email: string;
    name: string | null;
  };
  impersonator: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  };
}

interface ImpersonationContextType {
  session: ImpersonationSession | null;
  isLoading: boolean;
  error: Error | null;
  startImpersonation: (params: {
    targetUserId: string;
    targetType?: string;
    reason: string;
    sessionDuration?: number;
  }) => Promise<void>;
  stopImpersonation: () => Promise<void>;
  isActive: boolean;
}

const ImpersonationContext = createContext<ImpersonationContextType | null>(null);

export function useImpersonation() {
  const context = useContext(ImpersonationContext);
  if (!context) {
    throw new Error("useImpersonation must be used within ImpersonationProvider");
  }
  return context;
}

export function ImpersonationProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  // Fetch active session
  const { data: session, isLoading, error, refetch } = useQuery({
    queryKey: ["impersonation-session"],
    queryFn: async () => {
      const res = await fetch("/api/ops/impersonate");
      if (!res.ok) throw new Error("Failed to fetch impersonation session");
      const data = await res.json();
      return data.data?.[0] || null;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Start impersonation mutation
  const startMutation = useMutation({
    mutationFn: async (params: {
      targetUserId: string;
      targetType?: string;
      reason: string;
      sessionDuration?: number;
    }) => {
      const res = await fetch("/api/ops/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to start impersonation");
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["impersonation-session"] });
    },
  });

  // Stop impersonation mutation
  const stopMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/ops/impersonate", {
        method: "DELETE",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to stop impersonation");
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["impersonation-session"] });
    },
  });

  const startImpersonation = useCallback(
    async (params: {
      targetUserId: string;
      targetType?: string;
      reason: string;
      sessionDuration?: number;
    }) => {
      await startMutation.mutateAsync(params);
    },
    [startMutation]
  );

  const stopImpersonation = useCallback(async () => {
    await stopMutation.mutateAsync();
  }, [stopMutation]);

  return (
    <ImpersonationContext.Provider
      value={{
        session,
        isLoading,
        error: error || startMutation.error || stopMutation.error,
        startImpersonation,
        stopImpersonation,
        isActive: !!session,
      }}
    >
      {children}
    </ImpersonationContext.Provider>
  );
}

// Hook for impersonation banner state
export function useImpersonationBanner() {
  const { session, stopImpersonation, isActive } = useImpersonation();
  const [isStopping, setIsStopping] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!session?.expiresAt) return;

    const updateTimeRemaining = () => {
      const expires = new Date(session.expiresAt).getTime();
      const now = Date.now();
      const remaining = Math.max(0, expires - now);
      setTimeRemaining(remaining);
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [session?.expiresAt]);

  const handleStop = useCallback(async () => {
    setIsStopping(true);
    try {
      await stopImpersonation();
    } finally {
      setIsStopping(false);
    }
  }, [stopImpersonation]);

  const formatTimeRemaining = () => {
    if (!timeRemaining) return "";
    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return {
    isActive,
    session,
    isStopping,
    timeRemaining,
    formattedTimeRemaining: formatTimeRemaining(),
    handleStop,
  };
}
