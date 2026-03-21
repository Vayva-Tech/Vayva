import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "5");

      const queryParams = new URLSearchParams();
      queryParams.set("limit", limit.toString());// Call backend API
      const result = await apiJson(`${process.env.BACKEND_API_URL}/api/endpoint`,
      {
          headers: {
            "x-store-id": storeId,
          },
        }
      );
      
      return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/dashboard/recent-bookings", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
