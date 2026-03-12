import React from "react";
import { ProductCard } from "./ProductCard";
import { PublicProduct } from "@vayva/templates/types/storefront";

import { Skeleton } from "@vayva/templates/components/ui/skeleton";

interface ProductGridProps {
  products: PublicProduct[];
  storeSlug?: string;
  loading?: boolean;
}

export const ProductGrid = ({
  products,
  storeSlug,
  loading,
}: ProductGridProps): React.JSX.Element => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 px-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-4 w-2/3 rounded-lg" />
            <Skeleton className="h-4 w-1/3 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 px-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} storeSlug={storeSlug} />
      ))}
    </div>
  );
};
