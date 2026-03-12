import { reportError } from "@/lib/error";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

export interface InitializePaymentPayload {
  email: string;
  amount: number; // in kobo
  reference?: string;
  callback_url?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any;
  currency?: string;
  channels?: string[];
}

export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export const PaystackService = {
  initializeTransaction: async (
    payload: InitializePaymentPayload,
  ): Promise<PaystackInitializeResponse> => {
    const _secretKey =
      process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_LIVE_SECRET_KEY; // Fallback to live if testing is not available? Logic check.
    // Actually, usually test key is default for dev.
    // Let's use strict env check.

    const key =
      process.env.NODE_ENV === "production"
        ? process.env?.PAYSTACK_LIVE_SECRET_KEY
        : process.env?.PAYSTACK_SECRET_KEY;

    if (!key) {
      console.warn("[Paystack] No Secret Key found. Payments will fail.");
      throw new Error("PAYSTACK_SECRET_KEY not configured");
    }

    try {
      const response = await fetch(
        `${PAYSTACK_BASE_URL}/transaction/initialize`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Paystack initialization failed");
      }

      return await response.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
      reportError(error, {
        scope: "Paystack.initializeTransaction",
        app: "storefront",
      });
      throw error;
    }
  },
  verifyTransaction: async (reference: string): Promise<any> => {
    const key =
      process.env.NODE_ENV === "production"
        ? process.env?.PAYSTACK_LIVE_SECRET_KEY
        : process.env?.PAYSTACK_SECRET_KEY;

    if (!key) {
      throw new Error("PAYSTACK_SECRET_KEY not configured");
    }

    const res = await fetch(
      `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error?.message || "Paystack verification failed");
    }

    return await res.json();
  },
};
