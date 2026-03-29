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
      `${process.env.BACKEND_API_URL}/api/v1/restaurant/menu-items?${queryParams}`,
      {
        headers: auth.headers,
      }
    );

    const formatted = (response.data?.menuItems || []).map((dish: any) => ({
      id: dish.id,
      name: dish.name,
      price: Number(dish.price) || 0,
      image: dish.imageUrl || null,
      category: dish.category || null,
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
    }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    handleApiError(error, { endpoint: "/editor-data/dishes", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
