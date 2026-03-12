"use client";

import React, { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/Skeletons";
import { reportError } from "@/lib/error";
import { useStore } from "@/context/StoreContext";

interface Product {
  id: string;
  name: string;
  handle: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  images: string[];
  url: string;
}

interface ProductGridProps {
  collection?: string;
  limit?: number;
  sort?: string;
}

export default function ProductGrid({
  collection,
  limit = 8,
  sort = "newest",
}: ProductGridProps) {
  const { store } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url = new URL("/api/storefront/products", window.location.origin);
        if (collection) url.searchParams.set("collection", collection);
        if (limit) url.searchParams.set("limit", limit.toString());
        if (sort) url.searchParams.set("sort", sort);

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error("Failed to fetch products");

        const data = await res.json();
        setProducts(data.data || []);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: unknown) {
        reportError(err, {
          scope: "CommerceBlock.ProductGrid.fetchProducts",
          app: "storefront",
        });
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [collection, limit, sort]);

  if (loading) return <ProductGridSkeleton />;

  if (error) {
    return (
      <div className="p-8 rounded-3xl border border-red-100 bg-red-50/50 text-center">
        <p className="text-sm font-bold text-red-600">
          This section couldn't load.
        </p>
        <p className="text-[10px] text-red-400 mt-1">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-12 text-center border border-dashed border-border/60 rounded-[32px]">
        <p className="text-sm text-text-tertiary">
          No products found in this collection.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          storeSlug={store?.slug || ""}
          product={{
            ...product,
            storeId: store?.id || "",
            variants: [],
            inStock: true,
            images: product.images,
          }}
        />
      ))}
    </div>
  );
}
