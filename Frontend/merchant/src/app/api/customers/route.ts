import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { z } from "zod";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const customerQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  search: z.string().max(200).optional(),
});

// GET /api/customers - Get all customers for the merchant
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const { searchParams } = new URL(request.url);
    
    const queryValidation = customerQuerySchema.safeParse({
      limit: searchParams.get("limit"),
      offset: searchParams.get("offset"),
      search: searchParams.get("search"),
    });

    if (!queryValidation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid query parameters", details: queryValidation.error?.format() },
        { status: 400 }
      );
    }

    const { limit, offset, search } = queryValidation.data;

    const result = await apiJson<{
      data: Array<{ id: string; firstName: string; lastName: string; email?: string; phone?: string }>;
      meta: { total: number; limit: number; offset: number };
    }>(
      `${process.env.BACKEND_API_URL}/api/customers?limit=${limit}&offset=${offset}&search=${encodeURIComponent(search ?? "")}`,
      {
        headers: auth.headers,
      }
    );
    
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/customers",
      operation: "GET_CUSTOMERS",
    });
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
