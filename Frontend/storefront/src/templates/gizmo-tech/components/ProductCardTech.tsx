import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Check } from "@phosphor-icons/react/ssr";
import { Button } from "@vayva/ui";
import { PublicProduct } from "@/types/storefront";
import { useStore } from "@/context/StoreContext";

interface ProductCardTechProps {
  product: PublicProduct;
  storeSlug?: string;
  variant?: "grid" | "carousel";
}

export const ProductCardTech = ({
  product,
  storeSlug = "#",
  variant = "grid",
}: ProductCardTechProps) => {
  const { addToCart } = useStore();
  const [added, setAdded] = React.useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart({
      productId: product.id,
      variantId: "default",
      productName: product.name || "Product",
      price: product.price || 0,
      quantity: 1,
      image: product.images?.[0] || "/placeholder.png",
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const cardWidth =
    variant === "carousel" ? "w-[160px] md:w-[200px] flex-shrink-0" : "w-full";

  return (
    <Link
      href={`/product/${product.id}?store=${storeSlug}`}
      className={`group block ${cardWidth}`}
    >
      <div className="relative aspect-square bg-background/40 backdrop-blur-sm rounded-xl overflow-hidden mb-3 border border-gray-100">
        <Image
          src={product.images?.[0] || "/placeholder.png"}
          alt={product.name || "Product"}
          fill
          className="object-cover p-2 group-hover:scale-105 transition-transform duration-500 mix-blend-multiply"
        />

        {/* Techy Badge for Stock if low/out */}
        {!product.inStock && (
          <div className="absolute top-2 left-2 bg-gray-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
            Out of Stock
          </div>
        )}

        {/* Quick Add Button - Bottom Right */}
        <Button
          variant="ghost"
          size="icon"
          className={`absolute bottom-2 right-2 p-2 rounded-lg transition-all duration-300 shadow-sm border h-auto ${added ? "bg-green-500 text-white border-green-500" : "bg-transparent text-blue-600 border-gray-200 hover:bg-blue-600 hover:text-white hover:border-blue-600"}`}
          onClick={handleAdd}
          aria-label={added ? "Added to cart" : `Add ${product.name || "Product"} to cart`}
        >
          {added ? (
            <Check size={16} strokeWidth={3} />
          ) : (
            <Plus size={16} strokeWidth={3} />
          )}
        </Button>
      </div>

      <div className="space-y-1">
        <h3 className="font-semibold text-[#0B0F19] text-sm leading-tight line-clamp-2 min-h-[2.5em] group-hover:text-blue-600 transition-colors">
          {product.name || "Product"}
        </h3>
        <div className="flex items-center justify-between">
          <p className="font-bold text-[#0B0F19] text-sm">
            ₦{(product as any)?.price?.toLocaleString()}
          </p>
          {/* Optional specs badge if space allows */}
          {product.specs && product.specs[0] && (
            <span className="text-[10px] text-gray-500 bg-background/50 backdrop-blur-sm px-1 rounded truncate max-w-[60px]">
              {product.specs[0].value}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};
