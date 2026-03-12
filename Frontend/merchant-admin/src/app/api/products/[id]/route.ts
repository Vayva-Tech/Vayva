import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";

// GET /api/products/[id] - Get single product details
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
      const { id } = await params;
      
      // Forward to Backend API
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/products/${id}`,
        {
          headers: {
            "x-store-id": storeId,
          },
        }
      );

      if (!backendResponse.ok) {
        if ((backendResponse as any).status === 404) {
          return NextResponse.json(
            { success: false, error: "Product not found" },
            { status: 404 }
          );
        }
        const error = await backendResponse.json().catch(() => ({ error: "Failed to fetch product" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to fetch product" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json(data);
    } catch (error: unknown) {
      logger.error("[PRODUCT_GET_ERROR] Failed to fetch product", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to fetch product" },
        { status: 500 }
      );
    }
  }
);

// PATCH /api/products/[id] - Update product
export const PATCH = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
      const { id } = await params;
      const body = await req.json();

      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/products/${id}`,
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
        if ((backendResponse as any).status === 404) {
          return NextResponse.json(
            { success: false, error: "Product not found" },
            { status: 404 }
          );
        }

        const error = await backendResponse
          .json()
          .catch(() => ({ error: "Failed to update product" }));

        return NextResponse.json(
          { success: false, error: error.error || "Failed to update product" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json(data);
    } catch (error: unknown) {
      logger.error("[PRODUCT_PATCH_ERROR] Failed to update product", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to update product" },
        { status: 500 }
      );
    }
  }
);

// DELETE /api/products/[id] - Delete product
export const DELETE = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
      const { id } = await params;

      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/products/${id}`,
        {
          method: "DELETE",
          headers: {
            "x-store-id": storeId,
          },
        }
      );

      if (!backendResponse.ok) {
        if ((backendResponse as any).status === 404) {
          return NextResponse.json(
            { success: false, error: "Product not found" },
            { status: 404 }
          );
        }

        const error = await backendResponse
          .json()
          .catch(() => ({ error: "Failed to delete product" }));

        return NextResponse.json(
          { success: false, error: error.error || "Failed to delete product" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json().catch(() => ({}));
      return NextResponse.json(data);
    } catch (error: unknown) {
      logger.error("[PRODUCT_DELETE_ERROR] Failed to delete product", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to delete product" },
        { status: 500 }
      );
    }
  }
);
