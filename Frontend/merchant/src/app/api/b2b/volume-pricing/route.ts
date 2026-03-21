import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const { searchParams } = new URL(request.url);
    const query = searchParams.toString();
    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/b2b/volume-pricing${query ? `?${query}` : ""}`,
      { headers: { "x-store-id": storeId } }
    );
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/b2b/volume-pricing", operation: "GET" });
    return NextResponse.json({ error: "Failed to fetch volume pricing" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const body = await request.json();
    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/b2b/volume-pricing`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-store-id": storeId },
        body: JSON.stringify(body),
      }
    );
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/b2b/volume-pricing", operation: "POST" });
    return NextResponse.json({ error: "Failed to create volume pricing" }, { status: 500 });
  }
}
