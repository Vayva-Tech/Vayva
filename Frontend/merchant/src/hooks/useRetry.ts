/**
 * useRetry Hook - Exponential Backoff Retry Logic
 * Provides retry functionality with exponential backoff for failed operations
 */

'use client';

import { useCallback, useState, useEffect } from 'react';

interface UseRetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  exponential?: boolean;
  onRetry?: (attempt: number, error: Error) => void;
  onError?: (error: Error, attempts: number) => void;
}

interface UseRetryReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  retryCount: number;
  isRetrying: boolean;
  retry: () => Promise<void>;
  reset: () => void;
}

export function useRetry<T>(
  operation: () => Promise<T>,
  options: UseRetryOptions = {}
): UseRetryReturn<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000, // 1 second
    maxDelay = 10000, // 10 seconds
    exponential = true,
    onRetry,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const calculateDelay = useCallback((attempt: number): number => {
    if (!exponential) {
      return initialDelay;
    }

    // Exponential backoff: delay * 2^attempt
    const exponentialDelay = initialDelay * Math.pow(2, attempt);
    // Add jitter to prevent thundering herd (±25%)
    const jitter = exponentialDelay * 0.25 * (Math.random() * 2 - 1);
    const delayWithJitter = exponentialDelay + jitter;

    return Math.min(delayWithJitter, maxDelay);
  }, [exponential, initialDelay, maxDelay]);

  const execute = useCallback(async (attempt: number = 0) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await operation();
      setData(result);
      setIsLoading(false);
      setRetryCount(0);
      setIsRetrying(false);

      return result;
    } catch (err) {
      const errInstance = err instanceof Error ? err : new Error(String(err));

      if (attempt < maxRetries) {
        const delay = calculateDelay(attempt);

        setIsRetrying(true);
        setRetryCount(attempt + 1);

        onRetry?.(attempt + 1, errInstance);

        // Wait for the calculated delay
        await new Promise(resolve => setTimeout(resolve, delay));

        // Retry the operation
        return execute(attempt + 1);
      } else {
        // Max retries reached
        setIsLoading(false);
        setIsRetrying(false);
        setError(errInstance);
        onError?.(errInstance, attempt + 1);

        throw errInstance;
      }
    }
  }, [operation, maxRetries, calculateDelay, onRetry, onError]);

  const retry = useCallback(async () => {
    await execute(0);
  }, [execute]);

  const reset = useCallback(() => {
    setData(null);
    setIsLoading(true);
    setError(null);
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  // Execute on mount
  useEffect(() => {
    execute();
  }, []);

  return {
    data,
    isLoading,
    error,
    retryCount,
    isRetrying,
    retry,
    reset,
  };
}
