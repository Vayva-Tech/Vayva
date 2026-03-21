// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const { searchParams } = new URL(request.url);
      
      // Validate query parameters
      const queryValidation = orderQuerySchema.safeParse({
        status: searchParams.get("status"),
        limit: searchParams.get("limit"),
        offset: searchParams.get("offset"),
        search: searchParams.get("search"),
        customerId: searchParams.get("customerId"),
        dateFrom: searchParams.get("dateFrom"),
        dateTo: searchParams.get("dateTo"),
      });

      if (!queryValidation.success) {
        return NextResponse.json(
          { success: false, error: "Invalid query parameters", details: queryValidation.error?.format() },
          { status: 400 }
        );
      }

      const { status, limit, offset, search, customerId, dateFrom, dateTo } = queryValidation.data;

      const where: Record<string, unknown> = { storeId };
      if (status) {where.status = status;
      }

      // Call backend API to fetch orders
      const result = await apiJson<{
        data: Array<{ id: string; orderNumber: string; status: string; total: number; customerEmail?: string }>;
        meta: { total: number; limit: number; offset: number };
      }>(
        `${process.env.BACKEND_API_URL}/api/orders?limit=${limit}&offset=${offset}&status=${status || ''}&search=${search || ''}&customerId=${customerId || ''}&dateFrom=${dateFrom || ''}&dateTo=${dateTo || ''}`,
      {
          headers: {
            "x-store-id": storeId,
          },
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
