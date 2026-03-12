import { logger } from "@vayva/shared";
import { useState, useEffect } from "react";
import { apiJson } from "@/lib/api-client-shared";

interface StorefrontStoreResponse {
  id: string;
  slug: string;
  name: string;
  [key: string]: unknown;
}

export function useStorefrontStore(slug: string) {
  const [store, setStore] = useState<StorefrontStoreResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!slug) return;
    let isMounted = true;
    const loadStore = async () => {
      setIsLoading(true);
      try {
        const data = await apiJson<
          StorefrontStoreResponse | { data: StorefrontStoreResponse }
        >(`/api/storefront/${slug}/store`);
        if (isMounted)
          setStore(
            (data as { data: StorefrontStoreResponse })?.data ||
              (data as StorefrontStoreResponse),
          );
      } catch (err: unknown) {
        const _errMsg = err instanceof Error ? err.message : String(err);
        if (isMounted) setError(_errMsg);
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          logger.error("Store fetch error", {
            error: _errMsg,
            slug,
            app: "merchant",
          });
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    void loadStore();
    return () => {
      isMounted = false;
    };
  }, [slug]);
  return { store, isLoading, error };
}

export function useStorefrontProducts(
  slug: string,
  options: { category?: string; search?: string; limit?: number } = {},
): {
  products: Record<string, unknown>[];
  isLoading: boolean;
  error: string | null;
} {
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Destructure options to avoid dependency loop if object is unstable
  const category = options?.category;
  const search = options?.search;
  const limit = options?.limit;
  useEffect(() => {
    if (!slug) return;
    let isMounted = true;
    const loadProducts = async () => {
      setIsLoading(true);
      const query = new URLSearchParams();
      if (category && category !== "all") query.append("category", category);
      if (search) query.append("search", search);
      if (limit) query.append("limit", limit.toString());

      try {
        const data = await apiJson<
          Record<string, unknown>[] | { data: Record<string, unknown>[] }
        >(`/api/storefront/${slug}/products?${query.toString()}`);
        if (isMounted)
          setProducts(
            (data as { data: Record<string, unknown>[] })?.data ||
              (data as Record<string, unknown>[]) ||
              [],
          );
      } catch (err: unknown) {
        const _errMsg = err instanceof Error ? err.message : String(err);
        if (isMounted) setError(_errMsg);
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          logger.error("Products fetch error", {
            error: _errMsg,
            slug,
            app: "merchant",
          });
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    void loadProducts();
    return () => {
      isMounted = false;
    };
  }, [slug, category, search, limit]);
  return { products, isLoading, error };
}
