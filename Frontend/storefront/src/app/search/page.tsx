"use client";

import React, { useEffect, useState } from "react";
import { StoreShell } from "@/components/StoreShell";
import { ProductCard } from "@/components/ProductCard";
import { useStore } from "@/context/StoreContext";
import { StorefrontService } from "@/services/storefront.service";
import { PublicProduct } from "@/types/storefront";
import { useSearchParams } from "next/navigation";

export default function SearchPage(): React.JSX.Element {
  const { store } = useStore();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (store) {
      const load = async () => {
        const data = await StorefrontService.getProducts(store.id);
        // Client-side filter for test
        const filtered = data.filter((p: any) =>
          p.name.toLowerCase().includes(query.toLowerCase()),
        );
        setProducts(filtered);
        setLoading(false);
      };
      load();
    }
  }, [store, query]);

  if (!store) return <></>;

  return (
    <StoreShell>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Search Results: "{query}"</h1>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i: any) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-100 aspect-[4/5] rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-100 w-2/3 rounded mb-2"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {products.map((product: any) => (
              <ProductCard
                key={product.id}
                product={product}
                storeSlug={store.slug}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-gray-200 rounded-xl">
            <p className="text-gray-500">
              No products found matching your search.
            </p>
          </div>
        )}
      </div>
    </StoreShell>
  );
}
