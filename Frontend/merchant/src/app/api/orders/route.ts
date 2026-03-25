import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { buildBackendAuthHeaders, buildBackendUrl } from "@/lib/backend-proxy";

export async function GET(request: NextRequest) {
  const orderQuerySchema = z.object({
    status: z.string().optional().nullable(),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    offset: z.coerce.number().int().min(0).default(0),
    search: z.string().optional().nullable(),
    customerId: z.string().optional().nullable(),
    dateFrom: z.string().optional().nullable(),
    dateTo: z.string().optional().nullable(),
  });

  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
      
      // Validate query parameters
      const queryValidation = orderQuerySchema.safeParse({
        status: searchParams.get("status") ?? undefined,
        limit: searchParams.get("limit") ?? undefined,
        offset: searchParams.get("offset") ?? undefined,
        search: searchParams.get("search") ?? undefined,
        customerId: searchParams.get("customerId") ?? undefined,
        dateFrom: searchParams.get("dateFrom") ?? undefined,
        dateTo: searchParams.get("dateTo") ?? undefined,
      });

      if (!queryValidation.success) {
        return NextResponse.json(
          { success: false, error: "Invalid query parameters", details: queryValidation.error?.format() },
          { status: 400 }
        );
      }

      const { status, limit, offset, search, customerId, dateFrom, dateTo } = queryValidation.data;

      // Call backend API to fetch orders
      const result = await apiJson<{
        data: Array<{ id: string; orderNumber: string; status: string; total: number; customerEmail?: string }>;
        meta: { total: number; limit: number; offset: number };
      }>(
        `${buildBackendUrl("/api/orders")}?limit=${limit}&offset=${offset}&status=${status || ''}&search=${search || ''}&customerId=${customerId || ''}&dateFrom=${dateFrom || ''}&dateTo=${dateTo || ''}`,
      {
          headers: auth.headers,
        }
      );
      
      return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/orders", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
