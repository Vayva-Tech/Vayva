import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";

// GET /api/quotes - Get all quotes for the merchant
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
        `${process?.env?.BACKEND_API_URL}/api/quotes?${queryParams}`,
        {
          headers: {
            "x-store-id": storeId,
          },
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to fetch quotes" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to fetch quotes" },
          { status: backendResponse.status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json(data);
    } catch (error: unknown) {
      logger.error("[QUOTES_GET_ERROR] Failed to fetch quotes", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to fetch quotes" },
        { status: 500 }
      );
    }
  }
);

// POST /api/quotes - Create a new quote
export const POST = withVayvaAPI(
  PERMISSIONS.PAYMENTS_MANAGE,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const body = await req.json();
      const {
        customerId,
        items,
        subtotal,
        tax,
        total,
        notes,
        validUntil,
        status,
      } = body;

      // Forward to Backend API to create quote
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/quotes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-store-id": storeId,
          },
          body: JSON.stringify({
            customerId,
            items,
            subtotal,
            tax,
            total,
            notes,
            validUntil,
            status,
          }),
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to create quote" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to create quote" },
          { status: backendResponse.status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json({ success: true, data: data.data }, { status: 201 });
    } catch (error: unknown) {
      logger.error("[QUOTES_POST_ERROR] Failed to create quote", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to create quote" },
        { status: 500 }
      );
    }
  }
);
