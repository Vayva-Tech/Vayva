// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { z } from "zod";

const productSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  category: z.string(),
  price: z.number(),
  costPrice: z.number().optional(),
  stockQuantity: z.number().optional(),
  lowStockThreshold: z.number().optional(),
  inventoryTracking: z.boolean().optional(),
  productType: z.enum(["RETAIL", "PROFESSIONAL"]).optional(),
  supplier: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  imageUrl: z.string().optional(),
  metadata: z.any().optional(),
});

/**
 * GET /api/beauty/inventory
 * Get all inventory items with filtering and alerts
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const productType = searchParams.get("productType");
    const lowStockOnly = searchParams.get("lowStockOnly") === "true";
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");

    const queryParams = new URLSearchParams();
    if (category) queryParams.set("category", category);
    if (productType) queryParams.set("productType", productType);
    if (lowStockOnly) queryParams.set("lowStockOnly", "true");
    queryParams.set("limit", limit.toString());
    queryParams.set("page", page.toString());

    const result = await apiJson<{
      success: boolean;
      data?: {
        products: Array<{ id: string; title: string; category: string; stockQuantity: number; lowStockThreshold: number; price: number; productType: string; isLowStock: boolean; stockStatus: string }>;
        summary: { totalProducts: number; lowStockCount: number; outOfStockCount: number; totalValue: number };
        pagination: { total: number; page: number; limit: number; totalPages: number };
      };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/beauty/inventory?${queryParams.toString()}`, {
      headers: {
        "x-store-id": storeId,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/beauty/inventory",
      operation: "GET_INVENTORY",
    });
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/beauty/inventory
 * Create a new inventory item
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = productSchema.parse(body);

    const result = await apiJson<{
      success: boolean;
      data?: { id: string; title: string; category: string; stockQuantity: number; price: number };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/beauty/inventory`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-store-id": storeId,
      },
      body: JSON.stringify(validatedData),
    });

    return NextResponse.json(result, { status: result.success ? 201 : 400 });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/beauty/inventory",
      operation: "CREATE_INVENTORY_ITEM",
    });
    return NextResponse.json(
      { error: "Failed to create inventory item" },
      { status: 500 }
    );
  }
}
