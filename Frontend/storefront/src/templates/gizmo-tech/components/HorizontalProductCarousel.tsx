import React from "react";
import { ProductCardTech } from "./ProductCardTech";
import { PublicProduct } from "@/types/storefront";

interface HorizontalProductCarouselProps {
  products: PublicProduct[];
  storeSlug?: string;
}

export const HorizontalProductCarousel = ({
  products,
  storeSlug,
}: HorizontalProductCarouselProps) => {
  return (
    <div className="flex overflow-x-auto gap-4 px-4 pb-6 pt-2 scrollbar-hide snap-x snap-mandatory">
      {products.map((product: any) => (
        <div key={product.id} className="snap-start">
          <ProductCardTech
            product={product}
            storeSlug={storeSlug}
            variant="carousel"
          />
        </div>
      ))}
    </div>
  );
};
