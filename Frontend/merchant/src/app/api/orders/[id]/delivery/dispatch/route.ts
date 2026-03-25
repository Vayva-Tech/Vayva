import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { getDeliveryProvider } from "@/lib/delivery/DeliveryProvider";
import { FEATURES } from "@/lib/env-validation";
import { z } from "zod";
import { logger } from "@/lib/logger";

const DispatchSchema = z.object({
  recipientName: z.string().min(1, "Recipient name is required"),
  recipientPhone: z.string().min(1, "Recipient phone is required"),
  addressLine1: z.string().min(1, "Address is required"),
  addressCity: z.string().min(1, "City is required"),
});

type DispatchResult = {
  success?: boolean;
  error?: string;
  providerJobId?: string;
  trackingUrl?: string;
  rawResponse?: unknown;
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id?: string }> },
) {
  try {
    const { id: orderId } = await params;
    if (!orderId) {
      return NextResponse.json({ error: "Order id required" }, { status: 400 });
    }

    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!FEATURES.DELIVERY_ENABLED) {
      return NextResponse.json(
        {
          code: "feature_not_configured",
          feature: "DELIVERY_ENABLED",
          message: "Delivery is disabled.",
        },
        { status: 503 },
      );
    }

    const settingsResult = await apiJson<{
      success: boolean;
      data?: { isEnabled: boolean; pickupAddressLine1: string; provider: string };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/store-delivery-settings`, {
      headers: auth.headers,
    });

    if (!settingsResult.success || !settingsResult.data) {
      return NextResponse.json(
        { success: false, error: "Failed to load store settings." },
        { status: 500 },
      );
    }

    const settings = settingsResult.data;
    if (!settings.isEnabled) {
      return NextResponse.json(
        { success: false, error: "Delivery feature is not enabled for this store." },
        { status: 400 },
      );
    }
    if (!settings.pickupAddressLine1) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Store pickup address is missing. Please configure it in Delivery Settings.",
        },
        { status: 400 },
      );
    }

    const orderResult = await apiJson<{
      success: boolean;
      data?: {
        id: string;
        orderNumber?: string;
        refCode?: string;
        customerPhone?: string;
        metadata?: Record<string, unknown>;
        customer?: { firstName?: string; lastName?: string; phone?: string };
        shipments?: Array<{
          id: string;
          status: string;
          recipientName?: string;
          recipientPhone?: string;
          addressLine1?: string;
          addressCity?: string;
        }>;
      };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/orders/${orderId}`, {
      headers: auth.headers,
    });

    if (!orderResult.success || !orderResult.data) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 },
      );
    }

    const order = orderResult.data;
    const s = order.shipments?.[0];
    if (s) {
      const status = s.status;
      if (["DELIVERED", "CANCELED", "FAILED"].includes(status)) {
        return NextResponse.json(
          {
            success: false,
            error: "Delivery is already finished (Terminal State).",
          },
          { status: 409 },
        );
      }
      if (["REQUESTED", "ACCEPTED", "PICKED_UP", "IN_TRANSIT"].includes(status)) {
        return NextResponse.json({ success: true, data: s, shipment: s });
      }
    }

    let body: Record<string, unknown> | null = null;
    try {
      const raw: unknown = await request.json();
      body =
        raw !== null && typeof raw === "object" && !Array.isArray(raw)
          ? (raw as Record<string, unknown>)
          : null;
    } catch {
      body = null;
    }

    const shippingAddress = (
      (order.metadata?.shippingAddress as Record<string, string> | undefined) || {}
    ) as Record<string, string>;

    const recipientName = [
      typeof body?.recipientName === "string" ? body.recipientName : undefined,
      s?.recipientName || undefined,
      shippingAddress.recipientName,
      shippingAddress.name,
      `${order.customer?.firstName || ""} ${order.customer?.lastName || ""}`.trim(),
    ].find((v): v is string => typeof v === "string" && v.trim().length > 0) || "Customer";

    const recipientPhone = [
      typeof body?.recipientPhone === "string" ? body.recipientPhone : undefined,
      s?.recipientPhone || undefined,
      shippingAddress.phone,
      shippingAddress.recipientPhone,
      order.customerPhone || undefined,
      order.customer?.phone || undefined,
    ].find((v): v is string => typeof v === "string" && v.trim().length > 0) || "";

    const addressLine1 = [
      typeof body?.addressLine1 === "string" ? body.addressLine1 : undefined,
      s?.addressLine1 || undefined,
      shippingAddress.addressLine1,
      shippingAddress.line1,
      shippingAddress.street,
    ].find((v): v is string => typeof v === "string" && v.trim().length > 0) || "";

    const addressCity = [
      typeof body?.addressCity === "string" ? body.addressCity : undefined,
      s?.addressCity || undefined,
      shippingAddress.city,
    ].find((v): v is string => typeof v === "string" && v.trim().length > 0) || "";

    if (settings.provider === "KWIK") {
      if (!recipientPhone || !addressLine1) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Missing recipient phone or address required for Kwik dispatch.",
          },
          { status: 400 },
        );
      }
    }

    const validation = DispatchSchema.safeParse({
      recipientName,
      recipientPhone,
      addressLine1,
      addressCity,
    });
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation Failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const dispatchData = {
      id: orderId,
      recipientName,
      recipientPhone,
      addressLine1,
      addressCity,
      parcelDescription: `Order #${order.orderNumber || order.refCode}`,
    };

    let provider;
    try {
      provider = getDeliveryProvider(settings.provider);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid delivery provider configured: ${settings.provider}`,
        },
        { status: 400 },
      );
    }

    const result = (await provider.dispatch(
      dispatchData,
      // KwikProvider.dispatch types a narrow settings shape; CustomProvider uses `unknown`.
      settings as never,
    )) as DispatchResult;

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: `Dispatch Failed: ${result.error}` },
        { status: 502 },
      );
    }

    const toStatus = "CREATED";
    const shipmentResult = await apiJson<{
      success: boolean;
      data?: unknown;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/shipments/upsert`, {
      method: "POST",
      headers: auth.headers,
      body: JSON.stringify({
        orderId,
        provider: settings.provider,
        status: toStatus,
        recipientName,
        recipientPhone,
        addressLine1,
        addressCity,
        trackingCode: result.providerJobId,
        trackingUrl: result.trackingUrl,
        notes: result.rawResponse ? JSON.stringify(result.rawResponse) : undefined,
      }),
    });

    if (!shipmentResult.success || !shipmentResult.data) {
      throw new Error(shipmentResult.error || "Failed to create shipment");
    }

    const shipment = shipmentResult.data as { id: string };

    try {
      await apiJson(`${process.env.BACKEND_API_URL}/api/delivery-events`, {
        method: "POST",
        headers: auth.headers,
        body: JSON.stringify({
          shipmentId: shipment.id,
          status: toStatus,
          note: `Dispatched via ${settings.provider} (Job: ${result.providerJobId})`,
          providerStatus: "REQUESTED",
        }),
      });
    } catch (e) {
      logger.warn("[ORDER_DISPATCH] Failed to create delivery event log", {
        error: e,
      });
    }

    return NextResponse.json({
      success: true,
      data: shipmentResult.data,
      shipment: shipmentResult.data,
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/orders/[id]/delivery/dispatch",
      operation: "POST_ORDER_DISPATCH",
    });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 },
    );
  }
}
