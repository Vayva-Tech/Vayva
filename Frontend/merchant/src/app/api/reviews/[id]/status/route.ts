import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

type ReviewStatus = "APPROVED" | "REJECTED" | "PENDING" | "FLAGGED";
const ALLOWED_STATUSES = new Set<ReviewStatus>(["APPROVED", "REJECTED", "PENDING", "FLAGGED"]);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const storeId = request.headers.get("x-store-id") || "";
    const body = await request.json().catch(() => ({})) as { status?: string };
    const status = String(body?.status || "").toUpperCase() as ReviewStatus;

    if (!ALLOWED_STATUSES.has(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const result = await apiJson<{ success: boolean }>(
      `${process.env.BACKEND_API_URL}/api/reviews/${id}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-store-id": storeId,
        },
        body: JSON.stringify({ status }),
      }
    );

    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    handleApiError(error, { endpoint: "/api/reviews/:id/status", operation: "PATCH" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
