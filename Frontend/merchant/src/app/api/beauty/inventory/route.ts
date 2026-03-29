import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { z } from "zod";

function backendBase(): string {
  return process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";
}

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
  metadata: z.record(z.unknown()).optional(),
});

/**
 * GET /api/beauty/inventory
 * Get all inventory items with filtering and alerts
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!auth.user.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const productType = searchParams.get("productType");
    const lowStockOnly = searchParams.get("lowStockOnly") === "true";
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);

    const queryParams = new URLSearchParams();
    if (category) queryParams.set("category", category);
    if (productType) queryParams.set("productType", productType);
    if (lowStockOnly) queryParams.set("lowStockOnly", "true");
    queryParams.set("limit", limit.toString());
    queryParams.set("page", page.toString());

    const result = await apiJson<{
      success: boolean;
      data?: {
        products: Array<{
          id: string;
          title: string;
          category: string;
          stockQuantity: number;
          lowStockThreshold: number;
          price: number;
          productType: string;
          isLowStock: boolean;
          stockStatus: string;
        }>;
        summary: {
          totalProducts: number;
          lowStockCount: number;
          outOfStockCount: number;
          totalValue: number;
        };
        pagination: { total: number; page: number; limit: number; totalPages: number };
      };
      error?: string;
    }>(`${backendBase()}/api/beauty/inventory?${queryParams.toString()}`, {
      headers: auth.headers,
    });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/beauty/inventory",
      operation: "GET_INVENTORY",
    });
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}

/**
 * POST /api/beauty/inventory
 * Create a new inventory item
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!auth.user.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json();
    const validatedData = productSchema.parse(body);

    const result = await apiJson<{
      success: boolean;
      data?: { id: string; title: string; category: string; stockQuantity: number; price: number };
      error?: string;
    }>(`${backendBase()}/api/beauty/inventory`, {
      method: "POST",
      headers: auth.headers,
      body: JSON.stringify(validatedData),
    });

    return NextResponse.json(result, { status: result.success ? 201 : 400 });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/beauty/inventory",
      operation: "CREATE_INVENTORY_ITEM",
    });
    return NextResponse.json({ error: "Failed to create inventory item" }, { status: 500 });
  }
}
