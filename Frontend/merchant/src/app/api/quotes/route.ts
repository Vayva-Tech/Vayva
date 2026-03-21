import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const { searchParams } = new URL(request.url);
      const status = searchParams.get("status");
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");

      // Build query params
      const queryParams = new URLSearchParams();
      if (status) queryParams.set("status", status);
      queryParams.set("limit", limit.toString());
      queryParams.set("offset", offset.toString());

      // Call backend API
      const result = await apiJson<{
        success: boolean;
        data?: Array<{ id: string; customerName: string; totalAmount: number; status: string; createdAt: string }>;
        meta?: { total: number; limit: number; offset: number };
      }>(
        `${process.env.BACKEND_API_URL}/api/quotes?${queryParams.toString()}`,
      {
          headers: {
            "x-store-id": storeId,
          },
        }
      );
      
      return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/quotes", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
