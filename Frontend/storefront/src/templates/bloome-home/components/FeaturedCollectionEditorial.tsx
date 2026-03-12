import React from "react";
import { ProductCardEditorial } from "./ProductCardEditorial";
import { PublicProduct } from "@/types/storefront";

interface FeaturedCollectionEditorialProps {
  title: string;
  products: PublicProduct[];
  storeSlug?: string;
}

export const FeaturedCollectionEditorial = ({
  title,
  products,
  storeSlug,
}: FeaturedCollectionEditorialProps) => {
  return (
    <section className="py-20 px-6">
      <div className="text-center mb-16">
        <h3 className="font-serif text-3xl text-[#2E2E2E] tracking-wide mb-4 relative inline-block">
          {title}
          {/* Decorative underline */}
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-[1px] bg-[#C9B7A2]"></span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {products.map((product: any) => (
          <ProductCardEditorial
            key={product.id}
            product={product}
            storeSlug={storeSlug}
          />
        ))}
      </div>
    </section>
  );
};
