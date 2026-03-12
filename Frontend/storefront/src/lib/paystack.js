const PAYSTACK_BASE_URL = "https://api.paystack.co";
export const PaystackService = {
    initializeTransaction: async (payload) => {
        const secretKey = process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_LIVE_SECRET_KEY; // Fallback to live if testing is not available? Logic check.
        // Actually, usually test key is default for dev.
        // Let's use strict env check.
        const key = process.env.NODE_ENV === "production"
            ? process.env.PAYSTACK_LIVE_SECRET_KEY
            : process.env.PAYSTACK_SECRET_KEY;
        if (!key) {
            console.warn("[Paystack] No Secret Key found. Payments will fail.");
            throw new Error("PAYSTACK_SECRET_KEY not configured");
        }
        try {
            const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${key}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Paystack initialization failed");
            }
            return await response.json();
        }
        catch (error) {
            console.error("[Paystack] Init Error:", error.message);
            throw error;
        }
    },
};
