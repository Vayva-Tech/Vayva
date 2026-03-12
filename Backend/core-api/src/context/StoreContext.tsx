"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { logger, ProductServiceItem } from "@vayva/shared";
import { useCart, UseCartReturn } from "@/hooks/useCart";
import { useCheckout, CheckoutMode } from "@/hooks/useCheckout";
import { Store } from "@/lib/templates/types";
import { toast } from "sonner";

// -- Test Types until Shared is fully updated --
interface StoreMerchant {
  id: string;
  name: string;
  phone: string;
  currency: string;
}

interface StoreContextType {
  // State
  isLoading: boolean;
  products: ProductServiceItem[];
  merchant: StoreMerchant | null;
  store: Store | null; // Full store object including template settings
  currency: string;

  // Cart (Directly exposed from hook)
  cart: UseCartReturn["cart"];
  addToCart: UseCartReturn["addToCart"];
  removeFromCart: UseCartReturn["removeFromCart"];
  updateQuantity: UseCartReturn["updateQuantity"];
  clearCart: UseCartReturn["clearCart"];
  cartTotal: UseCartReturn["cartTotal"];
  itemCount: UseCartReturn["itemCount"];
  isCartOpen: boolean;
  toggleCart: (open?: boolean) => void;

  // Actions
  checkout: (mode: CheckoutMode) => Promise<void>;
  isCheckoutProcessing: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

interface StoreProviderProps {
  children: React.ReactNode;
  demoMode?: boolean;
  merchantId?: string; // If null, derives from session (or test in demo)
}

import { apiJson } from "@/lib/api-client-shared";

interface MerchantMeResponse {
  data?: {
    merchant?: {
      id: string;
      phone: string;
    };
    store?: Store;
  };
  merchant?: {
    id: string;
    phone: string;
  };
  store?: Store;
}

export const StoreProvider = ({
  children,
  demoMode: demoModeProp = false,
  merchantId,
}: StoreProviderProps) => {
  // Never allow demoMode in production — prevents hardcoded test_mer_1 from leaking
  const demoMode = process.env.NODE_ENV === "production" ? false : demoModeProp;

  const [products, setProducts] = useState<ProductServiceItem[]>([]);
  const [merchant, setMerchant] = useState<StoreMerchant | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Initial Context Setup
  const derivedMerchantId = merchantId || (demoMode ? "test_mer_1" : undefined);

  // Hooks
  const cart = useCart(derivedMerchantId);
  const checkoutHook = useCheckout({
    merchantPhone: merchant?.phone,
  });

  // Load Data
  useEffect(() => {
    const initStore = async () => {
      setIsLoading(true);
      try {
        if (demoMode) {
          // Load Tests
          const storeProducts = await apiJson<ProductServiceItem[]>(
            "/api/products/items",
          );
          setProducts(storeProducts || []);
          setMerchant({
            id: "test_mer_1",
            name: "Demo Merchant Store",
            phone: "2348000000000",
            currency: "NGN",
          });
        } else {
          // Load Real Data
          const [fetchedProducts, merchantInfo] = await Promise.all([
            apiJson<ProductServiceItem[]>("/api/products/items").catch(
              () => [] as ProductServiceItem[],
            ),
            apiJson<MerchantMeResponse>("/api/auth/merchant/me").catch(
              () => null,
            ),
          ]);

          setProducts(fetchedProducts || []);

          const payload = merchantInfo?.data || merchantInfo;
          const merchantPayload = payload?.merchant;
          const storePayload = payload?.store;

          if (merchantPayload) {
            setMerchant({
              id: merchantPayload.id,
              name: storePayload?.name || "My Store",
              phone: merchantPayload.phone || "",
              currency: storePayload?.currency || "NGN",
            });
            setStore(storePayload || null);
          } else {
            // Fallback if fetch fails but we are not in demo (should ideally logout)
            setMerchant({
              id: "real_mer_1",
              name: "My Store",
              phone: "",
              currency: "NGN",
            });
            setStore(null);
          }
        }
      } catch (e: unknown) {
        const _errMsg = e instanceof Error ? e.message : String(e);
        logger.error("[STORE_CONTEXT_INIT_ERROR]", {
          error: _errMsg,
          app: "merchant",
        });
      } finally {
        setIsLoading(false);
      }
    };

    void initStore();
  }, [demoMode, derivedMerchantId]);

  const handleCheckout = async (mode: CheckoutMode) => {
    if (demoMode) {
      toast.message(
        "Demo Mode: Checkout is disabled. In a live store, this would process the order.",
      );
      return;
    }
    await checkoutHook.checkout(mode, cart.cart, cart.cartTotal);
  };

  return (
    <StoreContext.Provider
      value={{
        isLoading,
        products,
        merchant,
        store,
        currency: merchant?.currency || "NGN",

        // Cart
        cart: cart.cart,
        addToCart: cart.addToCart,
        removeFromCart: cart.removeFromCart,
        updateQuantity: cart.updateQuantity,
        clearCart: cart.clearCart,
        cartTotal: cart.cartTotal,
        itemCount: cart.itemCount,
        isCartOpen,
        toggleCart: (open) => setIsCartOpen(open ?? !isCartOpen),

        // Checkout
        checkout: handleCheckout,
        isCheckoutProcessing: checkoutHook.isProcessing,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};
