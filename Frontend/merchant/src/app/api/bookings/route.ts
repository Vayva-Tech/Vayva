// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/bookings - Get all bookings for the merchant
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const queryParams = new URLSearchParams();
    if (status) queryParams.set("status", status);
    if (dateFrom) queryParams.set("dateFrom", dateFrom);
    if (dateTo) queryParams.set("dateTo", dateTo);
    queryParams.set("limit", limit.toString());
    queryParams.set("offset", offset.toString());

    const result = await apiJson<{
      success: boolean;
      data?: Array<{ id: string; customerName: string; service: string; date: string; status: string }>;
      meta?: { total: number; limit: number; offset: number };
    }>(
      `${process.env.BACKEND_API_URL}/api/bookings?${queryParams.toString()}`,
      {
        headers: {
          "x-store-id": storeId,
        },
      }
    );
    
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/bookings",
      operation: "GET_BOOKINGS",
    });
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
