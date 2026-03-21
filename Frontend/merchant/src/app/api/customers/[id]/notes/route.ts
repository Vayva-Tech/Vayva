import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const storeId = request.headers.get("x-store-id") || "";
    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/customers/${id}/notes`,
      { headers: { "x-store-id": storeId } }
    );
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/customers/:id/notes", operation: "GET" });
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const storeId = request.headers.get("x-store-id") || "";
    const body = await request.json().catch(() => ({}));
    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/customers/${id}/notes`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-store-id": storeId },
        body: JSON.stringify(body),
      }
    );
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    handleApiError(error, { endpoint: "/api/customers/:id/notes", operation: "POST" });
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
