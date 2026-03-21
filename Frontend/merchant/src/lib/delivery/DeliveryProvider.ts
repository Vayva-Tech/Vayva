import { urls } from "@vayva/shared";
import { FEATURES } from "../env-validation";

export class CustomProvider {
    name = "CUSTOM";
    constructor() {
        this.name = "CUSTOM";
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async dispatch(order: any, settings: unknown) {
        return {
            success: true,
            providerJobId: `MANUAL-${Date.now()}`,
            trackingUrl: null,
            provider: "MANUAL",
            deliveryStatus: "MANUAL_CONFIRMED",
        };
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async cancel(jobId: unknown) {
        return { success: true };
    }
}

export class KwikProvider {
    name = "KWIK";
    apiKey: string;
    merchantId: string;
    baseUrl: string;

    constructor() {
        this.name = "KWIK";
        if (!FEATURES.DELIVERY_ENABLED) {
            throw new Error("Delivery integration is not configured");
        }
        this.apiKey = process.env.KWIK_API_KEY || "";
        this.merchantId = process.env.KWIK_MERCHANT_ID || "";
        this.baseUrl = urls.kwikBase();
    }

    getHeaders() {
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async dispatch(order: any, settings: { pickupName?: string; pickupPhone?: string; pickupAddressLine1?: string; pickupCity?: string }) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const payload: any = {
                merchant_id: this.merchantId,
                pickup: {
                    name: settings.pickupName || "Merchant",
                    phone: settings.pickupPhone,
                    address: settings.pickupAddressLine1,
                    city: settings.pickupCity,
                },
                delivery: {
                    name: order.recipientName,
                    phone: order.recipientPhone,
                    address: order.addressLine1,
                    city: order.addressCity || "",
                },
                parcel: {
                    description: order.parcelDescription,
                    reference: order.id,
                },
            };

            const response = await fetch(`${this.baseUrl}/deliveries`, {
                method: "POST",
                headers: this.getHeaders(),
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorBody = await response.text();
                return {
                    success: false,
                    error: `Kwik API Error: ${response.status}`,
                    rawResponse: errorBody,
                };
            }

            const data = await response.json();
            return {
                success: true,
                providerJobId: data.data?.id || data.id,
                trackingUrl: data.data?.tracking_url || data.tracking_url,
                rawResponse: data,
                provider: "KWIK",
                deliveryStatus: "TRACKING_AVAILABLE",
            };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
            return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async cancel(jobId: unknown) {
        try {
            const response = await fetch(`${this.baseUrl}/deliveries/${jobId}/cancel`, {
                method: "POST",
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                const errorBody = await response.text();
                return { success: false, error: errorBody };
            }

            return { success: true, rawResponse: await response.json() };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
            return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
    }
}

// --- Factory ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getDeliveryProvider(providerName: unknown) {
    if (providerName === "KWIK") {
        if (!FEATURES.DELIVERY_ENABLED) {
            throw new Error("Kwik delivery is not configured");
        }
        return new KwikProvider();
    }
    return new CustomProvider();
}
