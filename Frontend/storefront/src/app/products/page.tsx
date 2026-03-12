"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@vayva/ui";
import { StoreShell } from "@/components/StoreShell";
import { ProductCard } from "@/components/ProductCard";
import { useStore } from "@/context/StoreContext";
import { StorefrontService } from "@/services/storefront.service";
import { PublicProduct } from "@/types/storefront";
import { ProductGridSkeleton } from "@/components/Skeletons";

export default function ProductsPage(): React.JSX.Element {
  const { store } = useStore();
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    if (store) {
      const load = async () => {
        const data = await StorefrontService.getProducts(store.id);
        setProducts(data);
        setLoading(false);
      };
      load();
    }
  }, [store]);

  const categories = [
    "all",
    ...Array.from(
      new Set(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        products
          .map((p: any) => p.category)
          .filter((cat): cat is string => !!cat),
      ),
    ),
  ];

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  if (!store) return <></>;

  return (
    <StoreShell>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              All Products
            </h1>
            <p className="text-gray-500">
              Showing {filteredProducts.length} items
            </p>
          </div>

          {/* Simple Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat: any) => (
              <Button
                key={cat}
                onClick={() => setSelectedCategory(cat as string)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <ProductGridSkeleton />
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {filteredProducts.map((product: any) => (
              <ProductCard
                key={product.id}
                product={product}
                storeSlug={store.slug}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-40 border border-dashed border-gray-200 rounded-2xl">
            <p className="text-gray-500">
              No products found for this selection.
            </p>
            <Button
              onClick={() => setSelectedCategory("all")}
              className="mt-4 text-sm font-bold underline"
            >
              View all products
            </Button>
          </div>
        )}
      </div>
    </StoreShell>
  );
}
