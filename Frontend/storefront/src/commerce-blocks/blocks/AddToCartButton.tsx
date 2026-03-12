"use client";

import React, { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { toast } from "sonner";
import { Button } from "@vayva/ui";

interface AddToCartButtonProps {
  productId: string;
  variantId?: string;
  label?: string;
  className?: string;
}

export default function AddToCartButton({
  productId,
  variantId = "default",
  label = "Add to Cart",
  className,
}: AddToCartButtonProps) {
  const { addToCart } = useStore();
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    setLoading(true);
    try {
      // Fetch basic product info for the cart record
      const res = await fetch(
        `/api/storefront/products?limit=1&id=${productId}`,
      );
      const data = await res.json();
      const product = data.data?.[0];

      if (!product) throw new Error("Product not found");

      addToCart({
        productId,
        variantId,
        productName: product.name,
        price: product.price,
        quantity: 1,
        image: product.images?.[0],
      });

      toast.success(`${product.name} added to cart!`);
    } catch {
      toast.error("Could not add to cart");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleAdd}
      disabled={loading}
      className={
        className ||
        "px-8 h-14 bg-primary text-white rounded-full font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary-hover active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
      }
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 (5 as any)?.291A7?.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      )}
      <span>{label}</span>
    </Button>
  );
}
