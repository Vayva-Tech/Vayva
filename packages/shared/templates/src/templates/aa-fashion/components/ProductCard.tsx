import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Check } from "lucide-react";
import { Button } from "@vayva/ui";
import { PublicProduct } from "@vayva/templates/types/storefront";
import { useStore } from "@vayva/templates/context/StoreContext";

interface ProductCardProps {
  product: PublicProduct;
  storeSlug?: string;
}

export const ProductCard = ({
  product,
  storeSlug = "#",
}: ProductCardProps): React.JSX.Element => {
  const { addToCart } = useStore();
  const [added, setAdded] = React.useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart({
      productId: product.id,
      variantId: "default",
      productName: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0],
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Link
      href={`/products/${product.id}?store=${storeSlug}`}
      className="group block"
    >
      <div className="relative aspect-[3/4] bg-background/50 backdrop-blur-sm rounded-2xl overflow-hidden mb-3">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Quick Add Button */}
        <Button
          size="icon"
          className={`absolute bottom-3 right-3 p-2 rounded-full shadow-lg transition-all duration-300 h-auto ${added ? "bg-green-500 text-white" : "bg-transparent text-black hover:bg-black hover:text-white"}`}
          onClick={handleAdd}
          aria-label={
            added ? "Product added to cart" : `Add ${product.name} to cart`
          }
        >
          {added ? (
            <Check size={18} strokeWidth={2.5} />
          ) : (
            <Plus size={18} strokeWidth={2.5} />
          )}
        </Button>
      </div>

      <div className="space-y-1">
        <h3 className="font-medium text-[#111111] text-sm leading-tight line-clamp-2 min-h-[2.5em]">
          {product.name}
        </h3>
        <p className="font-bold text-[#111111] text-sm">
          ₦{product.price.toLocaleString()}
        </p>
      </div>
    </Link>
  );
};
