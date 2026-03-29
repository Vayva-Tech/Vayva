import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);

    const queryParams = new URLSearchParams({
      storeId,
      limit: limit.toString(),
    });

    if (query) queryParams.set("search", query);

    const response = await apiJson(
      `${process.env.BACKEND_API_URL}/api/v1/properties?${queryParams}`,
      {
        headers: auth.headers,
      }
    );

    const formatted = (response.data?.properties || []).map((prop: any) => ({
      id: prop.id,
      name: prop.title,
      price: Number(prop.price) || 0,
      images: prop.images || [],
      location: prop.address ? `${prop.address}${prop.city ? `, ${prop.city}` : ""}${prop.state ? `, ${prop.state}` : ""}` : null,
      bedrooms: prop.bedrooms || null,
      bathrooms: prop.bathrooms || null,
      status: prop.status || "available",
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
    }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    handleApiError(error, { endpoint: "/editor-data/properties", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
