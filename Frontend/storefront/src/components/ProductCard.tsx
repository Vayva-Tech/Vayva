import React from "react";
import NextLink from "next/link";
const Link = NextLink;
import Image from "next/image";
import { PublicProduct } from "@/types/storefront";
import { useStore } from "@/context/StoreContext";
import { FoodProductCard } from "./FoodProductCard";
import { ServiceCard } from "./ServiceCard";

interface ProductCardProps {
  product: PublicProduct;
  storeSlug: string;
}

export function ProductCard({
  product,
  storeSlug,
}: ProductCardProps): React.JSX.Element {
  const { store } = useStore();
  const industry = store?.industry || "RETAIL"; // Default to retail

  // Variant Routing
  if (industry.startsWith("FOOD") || industry === "RESTAURANT") {
    return <FoodProductCard product={product} storeSlug={storeSlug} />;
  }

  if (
    industry === "SERVICES" ||
    industry === "BEAUTY" ||
    industry === "CLINIC"
  ) {
    return <ServiceCard product={product} storeSlug={storeSlug} />;
  }

  // Standard Retail Card
  return (
    <Link
      href={`/products/${product.id}?store=${storeSlug}`}
      className="group block"
    >
      <div className="relative aspect-[4/5] bg-gray-100 rounded-xl overflow-hidden mb-4">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name || "Product"}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            No Image
          </div>
        )}
        {!product.inStock && (
          <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm">
            Sold Out
          </div>
        )}
      </div>

      <h3 className="font-medium text-sm group-hover:text-gray-600 transition-colors">
        {product.name || "Product"}
      </h3>
      <div className="flex items-center gap-2 mt-1">
        <span className="font-bold text-sm">
          ₦{(product.price || 0).toLocaleString()}
        </span>
        {product.compareAtPrice && product.compareAtPrice > (product.price || 0) && (
          <span className="text-xs text-gray-400 line-through">
            ₦{product.compareAtPrice.toLocaleString()}
          </span>
        )}
      </div>
    </Link>
  );
}
