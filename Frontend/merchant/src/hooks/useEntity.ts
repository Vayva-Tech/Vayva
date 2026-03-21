"use client";

import { useState, useEffect, useCallback } from "react";
import { logger } from "@vayva/shared";
import { apiJson } from "@/lib/api-client-shared";

interface UseEntityListOptions<T> {
  endpoint: string;
  transform?: (data: unknown) => T[];
}

interface UseEntityListResult<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useEntityList<T>({ endpoint, transform }: UseEntityListOptions<T>): UseEntityListResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiJson<unknown>(endpoint);
      const transformed = transform ? transform(data) : (data as T[]);
      setItems(transformed);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load data";
      logger.error("[USE_ENTITY_LIST_ERROR]", { error: msg, endpoint });
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [endpoint, transform]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return { items, loading, error, refresh: fetchData };
}

interface UseEntityOptions<T> {
  endpoint: string;
  id: string | null;
}

interface UseEntityResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useEntity<T>({ endpoint, id }: UseEntityOptions<T>): UseEntityResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const result = await apiJson<T>(`${endpoint}/${id}`);
      setData(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load entity";
      logger.error("[USE_ENTITY_ERROR]", { error: msg, endpoint, id });
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [endpoint, id]);

  useEffect(() => {
    if (id) {
      void fetchData();
    }
  }, [fetchData, id]);

  return { data, loading, error, refresh: fetchData };
}
