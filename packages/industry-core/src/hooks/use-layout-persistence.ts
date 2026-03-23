// @ts-nocheck
'use client';

// ============================================================================
// useLayoutPersistence Hook
// ============================================================================
// Persists and retrieves dashboard layout changes
// ============================================================================

import { useCallback, useState } from "react";
import type { IndustrySlug, LayoutPreset } from "../types";

interface UseLayoutPersistenceOptions {
  storeId?: string;
}

interface UseLayoutPersistenceReturn {
  isSaving: boolean;
  error: Error | null;
  saveLayout: (layout: LayoutPreset) => Promise<void>;
  resetLayout: () => Promise<void>;
}

/**
 * useLayoutPersistence - Hook for persisting dashboard layout changes
 *
 * Saves and retrieves custom layout configurations for a dashboard.
 * Handles optimistic updates and error states.
 *
 * @example
 * ```tsx
 * const { saveLayout, isSaving } = useLayoutPersistence('fashion', { storeId: '123' });
 *
 * // When layout changes
 * await saveLayout(newLayout);
 * ```
 */
export function useLayoutPersistence(
  industry: IndustrySlug,
  options: UseLayoutPersistenceOptions = {}
): UseLayoutPersistenceReturn {
  const { storeId } = options;
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const saveLayout = useCallback(
    async (layout: LayoutPreset) => {
      if (!storeId) {
        setError(new Error("Store ID is required"));
        return;
      }

      setIsSaving(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/v1/dashboard/${industry}/layout`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              storeId,
              layout,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to save layout: ${response.statusText}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [industry, storeId]
  );

  const resetLayout = useCallback(async () => {
    if (!storeId) {
      setError(new Error("Store ID is required"));
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/v1/dashboard/${industry}/layout/reset`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ storeId }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to reset layout: ${response.statusText}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [industry, storeId]);

  return {
    isSaving,
    error,
    saveLayout,
    resetLayout,
  };
}
