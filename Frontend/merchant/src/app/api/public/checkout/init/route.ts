import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function POST(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const body = await request.json().catch(() => ({}));
    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/public/checkout/init`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-store-id": storeId },
        body: JSON.stringify(body),
      }
    );
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/public/checkout/init", operation: "POST" });
    return NextResponse.json({ error: "Failed to initialize checkout" }, { status: 500 });
  }
}
