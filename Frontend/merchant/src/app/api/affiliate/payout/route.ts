import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const { searchParams } = new URL(request.url);
    const query = searchParams.toString();
    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/affiliate/payout${query ? `?${query}` : ""}`,
      { headers: { "x-store-id": storeId } }
    );
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/affiliate/payout", operation: "GET" });
    return NextResponse.json({ error: "Failed to fetch payout history" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const body = await request.json();
    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/affiliate/payout`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-store-id": storeId },
        body: JSON.stringify(body),
      }
    );
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/affiliate/payout", operation: "POST" });
    return NextResponse.json({ error: "Failed to process payout" }, { status: 500 });
  }
}
