// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/inventory/locations - Get inventory locations
export async function GET(request: NextRequest) {
  try {
    const result = await apiJson(`${process.env.BACKEND_API_URL}/api/inventory/locations`, {
      headers: {
        "x-store-id": storeId,
      },
    });
    
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/inventory/locations",
      operation: "GET_INVENTORY_LOCATIONS",
    });
    return NextResponse.json(
      { error: "Failed to fetch inventory locations" },
      { status: 500 }
    );
  }
}
