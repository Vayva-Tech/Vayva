"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface Store {
  id: string;
  name: string;
  slug: string;
  industry?: string;
  tagline?: string;
  settings?: Record<string, unknown>;
  theme?: {
    templateId?: string;
    primaryColor?: string;
    accentColor?: string;
    oneProductConfig?: {
      upsellProductId?: string;
    };
  };
  contact?: {
    email?: string;
    phone?: string;
    whatsapp?: string;
  };
  policies?: {
    shipping?: string;
    returns?: string;
    privacy?: string;
  };
  plan?: "FREE" | "STARTER" | "PRO";
}

interface CartItem {
  productId: string;
  variantId?: string;
  productName: string;
  price: number;
  quantity: number;
  image?: string;
}

interface StoreContextType {
  store: Store | null;
  isLoading: boolean;
  error: Error | null;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
}

const StoreContext = createContext<StoreContextType>({
  store: null,
  isLoading: false,
  error: null,
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
});

export function StoreProvider({ 
  children, 
  initialStore 
}: { 
  children: ReactNode; 
  initialStore?: Store | null;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  return (
    <StoreContext.Provider 
      value={{ 
        store: initialStore || null, 
        isLoading: false, 
        error: null,
        cart,
        addToCart,
        removeFromCart,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
