import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const storeId = request.headers.get("x-store-id") || "";
    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/merchant/whatsapp/broadcasts/${id}/cancel`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-store-id": storeId },
        body: JSON.stringify({}),
      }
    );
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/merchant/whatsapp/broadcasts/:id/cancel", operation: "POST" });
    return NextResponse.json({ error: "Failed to cancel broadcast" }, { status: 500 });
  }
}
