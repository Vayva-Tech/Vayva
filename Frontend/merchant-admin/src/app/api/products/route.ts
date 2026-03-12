import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";

// GET /api/products - Get all products for the merchant
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");
      const status = searchParams.get("status");
      const search = searchParams.get("search");
      const categoryId = searchParams.get("categoryId");

      const where: Record<string, unknown> = { storeId };
      
      if (status) {where.status = status;
      }
      
      if (categoryId) {
        where.categoryId = categoryId;
      }
      
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { sku: { contains: search, mode: "insensitive" } },
        ];
      }

      // Forward to Backend API
      const queryParams = new URLSearchParams();
      if (limit) queryParams.set("limit", limit.toString());
      if (offset) queryParams.set("offset", offset.toString());
      if (status) queryParams.set("status", status);
      if (search) queryParams.set("search", search);
      if (categoryId) queryParams.set("categoryId", categoryId);

      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/products?${queryParams}`,
        {
          headers: {
            "x-store-id": storeId,
          },
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to fetch products" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to fetch products" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json({ success: true, data });
    } catch (error: unknown) {
      logger.error("[PRODUCTS_GET_ERROR] Failed to fetch products", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to fetch products" },
        { status: 500 }
      );
    }
  }
);

// POST /api/products - Create a new product
export const POST = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const body = await req.json();
      const {
        name,
        description,
        price,
        compareAtPrice,
        cost,
        sku,
        barcode,
        inventory,
        trackInventory,
        status,
        images,
        categoryId,
        variants,
        attributes,
        weight,
        dimensions,
        tags,
      } = body;

      if (!name || !price) {
        return NextResponse.json(
          { success: false, error: "Product name and price are required" },
          { status: 400 }
        );
      }

      // Forward to Backend API to create product
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/products`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-store-id": storeId,
          },
          body: JSON.stringify(body),
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to create product" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to create product" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error: unknown) {
      logger.error("[PRODUCTS_POST_ERROR] Failed to create product", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to create product" },
        { status: 500 }
      );
    }
  }
);
