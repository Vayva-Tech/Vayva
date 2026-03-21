// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { id } = await params;
    const storeId = request.headers.get("x-store-id") || "";
    const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400, headers: { "Cache-Control": "no-store" } });

  // Call backend API to delete domain
  const result = await apiJson<{ success: boolean; error?: string }>(
    `${process.env.BACKEND_API_URL}/api/domains/${id}`,
      {
      method: "DELETE",
      headers: {
        "x-store-id": storeId,
      },
    }
  );
  
  if (result.error) {
    const status = result.error.includes("verified") ? 409 : 404;
    return NextResponse.json(result, { status, headers: { "Cache-Control": "no-store" } });
  }
  
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    handleApiError(error, { endpoint: "/api/domains/:id", operation: "DELETE" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
