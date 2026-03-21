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
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/marketing/discounts/${id}`, {
      headers: { "x-store-id": storeId },
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Not found" }, { status: 404 });
    }

    return NextResponse.json(result.data, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    handleApiError(error, { endpoint: "/api/marketing/discounts/:id", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const storeId = request.headers.get("x-store-id") || "";
    const body = await request.json();
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/marketing/discounts/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-store-id": storeId,
      },
      body: JSON.stringify(body),
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to update discount");
    }

    return NextResponse.json(result.data);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/marketing/discounts/:id", operation: "PATCH" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
