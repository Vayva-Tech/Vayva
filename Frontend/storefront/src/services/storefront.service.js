import { reportError } from "@/lib/error";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";
export const StorefrontService = {
    /**
     * Get Store Details by Slug
     */
    getStore: async (slug) => {
        try {
            const response = await fetch(`${API_BASE}/stores/${slug}`);
            if (response.ok)
                return await response.json();
            return null;
        }
        catch (e) {
            reportError(e, { method: "getStore", slug });
            return null;
        }
    },
    /**
     * Get Products for a Store
     */
    getProducts: async (storeId) => {
        try {
            const response = await fetch(`${API_BASE}/products?storeId=${storeId}`, {
                next: { revalidate: 60 },
            });
            if (response.ok)
                return await response.json();
            return [];
        }
        catch (e) {
            reportError(e, { method: "getProducts", storeId });
            return [];
        }
    },
    /**
     * Single product detail
     */
    getProduct: async (id) => {
        try {
            const response = await fetch(`${API_BASE}/products/${id}`, {
                next: { revalidate: 3600 },
            });
            if (response.ok)
                return await response.json();
            return null;
        }
        catch (e) {
            reportError(e, { method: "getProduct", id });
            return null;
        }
    },
    /**
     * Create Order
     */
    createOrder: async (orderData) => {
        try {
            const response = await fetch(`${API_BASE}/orders`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData),
            });
            if (!response.ok) {
                const err = await response.json();
                return {
                    success: false,
                    error: err.message || "Failed to create order",
                };
            }
            return await response.json();
        }
        catch (e) {
            return { success: false, error: "Network error. Please try again." };
        }
    },
    /**
     * Initialize Payment (Proxy to localized gateway of choice)
     */
    initializePayment: async (paymentData) => {
        try {
            const response = await fetch(`${API_BASE}/orders/payment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(paymentData),
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Payment initialization failed");
            }
            return await response.json();
        }
        catch (e) {
            reportError(e, { method: "initializePayment", ...paymentData });
            return { status: false, message: "Payment failed to start" };
        }
    },
    /**
     * Get Order Status
     */
    getOrderStatus: async (orderId, phone) => {
        try {
            const response = await fetch(`${API_BASE}/orders/${orderId}${phone ? `?phone=${phone}` : ""}`, {
                cache: "no-store",
            });
            if (response.ok)
                return await response.json();
            return null;
        }
        catch (e) {
            return null;
        }
    },
    /**
     * Get Active Flash Sale
     */
    getActiveFlashSale: async (storeId) => {
        try {
            const response = await fetch(`${API_BASE}/marketing/flash-sale?storeId=${storeId}`, {
                next: { revalidate: 60 }, // Check every minute
            });
            if (response.ok) {
                const data = await response.json();
                return data.id ? data : null;
            }
            return null;
        }
        catch (e) {
            return null;
        }
    },
};
