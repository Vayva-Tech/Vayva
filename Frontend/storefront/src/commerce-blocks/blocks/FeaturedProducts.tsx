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

interface FeaturedProductsProps {
  productIds?: string;
  tag?: string;
}

export default function FeaturedProducts({
  productIds,
  tag,
}: FeaturedProductsProps) {
  const { store } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url = new URL(
          "/api/storefront/products/featured",
          window.location.origin,
        );
        if (productIds) url.searchParams.set("productIds", productIds);
        if (tag) url.searchParams.set("tag", tag);

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error("Failed to fetch featured products");

        const data = await res.json();
        setProducts(data.data || []);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: unknown) {
        reportError(err, {
          scope: "CommerceBlock.FeaturedProducts.fetchProducts",
          app: "storefront",
        });
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [productIds, tag]);

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
          No featured products found.
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
            compareAtPrice: product.compareAtPrice ?? undefined,
          }}
        />
      ))}
    </div>
  );
}
