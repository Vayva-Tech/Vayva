"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface UseOpsDataOptions<T> {
  url: string;
  initialData?: T | null;
  onError?: (error: Error) => void;
  refetchInterval?: number;
}

interface UseOpsDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  mutate: (newData: T) => void;
}

export function useOpsData<T>({
  url,
  initialData = null,
  onError,
  refetchInterval,
}: UseOpsDataOptions<T>): UseOpsDataReturn<T> {
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.statusText}`);
      }
      
      const json = await res.json();
      setData(json);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [url, onError]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const mutate = useCallback((newData: T) => {
    setData(newData);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!refetchInterval) return;
    
    const interval = setInterval(fetchData, refetchInterval);
    return () => clearInterval(interval);
  }, [fetchData, refetchInterval]);

  return { data, loading, error, refetch, mutate };
}

interface UseOpsMutationOptions<TData, TVariables> {
  url: string;
  method?: "POST" | "PUT" | "PATCH" | "DELETE";
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

interface UseOpsMutationReturn<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData | null>;
  loading: boolean;
  error: Error | null;
  data: TData | null;
}

export function useOpsMutation<TData, TVariables = unknown>({
  url,
  method = "POST",
  onSuccess,
  onError,
  successMessage,
  errorMessage,
}: UseOpsMutationOptions<TData, TVariables>): UseOpsMutationReturn<TData, TVariables> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TData | null>(null);

  const mutate = useCallback(async (variables: TVariables): Promise<TData | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: variables ? JSON.stringify(variables) : undefined,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `Request failed: ${res.statusText}`);
      }

      const json = await res.json();
      setData(json);
      
      if (successMessage) {
        toast.success(successMessage);
      }
      
      onSuccess?.(json);
      return json;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      
      if (errorMessage || successMessage) {
        toast.error(errorMessage || error.message);
      }
      
      onError?.(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [url, method, onSuccess, onError, successMessage, errorMessage]);

  return { mutate, loading, error, data };
}
