"use client";

import React, { useState } from "react";
import Image from "next/image";
import { PublicProduct } from "@/types/storefront";
import { useStore } from "@/context/StoreContext";
import { Clock, Fire as Flame, Check } from "@phosphor-icons/react/ssr";
import { Button } from "@vayva/ui";

interface FoodPDPProps {
  product: PublicProduct;
}

export function FoodPDP({ product }: FoodPDPProps): React.JSX.Element {
  const { addToCart } = useStore();
  const [quantity, setQuantity] = useState(1);
  const metadata = product.metadata as Record<string, string>;

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      variantId: product.id, // Simplified
      productName: product.name || "Product",
      price: product.price || 0,
      quantity,
      image: product.images?.[0] || "/placeholder.png",
    });
  };

  return (
    <div className="grid md:grid-cols-2 gap-10">
      <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name || "Product"}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            No Image
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{product.name || "Product"}</h1>
          <p className="text-xl font-medium text-gray-900 mt-2">
            ₦{((product as any)?.price || 0).toLocaleString()}
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          {metadata?.prepTimeMinutes && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full text-sm">
              <Clock className="w-4 h-4 text-gray-500" />
              <span>{metadata.prepTimeMinutes} mins prep</span>
            </div>
          )}
          {metadata?.spiceLevel && metadata.spiceLevel !== "MILD" && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-sm">
              <Flame className="w-4 h-4" />
              <span>{metadata.spiceLevel} Spicy</span>
            </div>
          )}
          {metadata?.isVegetarian && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm">
              <Check className="w-4 h-4" />
              <span>Vegetarian</span>
            </div>
          )}
        </div>

        <div className="prose text-gray-600">{product.description}</div>

        {/* Modifiers / Add-ons would go here */}

        <div className="flex items-center gap-4 pt-6 border-t">
          <div className="flex items-center border border-gray-300 rounded-lg">
            <Button
              variant="ghost"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-4 py-2 hover:bg-gray-50 h-auto"
              aria-label="Decrease quantity"
            >
              -
            </Button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <Button
              variant="ghost"
              onClick={() => setQuantity(quantity + 1)}
              className="px-4 py-2 hover:bg-gray-50 h-auto"
              aria-label="Increase quantity"
            >
              +
            </Button>
          </div>

          <Button
            onClick={handleAddToCart}
            className="flex-1 bg-amber-600 text-white py-3 rounded-lg font-bold hover:bg-amber-700 transition-colors h-auto"
            aria-label={`Add ${product.name || "Product"} to order for ₦${((product.price || 0) * quantity).toLocaleString()}`}
          >
            Add to Order - ₦{((product.price || 0) * quantity).toLocaleString()}
          </Button>
        </div>
      </div>
    </div>
  );
}
