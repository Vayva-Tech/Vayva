import { urls } from "@vayva/shared";
import { FEATURES } from "../env-validation";

export interface CustomProviderData {
  id: string;
  type: "CUSTOM";
  name: string;
  rate: number;
}

export class CustomProvider {
  name = "CUSTOM";
  constructor() {
    this.name = "CUSTOM";
  }
  async dispatch(
    _order: Record<string, unknown>,
    _settings: Record<string, unknown>,
  ) {
    return {
      success: true,
      providerJobId: `MANUAL-${Date.now()}`,
      trackingUrl: null,
      provider: "MANUAL",
      deliveryStatus: "MANUAL_CONFIRMED",
    };
  }
  async cancel(_jobId: string) {
    return { success: true };
  }
}

export interface KwikProviderData {
  id: string;
  type: "KWIK";
  name: string;
  apiKey: string;
  merchantId: string;
  baseUrl: string;
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

  async dispatch(
    order: Record<string, unknown>,
    settings: Record<string, unknown>,
  ) {
    try {
      const payload: Record<string, unknown> = {
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
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      return { success: false, error: _errMsg };
    }
  }

  async cancel(jobId: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/deliveries/${jobId}/cancel`,
        {
          method: "POST",
          headers: this.getHeaders(),
        },
      );

      if (!response.ok) {
        const errorBody = await response.text();
        return { success: false, error: errorBody };
      }

      return { success: true, rawResponse: await response.json() };
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      return { success: false, error: _errMsg };
    }
  }

  async getJobDetails(jobId: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/tasks/${jobId}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        },
      );

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
        jobId: data.data?.job_id || jobId,
        status: data.data?.status || "unknown",
        trackingUrl: data.data?.tracking_url,
        rider: data.data?.rider ? {
          name: data.data.rider.name,
          phone: data.data.rider.phone,
          latitude: data.data.rider.latitude,
          longitude: data.data.rider.longitude,
          vehicleType: data.data.rider.vehicle_type,
          photoUrl: data.data.rider.photo_url,
        } : null,
        pickup: data.data?.pickup ? {
          latitude: data.data.pickup.latitude,
          longitude: data.data.pickup.longitude,
          address: data.data.pickup.address,
        } : null,
        delivery: data.data?.delivery ? {
          latitude: data.data.delivery.latitude,
          longitude: data.data.delivery.longitude,
          address: data.data.delivery.address,
        } : null,
        etaMinutes: data.data?.eta,
        rawResponse: data,
      };
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      return { success: false, error: _errMsg };
    }
  }

  async trackRider(jobId: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/tasks/${jobId}/rider_location`,
        {
          method: "GET",
          headers: this.getHeaders(),
        },
      );

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
        latitude: data.data?.latitude,
        longitude: data.data?.longitude,
        heading: data.data?.heading,
        speed: data.data?.speed,
        updatedAt: data.data?.updated_at,
        rawResponse: data,
      };
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      return { success: false, error: _errMsg };
    }
  }
}

// --- Factory ---
export function getDeliveryProvider(providerName: string) {
  if (providerName === "KWIK") {
    if (!FEATURES.DELIVERY_ENABLED) {
      throw new Error("Kwik delivery is not configured");
    }
    return new KwikProvider();
  }
  return new CustomProvider();
}
