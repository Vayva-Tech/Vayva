'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import type { WorkerMessage, WorkerResponse } from '@/workers/metrics.worker';

type WorkerSuccessPayload = Exclude<WorkerResponse, { type: 'ERROR' }>['payload'];

interface UseWorkerResult {
  data: WorkerSuccessPayload | null;
  loading: boolean;
  error: string | null;
  send: (message: WorkerMessage) => void;
}

/**
 * Hook to interact with Web Workers for off-main-thread calculations
 */
export function useMetricsWorker(): UseWorkerResult {
  const workerRef = useRef<Worker | null>(null);
  const callbacksRef = useRef<Map<string, (data: unknown) => void>>(new Map());

  const [data, setData] = useState<WorkerSuccessPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('@/workers/metrics.worker.ts', import.meta.url)
    );

    workerRef.current.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const { type, payload } = event.data;

      if (type === 'ERROR') {
        setError(payload);
        setLoading(false);
      } else {
        setData(payload);
        setLoading(false);

        const callback = callbacksRef.current.get(type);
        if (callback) {
          callback(payload);
        }
      }
    };

    workerRef.current.onerror = (err: ErrorEvent) => {
      setError(err.message);
      setLoading(false);
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const send = useCallback((message: WorkerMessage) => {
    if (workerRef.current) {
      setLoading(true);
      setError(null);
      workerRef.current.postMessage(message);
    }
  }, []);

  return { data, loading, error, send };
}

/**
 * Helper function to calculate metrics using Web Worker
 */
export async function calculateMetricsAsync(
  mrr: number,
  previousMonth: number,
  subscriptions: Array<{ amount: number; status: string }>
): Promise<{ growth: number; arr: number; churnRate: number; ltv: number }> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('@/workers/metrics.worker.ts', import.meta.url));

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      if (event.data.type === 'METRICS_CALCULATED') {
        resolve(event.data.payload);
        worker.terminate();
      } else if (event.data.type === 'ERROR') {
        reject(new Error(event.data.payload));
        worker.terminate();
      }
    };

    worker.onerror = (err: ErrorEvent) => {
      reject(err);
      worker.terminate();
    };

    worker.postMessage({
      type: 'CALCULATE_METRICS',
      payload: { mrr, previousMonth, subscriptions },
    });
  });
}

/**
 * Helper function to analyze trends using Web Worker
 */
export async function analyzeTrendsAsync(
  data: number[],
  periods: number = 3
): Promise<{ trend: 'up' | 'down' | 'neutral'; percentage: number; forecast: number[] }> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('@/workers/metrics.worker.ts', import.meta.url));

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      if (event.data.type === 'TRENDS_ANALYZED') {
        resolve(event.data.payload);
        worker.terminate();
      } else if (event.data.type === 'ERROR') {
        reject(new Error(event.data.payload));
        worker.terminate();
      }
    };

    worker.onerror = (err: ErrorEvent) => {
      reject(err);
      worker.terminate();
    };

    worker.postMessage({
      type: 'ANALYZE_TRENDS',
      payload: { data, periods },
    });
  });
}
