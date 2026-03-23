// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const storeId = request.headers.get("x-store-id") || "";
    const body = await request.json().catch(() => ({}));
    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/education/modules/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-store-id": storeId },
        body: JSON.stringify(body),
      }
    );
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/education/modules/:id", operation: "PUT" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
