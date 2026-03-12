import React from "react";
import NextLink from "next/link";
const Link = NextLink;
import Image from "next/image";
import { PublicProduct } from "@/types/storefront";
import { Clock, Fire as Flame } from "@phosphor-icons/react/ssr";
import { Button } from "@vayva/ui";

interface FoodProductCardProps {
  product: PublicProduct;
  storeSlug: string;
}

export function FoodProductCard({
  product,
  storeSlug,
}: FoodProductCardProps): React.JSX.Element {
  const metadata = product.metadata as Record<string, string>; // Safe cast for variant fields

  return (
    <div className="flex gap-4 border-b border-gray-100 py-4 group">
      <Link
        href={`/products/${product.id}?store=${storeSlug}`}
        className="relative h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100"
      >
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name || "Product"}
            fill
            sizes="96px"
            className="object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
            No Image
          </div>
        )}
      </Link>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <Link href={`/products/${product.id}?store=${storeSlug}`}>
              <h3 className="font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
                {product.name}
              </h3>
            </Link>
            <span className="font-bold text-sm">
              ₦{product.price?.toLocaleString() || 0}
            </span>
          </div>
          <p className="text-sm text-gray-500 line-clamp-2 mt-1">
            {product.description}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
          {metadata?.prepTimeMinutes && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{metadata.prepTimeMinutes}m</span>
            </div>
          )}
          {metadata?.spiceLevel && metadata.spiceLevel !== "MILD" && (
            <div className="flex items-center gap-1 text-red-500">
              <Flame className="w-3 h-3" />
              <span>{metadata.spiceLevel}</span>
            </div>
          )}
          {metadata?.isVegetarian && (
            <span className="px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
              Veg
            </span>
          )}
        </div>
      </div>

      <Button
        variant="outline"
        size="icon"
        className="flex items-center justify-center h-8 w-8 rounded-full border border-gray-200 text-gray-600 hover:bg-amber-600 hover:text-white hover:border-amber-600 transition-all self-center h-auto"
        aria-label={`Add ${product.name} to cart`}
      >
        +
      </Button>
    </div>
  );
}
