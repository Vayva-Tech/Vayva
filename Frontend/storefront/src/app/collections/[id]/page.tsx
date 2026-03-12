"use client";

import React, { useEffect, useState } from "react";
import { StoreShell } from "@/components/StoreShell";
import { ProductCard } from "@/components/ProductCard";
import { useStore } from "@/context/StoreContext";
import { StorefrontService } from "@/services/storefront.service";
import { PublicProduct } from "@/types/storefront";
import { useParams } from "next/navigation";
import NextLink from "next/link";
const Link = NextLink;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function CollectionPage(_props: any): React.JSX.Element {
  const { store } = useStore();
  const { id } = useParams() as { id: string };
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (store) {
      const load = async () => {
        // In real app, filter by collection ID (id)
        const data = await StorefrontService.getProducts(store.id);
        setProducts(data);
        setLoading(false);
      };
      load();
    }
  }, [store, id]);

  if (!store) return <></>;

  const collectionName =
    id === "all"
      ? "All Products"
      : id === "new"
        ? "New Arrivals"
        : "Collection";

  return (
    <StoreShell>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">{collectionName}</h1>
          <span className="text-sm text-gray-500">
            {products.length} products
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i: any) => (
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
              No products found in this collection.
            </p>
            <Link
              href={`/?store=${store.slug}`}
              className="text-blue-600 mt-4 inline-block hover:underline"
            >
              Return Home
            </Link>
          </div>
        )}
      </div>
    </StoreShell>
  );
}
