import { PublicStore, PublicProduct, PublicOrder } from "@vayva/templates/types/storefront";
import { reportError } from "@vayva/templates/lib/error";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

export const StorefrontService = {
  /**
   * Get Store Details by Slug
   */
  getStore: async (slug: string): Promise<PublicStore | null> => {
    try {
      const response = await fetch(`${API_BASE}/stores/${slug}`);
      if (response.ok) return await response.json();
      return null;
    } catch (e) {
      reportError(e, { method: "getStore", slug });
      return null;
    }
  },

  /**
   * Get Products for a Store
   */
  getProducts: async (storeId: string): Promise<PublicProduct[]> => {
    try {
      const response = await fetch(`${API_BASE}/products?storeId=${storeId}`, {
        next: { revalidate: 60 },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      if (response.ok) return await response.json();
      return [];
    } catch (e) {
      reportError(e, { method: "getProducts", storeId });
      return [];
    }
  },

  /**
   * Single product detail
   */
  getProduct: async (id: string): Promise<PublicProduct | null> => {
    try {
      const response = await fetch(`${API_BASE}/products/${id}`, {
        next: { revalidate: 3600 },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      if (response.ok) return await response.json();
      return null;
    } catch (e) {
      reportError(e, { method: "getProduct", id });
      return null;
    }
  },

  /**
   * Create Order
   */
  createOrder: async (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    orderData: any,
  ): Promise<{
    success: boolean;
    orderId?: string;
    paymentUrl?: string;
    error?: string;
  }> => {
    try {
      const response = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return {
          success: false,
          error:
            String((err as Record<string, unknown>)?.error ||
            (err as Record<string, unknown>)?.message ||
            (err as Record<string, unknown>)?.details ||
            "Failed to create order"),
        };
      }

      return await response.json();
    } catch {
      return { success: false, error: "Network error. Please try again." };
    }
  },

  /**
   * Initialize Payment (Proxy to localized gateway of choice)
   */
  initializePayment: async (paymentData: {
    orderId: string;
    email: string;
    callbackUrl: string;
  }): Promise<unknown> => {
    try {
      const response = await fetch(`${API_BASE}/orders/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(
          String((err as Record<string, unknown>)?.error ||
            (err as Record<string, unknown>)?.message ||
            "Payment initialization failed"),
        );
      }

      return await response.json();
    } catch (e) {
      reportError(e, { method: "initializePayment", ...paymentData });
      throw e;
    }
  },

  /**
   * Get Order Status
   */
  getOrderStatus: async (
    ref: string,
    phone?: string,
  ): Promise<PublicOrder | null> => {
    try {
      const params = new URLSearchParams();
      params.set("ref", ref);
      if (phone) params.set("phone", phone);

      const response = await fetch(
        `${API_BASE}/orders/status?${params.toString()}`,
        {
          cache: "no-store",
        },
      );
      if (response.ok) return await response.json();
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Get Shipping Quote
   */
  getShippingQuote: async (params: {
    storeId: string;
    deliveryAddress: string;
    deliveryCity: string;
    deliveryState: string;
  }): Promise<{
    success: boolean;
    shipping: number;
    provider: string;
    etaMinutes: number | null;
    error?: string;
  }> => {
    try {
      const response = await fetch(`${API_BASE}/shipping/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        return { success: false, shipping: 0, provider: "FLAT_RATE", etaMinutes: null, error: "Failed to get quote" };
      }

      return await response.json();
    } catch {
      return { success: false, shipping: 0, provider: "FLAT_RATE", etaMinutes: null, error: "Network error" };
    }
  },

  /**
   * Get Active Flash Sale
   */
  getActiveFlashSale: async (storeId: string): Promise<unknown | null> => {
    try {
      const response = await fetch(
        `${API_BASE}/marketing/flash-sale?storeId=${storeId}`,
        {
          next: { revalidate: 60 }, // Check every minute
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      );
      if (response.ok) {
        const data = await response.json();
        return data.id ? data : null;
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Get Blog Posts for a Store
   */
  getBlogPosts: async (storeId: string): Promise<any[]> => {
    try {
      const response = await fetch(`${API_BASE}/content/posts?storeId=${storeId}`, {
        next: { revalidate: 300 },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      if (response.ok) {
        const data = await response.json();
        return data.posts || [];
      }
      return [];
    } catch (e) {
      reportError(e, { method: "getBlogPosts", storeId });
      return [];
    }
  },

  /**
   * Get Single Blog Post
   */
  getBlogPost: async (slug: string, storeId: string): Promise<any | null> => {
    try {
      const response = await fetch(`${API_BASE}/content/posts/${slug}?storeId=${storeId}`, {
        next: { revalidate: 300 },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      if (response.ok) return await response.json();
      return null;
    } catch (e) {
      reportError(e, { method: "getBlogPost", slug, storeId });
      return null;
    }
  },
};
