import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.set("startDate", startDate);
    if (endDate) queryParams.set("endDate", endDate);
    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/merchant/virtual-try-on/analytics?${queryParams.toString()}`,
      { headers: { "x-store-id": storeId } }
    );
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/merchant/virtual-try-on/analytics", operation: "GET" });
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
