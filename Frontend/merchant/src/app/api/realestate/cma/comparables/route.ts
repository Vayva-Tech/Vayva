import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");
    const radius = searchParams.get("radius");
    const months = searchParams.get("months");

    if (!propertyId) {
      return NextResponse.json(
        { success: false, error: "Property ID is required" },
        { status: 400 }
      );
    }

    const queryParams = new URLSearchParams({ propertyId });
    if (radius) queryParams.set("radius", radius);
    if (months) queryParams.set("months", months);

    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/realestate/cma/comparables?${queryParams.toString()}`,
      {
        headers: { "x-store-id": storeId },
      }
    );
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/realestate/cma/comparables", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
