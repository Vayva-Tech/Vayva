"use client";

import React, { useEffect, useState, useRef } from "react";

import { ProductCard } from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/Skeletons";
import { reportError } from "@/lib/error";
import { useStore } from "@/context/StoreContext";
import { Button } from "@vayva/ui";

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

interface ProductCarouselProps {
  collection?: string;
  limit?: number;
}

export default function ProductCarousel({
  collection,
  limit = 10,
}: ProductCarouselProps) {
  const { store } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url = new URL("/api/storefront/products", window.location.origin);
        if (collection) url.searchParams.set("collection", collection);
        if (limit) url.searchParams.set("limit", limit.toString());

        const res = await fetch(url.toString());
        const data = await res.json();
        setProducts(data.data || []);
      } catch (err: unknown) {
        reportError(err, {
          scope: "CommerceBlock.ProductCarousel.fetchProducts",
          app: "storefront",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [collection, limit]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo =
        direction === "left"
          ? scrollLeft - clientWidth
          : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  if (loading) return <ProductGridSkeleton />;
  if (products.length === 0) return null;

  return (
    <div className="relative group/carousel">
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-4"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="min-w-[280px] sm:min-w-[320px] snap-start"
          >
            <ProductCard
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
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <Button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 rounded-full bg-white shadow-xl border border-border/40 flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity z-10 hover:bg-primary/5 hover:text-primary"
        aria-label="Scroll left"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </Button>
      <Button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 rounded-full bg-white shadow-xl border border-border/40 flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity z-10 hover:bg-primary/5 hover:text-primary"
        aria-label="Scroll right"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </Button>
    </div>
  );
}
