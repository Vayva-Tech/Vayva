import React from "react";
import { ProductServiceItem } from "@vayva/shared";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  items: ProductServiceItem[];
  isLoading: boolean;
}

export const ProductGrid = ({ items, isLoading }: ProductGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-[280px] bg-white/40 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 bg-white/40 rounded-2xl border border-dashed border-border">
        <h3 className="text-lg font-bold text-text-primary">No items found</h3>
        <p className="text-text-tertiary">
          Get started by adding your first product or service.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {items.map((item) => (
        <ProductCard key={item.id} item={item} />
      ))}
    </div>
  );
};
