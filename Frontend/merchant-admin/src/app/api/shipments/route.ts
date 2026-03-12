import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";

// GET /api/shipments - Get all shipments for the merchant
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const status = searchParams.get("status");
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");

      // Build query params
      const queryParams = new URLSearchParams();
      if (status) queryParams.set("status", status);
      queryParams.set("limit", limit.toString());
      queryParams.set("offset", offset.toString());

      // Forward to Backend API
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/shipments?${queryParams}`,
        {
          headers: {
            "x-store-id": storeId,
          },
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to fetch shipments" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to fetch shipments" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json(data);
    } catch (error: unknown) {
      logger.error("[SHIPMENTS_GET_ERROR] Failed to fetch shipments", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to fetch shipments" },
        { status: 500 }
      );
    }
  }
);

// POST /api/shipments - Create a new shipment
export const POST = withVayvaAPI(
  PERMISSIONS.FULFILLMENT_MANAGE,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const body = await req.json();
      const {
        orderId,
        carrier,
        trackingNumber,
        status,
        estimatedDelivery,
        shippingAddress,
        items,
        weight,
        cost,
      } = body;

      if (!orderId || !carrier) {
        return NextResponse.json(
          { success: false, error: "Order ID and carrier are required" },
          { status: 400 }
        );
      }

      // Forward to Backend API to create shipment
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/shipments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-store-id": storeId,
          },
          body: JSON.stringify({
            orderId,
            carrier,
            trackingNumber,
            status,
            estimatedDelivery,
            shippingAddress,
            items,
            weight,
            cost,
          }),
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to create shipment" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to create shipment" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json({ success: true, data: data.data }, { status: 201 });
    } catch (error: unknown) {
      logger.error("[SHIPMENTS_POST_ERROR] Failed to create shipment", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to create shipment" },
        { status: 500 }
      );
    }
  }
);
