import { logger } from "@vayva/shared";
import { useState, useEffect } from "react";
import { apiJson } from "@/lib/api-client-shared";

interface StorefrontStoreResponse {
  id: string;
  slug: string;
  name: string;
  [key: string]: unknown;
}

interface StorefrontProduct {
  id: string;
  title: string;
  price: number;
  [key: string]: unknown;
}

interface ApiResponse<T> {
  data?: T;
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
        const storeData = (data as ApiResponse<StorefrontStoreResponse>)?.data || data;
        if (isMounted) setStore(storeData as StorefrontStoreResponse);
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
): { products: StorefrontProduct[]; isLoading: boolean; error: string | null } {
  const [products, setProducts] = useState<StorefrontProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
        const data = await apiJson<StorefrontProduct[] | { data: StorefrontProduct[] }>(
          `/api/storefront/${slug}/products?${query.toString()}`,
        );
        const productsData = (data as ApiResponse<StorefrontProduct[]>)?.data || data || [];
        if (isMounted) setProducts(productsData as StorefrontProduct[]);
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
