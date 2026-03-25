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
  apiKey?: string;
  merchantId?: string;
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
    // APIary docs use https://staging-api-test.kwik.delivery/ with endpoints like /vendor_login, /v2/create_task_via_vendor.
    // Keep backwards-compatibility with existing Bearer-based API if configured.
    this.baseUrl =
      process.env.KWIK_APIARY_BASE_URL ||
      process.env.KWIK_BASE_URL ||
      "https://staging-api-test.kwik.delivery";
  }

  getHeaders() {
    return {
      "Content-Type": "application/json",
      ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
    };
  }

  private async dispatchViaApiary(
    order: Record<string, unknown>,
    settings: Record<string, unknown>,
  ) {
    const accessToken = process.env.KWIK_ACCESS_TOKEN;
    const vendorId = process.env.KWIK_VENDOR_ID;
    const domainName =
      process.env.KWIK_DOMAIN_NAME || "staging-client-panel.kwik.delivery";

    if (!accessToken || !vendorId) {
      return {
        success: false,
        error:
          "Kwik APIary mode requires KWIK_ACCESS_TOKEN and KWIK_VENDOR_ID env vars.",
      };
    }

    const pickupAddressLine1 = String(settings.pickupAddressLine1 || "");
    const pickupCity = String(settings.pickupCity || "");
    const pickupName = String(settings.pickupName || "Merchant");
    const pickupPhone = String(settings.pickupPhone || "");

    const deliveryAddressLine1 = String(order.addressLine1 || "");
    const deliveryCity = String(order.addressCity || "");
    const recipientName = String(order.recipientName || "Customer");
    const recipientPhone = String(order.recipientPhone || "");

    // Best-effort: allow lat/lng to be supplied via order metadata; otherwise use 0 and let provider geocode if supported.
    const pickupLat =
      typeof order.pickupLatitude === "number"
        ? order.pickupLatitude
        : typeof order.pickupLatitude === "string"
          ? Number(order.pickupLatitude)
          : 0;
    const pickupLng =
      typeof order.pickupLongitude === "number"
        ? order.pickupLongitude
        : typeof order.pickupLongitude === "string"
          ? Number(order.pickupLongitude)
          : 0;
    const deliveryLat =
      typeof order.deliveryLatitude === "number"
        ? order.deliveryLatitude
        : typeof order.deliveryLatitude === "string"
          ? Number(order.deliveryLatitude)
          : 0;
    const deliveryLng =
      typeof order.deliveryLongitude === "number"
        ? order.deliveryLongitude
        : typeof order.deliveryLongitude === "string"
          ? Number(order.deliveryLongitude)
          : 0;

    const cod =
      order.cod && typeof order.cod === "object" && order.cod !== null
        ? (order.cod as Record<string, unknown>)
        : undefined;
    const isCodJob = cod?.enabled ? 1 : 0;
    const codAmount =
      typeof cod?.amount === "number"
        ? cod.amount
        : typeof cod?.amount === "string"
          ? Number(cod.amount)
          : undefined;

    const payload: Record<string, unknown> = {
      domain_name: domainName,
      access_token: accessToken,
      vendor_id: vendorId,
      is_multiple_tasks: 1,
      timezone:
        typeof process.env.KWIK_TIMEZONE_MINUTES === "string"
          ? Number(process.env.KWIK_TIMEZONE_MINUTES)
          : -60,
      has_pickup: 1,
      has_delivery: 1,
      layout_type: 0,
      auto_assignment: 1,
      pickups: [
        {
          address: pickupAddressLine1,
          name: pickupName,
          latitude: pickupLat,
          longitude: pickupLng,
          time: new Date().toISOString().slice(0, 19).replace("T", " "),
          phone: pickupPhone,
          email: null,
        },
      ],
      deliveries: [
        {
          address: deliveryAddressLine1,
          name: recipientName,
          latitude: deliveryLat,
          longitude: deliveryLng,
          time: new Date().toISOString().slice(0, 19).replace("T", " "),
          phone: recipientPhone,
          email: null,
        },
      ],
      // COD flags (best-effort: some environments may ignore these)
      is_cod_job: isCodJob,
      ...(typeof codAmount === "number" && Number.isFinite(codAmount)
        ? { collect_on_delivery: codAmount }
        : {}),
      // Optional city hints
      pickup_city: pickupCity,
      delivery_city: deliveryCity,
    };

    const response = await fetch(`${this.baseUrl}/v2/create_task_via_vendor`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    const rawText = await response.text();
    if (!response.ok) {
      return {
        success: false,
        error: `Kwik API Error: ${response.status}`,
        rawResponse: rawText,
      };
    }

    let data: unknown = rawText;
    try {
      data = JSON.parse(rawText) as unknown;
    } catch {
      // keep rawText
    }

    const dataObj =
      typeof data === "object" && data !== null
        ? (data as Record<string, unknown>)
        : {};
    const inner =
      typeof dataObj.data === "object" && dataObj.data !== null
        ? (dataObj.data as Record<string, unknown>)
        : {};
    const deliveries = Array.isArray(inner.deliveries)
      ? inner.deliveries
      : Array.isArray(dataObj.deliveries)
        ? dataObj.deliveries
        : [];
    const firstDelivery =
      typeof deliveries[0] === "object" && deliveries[0] !== null
        ? (deliveries[0] as Record<string, unknown>)
        : {};

    const uniqueOrderId = inner.unique_order_id ?? dataObj.unique_order_id;
    const customerId =
      inner.order_id ?? dataObj.order_id ?? dataObj.customer_id ?? inner.customer_id;
    const trackingLink = inner.result_tracking_link ?? dataObj.result_tracking_link;
    const jobHash = firstDelivery.job_hash;

    const meta = {
      unique_order_id: uniqueOrderId,
      customer_id: customerId,
      job_hash: jobHash,
      cod: {
        enabled: Boolean(isCodJob),
        amount: typeof codAmount === "number" ? codAmount : undefined,
        includesDelivery: Boolean(cod?.includesDelivery),
      },
    };

    return {
      success: true,
      providerJobId:
        typeof uniqueOrderId === "string" && uniqueOrderId.length > 0
          ? uniqueOrderId
          : `KWIK-${Date.now()}`,
      trackingUrl: typeof trackingLink === "string" ? trackingLink : null,
      rawResponse: { data, meta },
      provider: "KWIK",
      deliveryStatus: "TRACKING_AVAILABLE",
      notesMeta: meta,
    };
  }

  async dispatch(
    order: Record<string, unknown>,
    settings: Record<string, unknown>,
  ) {
    try {
      // Prefer APIary-compatible integration when configured.
      if (process.env.KWIK_ACCESS_TOKEN && process.env.KWIK_VENDOR_ID) {
        return await this.dispatchViaApiary(order, settings);
      }

      // Backwards-compatible Bearer mode (older/alternate Kwik API).
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
        cod: order.cod || undefined,
      };

      const response = await fetch(`${this.baseUrl}/deliveries`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      const rawText = await response.text();
      if (!response.ok) {
        return {
          success: false,
          error: `Kwik API Error: ${response.status}`,
          rawResponse: rawText,
        };
      }

      let data: unknown = rawText;
      try {
        data = JSON.parse(rawText) as unknown;
      } catch {
        // keep rawText
      }

      const dataObj =
        typeof data === "object" && data !== null
          ? (data as Record<string, unknown>)
          : {};
      const inner =
        typeof dataObj.data === "object" && dataObj.data !== null
          ? (dataObj.data as Record<string, unknown>)
          : {};

      const providerJobId = inner.id ?? dataObj.id;
      const trackingUrl = inner.tracking_url ?? dataObj.tracking_url;
      return {
        success: true,
        providerJobId:
          typeof providerJobId === "string" ? providerJobId : String(providerJobId ?? ""),
        trackingUrl: typeof trackingUrl === "string" ? trackingUrl : null,
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
