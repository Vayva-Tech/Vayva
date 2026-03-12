import React from "react";
import Link from "next/link";
import { Button, Icon } from "@vayva/ui";
import { toast } from "sonner";

export interface MarketProduct {
  id: string;
  name: string;
  price: string;
  image: string;
  sellerName: string;
  sellerVerified?: boolean;
  rating?: number;
  inStock: boolean;
}

interface MarketProductCardProps {
  product: MarketProduct;
}

export function MarketProductCard({ product }: MarketProductCardProps) {
  return (
    <div className="group relative">
      <Link href={`/market/products/${product.id}`} className="block">
        <div className="aspect-[4/5] w-full overflow-hidden rounded-xl bg-background/5 relative border border-white/5">
          {/* Image Placeholder */}
          <div className="absolute inset-0 flex items-center justify-center text-white/10 group-hover:scale-105 transition-transform duration-500 bg-[#0b141a]">
            {product.image ? (
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${product.image})` }}
              />
            ) : (
              <Icon name="Image" size={48} />
            )}
          </div>

          {/* Seller Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur px-2 py-1 rounded-full border border-white/10">
            <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-[8px] font-bold text-white">
              {product.sellerName.charAt(0)}
            </div>
            <span className="text-[10px] text-white font-medium">
              {product.sellerName}
            </span>
            {product.sellerVerified && (
              <Icon name="ShieldCheck" size={12} className="text-blue-400" />
            )}
          </div>

          {!product.inStock && (
            <div className="absolute top-3 right-3 px-2 py-1 bg-red-500/80 backdrop-blur rounded text-[10px] font-bold text-white uppercase tracking-wider">
              Sold Out
            </div>
          )}

          {/* Quick Add Overlay */}
          <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
            <Button
              className="w-full h-9 bg-primary text-black font-bold shadow-lg hover:bg-primary/90 border-none text-xs rounded-full"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                toast.success("Added to cart!");
              }}
            >
              <Icon name="ShoppingCart" size={16} className="mr-1" /> Add
            </Button>
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-sm font-medium text-white group-hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
          <div className="flex items-center justify-between mt-1">
            <span className="font-bold text-white">{product.price}</span>
            {product.rating && (
              <div className="flex items-center gap-1 text-[10px] text-text-secondary">
                <Icon name="Star" size={12} className="text-yellow-400" />
                <span>{product.rating}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
