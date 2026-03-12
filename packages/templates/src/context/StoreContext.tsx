/* eslint-disable */
// @ts-nocheck
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { StorefrontService } from "@vayva/templates/services/storefront.service";
import { PublicStore, CartItem } from "@vayva/templates/types/storefront";

export type { CartItem };

interface StoreContextType {
  store: PublicStore | null;
  isLoading: boolean;
  error: string | null;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
}

const StoreContext = createContext<StoreContextType>({
  store: null,
  isLoading: true,
  error: null,
  cart: [],
  addToCart: () => { },
  removeFromCart: () => { },
  clearCart: () => { },
});

export const useStore = () => useContext(StoreContext);

export function StoreProvider({
  children,
  initialStore = null
}: {
  children: React.ReactNode;
  initialStore?: PublicStore | null;
}): React.JSX.Element {
  const searchParams = useSearchParams();
  const [store, setStore] = useState<PublicStore | null>(initialStore);
  const [isLoading, setIsLoading] = useState(!initialStore);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load Cart from LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("vayva_cart");
      if (saved) {
        try {
          setTimeout(() => setCart(JSON.parse(saved)), 0);
        } catch (e: unknown) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          console.error("Failed to parse cart", e as any);
        }
      }
    }
  }, []);

  // Save Cart to LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("vayva_cart", JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find(
        (i) => i.productId === item.productId && i.variantId === item.variantId,
      );
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId && i.variantId === item.variantId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i,
        );
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clearCart = () => setCart([]);

  useEffect(() => {
    // If we have an initial store from SSR, skip client fetching
    if (initialStore) {
      setStore(initialStore);
      setIsLoading(false);
      return;
    }

    const initStore = async () => {
      // 1. Logic to determine slug
      // Prod: subdomain (e.g. demo.vayva.shop -> demo)
      // Dev: query param (e.g. localhost:3001/?store=demo -> demo)

      let slug = searchParams.get("store");

      if (!slug && typeof window !== "undefined") {
        const hostname = window.location.hostname;
        if (hostname.includes(".vayva.shop")) {
          slug = hostname.split(".")[0];
        }
      }

      if (slug) {
        try {
          const data = await StorefrontService.getStore(slug);
          if (data) {
            setStore(data);
          } else {
            setError("Store not found");
          }
        } catch (err: unknown) {
          setError("Failed to load store");
        }
      }
      setIsLoading(false);
    };

    initStore();
  }, [searchParams, initialStore]);

  // LIVE PREVIEW SYNCING (For Merchant Admin Designer)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "VAYVA_PREVIEW_UPDATE") {
        setStore((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            theme: {
              ...prev.theme,
              theme: event.data.config, // Sync the nested theme config
              // Or if your schema puts it top level:
              ...event.data.config
            }
          };
        });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <StoreContext.Provider
      value={{
        store,
        isLoading,
        error,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}
