import React from "react";
import Image from "next/image";
import Link from "next/link";
import { PublicProduct } from "@vayva/templates/types/storefront";

interface ProductCardEditorialProps {
  product: PublicProduct;
  storeSlug?: string;
}

export const ProductCardEditorial = ({
  product,
  storeSlug = "#",
}: ProductCardEditorialProps) => {
  // Determine badge content
  let badge = null;
  if (product.subscriptionOptions?.available) {
    badge = "Subscribe";
  } else if (!product.inStock) {
    badge = "Sold Out";
  }

  return (
    <Link
      href={`/product/${product.id}?store=${storeSlug}`}
      className="group block text-center"
    >
      <div className="relative aspect-[3/4] bg-[#F5F5F0] overflow-hidden mb-4">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Minimal Badge */}
        {badge && (
          <div className="absolute top-4 left-4 bg-transparent/90 backdrop-blur px-2 py-1 text-[10px] uppercase tracking-wider text-[#2E2E2E]">
            {badge}
          </div>
        )}
      </div>

      <div className="space-y-2 px-2">
        <h3 className="font-serif text-lg text-[#2E2E2E] group-hover:text-[#C9B7A2] transition-colors duration-300">
          {product.name}
        </h3>
        {/* Ingredients snippet if available */}
        {product.ingredients && (
          <p className="text-[10px] text-gray-400 uppercase tracking-widest truncate max-w-[200px] mx-auto">
            {product.ingredients.split(",")[0]}
          </p>
        )}
        <p className="font-medium text-[#2E2E2E] text-sm">
          ₦{product.price.toLocaleString()}
        </p>
      </div>
    </Link>
  );
};
