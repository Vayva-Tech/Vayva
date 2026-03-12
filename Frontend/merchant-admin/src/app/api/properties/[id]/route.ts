import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";

export const dynamic = "force-dynamic";

// GET /api/properties/[id] - Get property by ID
export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    const { id } = await params;
    try {
      if (!id) {
        return NextResponse.json({ error: "ID required" }, { status: 400 });
      }

      // Forward to Backend API
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/properties/${id}`,
        {
          headers: {
            "x-store-id": storeId,
          },
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Property not found" }));
        return NextResponse.json(
          { success: false, error: error.error || "Property not found" },
          { status: backendResponse.status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json(data);
    } catch (error: unknown) {
      logger.error("[PROPERTY_GET_ERROR] Failed to fetch property", { error: error instanceof Error ? error.message : String(error), storeId, propertyId: id });
      return NextResponse.json(
        { success: false, error: "Failed to fetch property" },
        { status: 500 }
      );
    }
  }
);

// PATCH /api/properties/[id] - Update property
export const PATCH = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    const { id } = await params;
    try {
      if (!id) {
        return NextResponse.json({ error: "ID required" }, { status: 400 });
      }

      const body = await req.json();

      // Forward to Backend API
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/properties/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-store-id": storeId,
          },
          body: JSON.stringify(body),
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to update property" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to update property" },
          { status: backendResponse.status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json({ success: true, data });
    } catch (error: unknown) {
      logger.error("[PROPERTY_PATCH_ERROR] Failed to update property", { error: error instanceof Error ? error.message : String(error), storeId, propertyId: id });
      return NextResponse.json(
        { success: false, error: "Failed to update property" },
        { status: 500 }
      );
    }
  }
);

// DELETE /api/properties/[id] - Delete property
export const DELETE = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    const { id } = await params;
    try {
      if (!id) {
        return NextResponse.json({ error: "ID required" }, { status: 400 });
      }

      // Forward to Backend API
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/properties/${id}`,
        {
          method: "DELETE",
          headers: {
            "x-store-id": storeId,
          },
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to delete property" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to delete property" },
          { status: backendResponse.status }
        );
      }

      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      logger.error("[PROPERTY_DELETE_ERROR] Failed to delete property", { error: error instanceof Error ? error.message : String(error), storeId, propertyId: id });
      return NextResponse.json(
        { success: false, error: "Failed to delete property" },
        { status: 500 }
      );
    }
  }
);
