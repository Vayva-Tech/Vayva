import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";

// GET /api/properties - Get all properties for the merchant
export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");
      const status = searchParams.get("status");
      const type = searchParams.get("type");

      // Build query params
      const queryParams = new URLSearchParams();
      queryParams.set("limit", limit.toString());
      queryParams.set("offset", offset.toString());
      if (status) queryParams.set("status", status);
      if (type) queryParams.set("type", type);

      // Forward to Backend API
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/properties?${queryParams}`,
        {
          headers: {
            "x-store-id": storeId,
          },
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to fetch properties" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to fetch properties" },
          { status: backendResponse.status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json(data);
    } catch (error: unknown) {
      logger.error("[PROPERTIES_GET_ERROR] Failed to fetch properties", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to fetch properties" },
        { status: 500 }
      );
    }
  }
);

// POST /api/properties - Create a new property
export const POST = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const body = await req.json();
      const {
        title,
        description,
        price,
        type,
        maxGuests,
        bedCount,
        bathrooms,
        totalUnits,
        amenities,
      } = body;

      if (!title) {
        return NextResponse.json(
          { success: false, error: "Title is required" },
          { status: 400 }
        );
      }

      // Forward to Backend API to create property
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/properties`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-store-id": storeId,
          },
          body: JSON.stringify({
            title,
            description,
            price,
            type,
            maxGuests,
            bedCount,
            bathrooms,
            totalUnits,
            amenities,
          }),
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to create property" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to create property" },
          { status: backendResponse.status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error: unknown) {
      logger.error("[PROPERTIES_POST_ERROR] Failed to create property", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to create property" },
        { status: 500 }
      );
    }
  }
);
