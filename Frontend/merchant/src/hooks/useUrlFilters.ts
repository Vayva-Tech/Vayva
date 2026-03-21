// @ts-nocheck
"use client";

import { useCallback, useMemo, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";

type FilterValue = string | number | null | undefined;

interface FilterConfig {
  /** Keys that should be debounced before updating the URL (e.g. "q", "search") */
  debounceKeys?: string[];
  /** Debounce delay in ms (default: 500) */
  debounceMs?: number;
  /** Default values — keys with these values are omitted from the URL */
  defaults?: Record<string, FilterValue>;
  /** Maximum allowed limit (default: 100) */
  maxLimit?: number;
}

interface UseUrlFiltersReturn<T extends Record<string, FilterValue>> {
  /** Current filter values (merged from URL + defaults) */
  filters: T;
  /** Set a single filter value. Resets cursor when filters change. */
  setFilter: (key: keyof T, value: FilterValue) => void;
  /** Set multiple filter values at once. Resets cursor. */
  setFilters: (updates: Partial<T>) => void;
  /** Reset all filters to defaults */
  resetFilters: () => void;
  /** The debounced search value (for keys in debounceKeys) */
  debouncedFilters: T;
  /** Ready-to-use query string for API calls (uses debounced values) */
  queryString: string;
  /** Current page number (1-indexed, derived from offset/limit) */
  page: number;
  /** Items per page */
  limit: number;
  /** Go to a specific page (1-indexed) */
  setPage: (page: number) => void;
  /** Whether any non-default filter is active */
  isFiltered: boolean;
}

export function useUrlFilters<
  T extends Record<string, FilterValue> = Record<string, FilterValue>,
>(config: FilterConfig = {}): UseUrlFiltersReturn<T> {
  const {
    debounceKeys = ["q", "search"],
    debounceMs = 500,
    defaults = {},
    maxLimit = 100,
  } = config;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isNavigating = useRef(false);

  // Parse current filters from URL, merging with defaults
  const rawFilters = useMemo(() => {
    const result: Record<string, FilterValue> = { ...defaults };
    searchParams.forEach((value, key) => {
      result[key] = value;
    });
    return result as T;
  }, [searchParams, defaults]);

  // Build debounced version of filter values for debounceKeys
  const debouncedSearchValues: Record<string, string> = {};
  for (const key of debounceKeys) {
    const raw = String(rawFilters[key as keyof T] ?? "");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    debouncedSearchValues[key] = useDebounce(raw, debounceMs);
  }

  const debouncedFilters = useMemo(() => {
    const result = { ...rawFilters };
    for (const key of debounceKeys) {
      if (key in result || debouncedSearchValues[key]) {
        (result as Record<string, FilterValue>)[key] =
          debouncedSearchValues[key] || undefined;
      }
    }
    return result;
  }, [rawFilters, debounceKeys, debouncedSearchValues]);

  const limit = useMemo(() => {
    const raw = Number(rawFilters["limit" as keyof T]) || 20;
    return Math.min(Math.max(1, raw), maxLimit);
  }, [rawFilters, maxLimit]);

  const page = useMemo(() => {
    const offset = Number(rawFilters["offset" as keyof T]) || 0;
    return Math.max(1, Math.floor(offset / limit) + 1);
  }, [rawFilters, limit]);

  // Update URL search params without full page reload
  const updateUrl = useCallback(
    (updates: Record<string, FilterValue>, resetPagination = true) => {
      if (isNavigating.current) return;
      isNavigating.current = true;

      const params = new URLSearchParams(searchParams.toString());

      // Apply updates
      for (const [key, value] of Object.entries(updates)) {
        const defaultVal = defaults[key];
        if (
          value === null ||
          value === undefined ||
          value === "" ||
          String(value) === String(defaultVal ?? "")
        ) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      }

      // Reset pagination when filters change (not when page changes)
      if (resetPagination) {
        params.delete("offset");
        params.delete("cursor");
      }

      const qs = params.toString();
      const url = qs ? `${pathname}?${qs}` : pathname;
      router.replace(url, { scroll: false });

      // Allow next navigation after a tick
      requestAnimationFrame(() => {
        isNavigating.current = false;
      });
    },
    [searchParams, pathname, router, defaults],
  );

  const setFilter = useCallback(
    (key: keyof T, value: FilterValue) => {
      const isPagination =
        key === "offset" || key === "cursor" || key === "page";
      updateUrl({ [key as string]: value }, !isPagination);
    },
    [updateUrl],
  );

  const setFilters = useCallback(
    (updates: Partial<T>) => {
      updateUrl(updates as Record<string, FilterValue>, true);
    },
    [updateUrl],
  );

  const resetFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  const setPage = useCallback(
    (p: number) => {
      const offset = (Math.max(1, p) - 1) * limit;
      updateUrl({ offset: offset > 0 ? offset : undefined }, false);
    },
    [updateUrl, limit],
  );

  // Build query string for API calls using debounced values
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    const source = { ...debouncedFilters };

    for (const [key, value] of Object.entries(source)) {
      if (value === null || value === undefined || value === "") continue;
      const defaultVal = defaults[key];
      if (String(value) === String(defaultVal ?? "")) continue;
      params.set(key, String(value));
    }

    // Ensure limit is always present
    if (!params.has("limit")) {
      params.set("limit", String(limit));
    }

    return params.toString();
  }, [debouncedFilters, defaults, limit]);

  const isFiltered = useMemo(() => {
    for (const [key, value] of Object.entries(rawFilters)) {
      if (key === "limit" || key === "offset" || key === "cursor") continue;
      const defaultVal = defaults[key];
      if (
        value !== null &&
        value !== undefined &&
        value !== "" &&
        String(value) !== String(defaultVal ?? "")
      ) {
        return true;
      }
    }
    return false;
  }, [rawFilters, defaults]);

  return {
    filters: rawFilters,
    setFilter,
    setFilters,
    resetFilters,
    debouncedFilters,
    queryString,
    page,
    limit,
    setPage,
    isFiltered,
  };
}
