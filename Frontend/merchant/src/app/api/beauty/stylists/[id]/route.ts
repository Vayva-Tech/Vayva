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
      `${process.env.BACKEND_API_URL}/api/beauty/stylists/${id}`,
      { headers: { "x-store-id": storeId } }
    );
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/beauty/stylists/:id", operation: "GET" });
    return NextResponse.json({ error: "Failed to fetch stylist" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const storeId = request.headers.get("x-store-id") || "";
    const body = await request.json();
    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/beauty/stylists/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-store-id": storeId },
        body: JSON.stringify(body),
      }
    );
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/beauty/stylists/:id", operation: "PUT" });
    return NextResponse.json({ error: "Failed to update stylist" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const storeId = request.headers.get("x-store-id") || "";
    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/beauty/stylists/${id}`,
      {
        method: "DELETE",
        headers: { "x-store-id": storeId },
      }
    );
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/beauty/stylists/:id", operation: "DELETE" });
    return NextResponse.json({ error: "Failed to delete stylist" }, { status: 500 });
  }
}
