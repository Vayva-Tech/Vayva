/* eslint-disable @typescript-eslint/no-explicit-any */
import { logger } from "@vayva/shared";
import { useState, useEffect, useCallback } from "react";

const CART_STORAGE_KEY = "vayva_store_cart";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  options?: Record<string, any>;
}

export interface UseCartReturn {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
}

export const useCart = (merchantId: string | undefined): UseCartReturn => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initial Load
  useEffect(() => {
    if (!merchantId) return;
    const key = `${CART_STORAGE_KEY}_${merchantId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setCart(JSON.parse(stored));
      } catch (e) {
        logger.error("Failed to parse cart", {
          error: (e as Error).message,
          app: "merchant",
        });
      }
    }
    setIsInitialized(true);
  }, [merchantId]);

  // Persist Change
  useEffect(() => {
    if (!isInitialized || !merchantId) return;
    const key = `${CART_STORAGE_KEY}_${merchantId}`;
    localStorage.setItem(key, JSON.stringify(cart));
  }, [cart, isInitialized, merchantId]);

  const addToCart = useCallback((newItem: CartItem) => {
    setCart((prev) => {
      // Check for existing identical item (same product + options)
      const existingIndex = prev.findIndex(
        (item) =>
          item.productId === newItem.productId &&
          JSON.stringify(item.options || {}) ===
            JSON.stringify(newItem.options || {}),
      );
      if (existingIndex > -1) {
        const newCart = [...prev];
        newCart[existingIndex].quantity += newItem.quantity;
        return newCart;
      }
      return [
        ...prev,
        {
          ...newItem,
          id: `cart_${Date.now()}_${crypto.randomUUID().split("-")[0]}`,
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = Math.max(0, item.quantity + delta);
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartTotal = cart.reduce((sum: number, item) => sum + item.price * item.quantity,
    0,
  );
  const itemCount = cart.reduce((sum: number, item) => sum + item.quantity, 0);

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    itemCount,
  };
};
