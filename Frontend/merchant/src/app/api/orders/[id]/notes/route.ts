// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const storeId = request.headers.get("x-store-id") || "";
        const body = await request.json().catch(() => ({})) as { note?: string };
        const { note } = body;

        if (!note || typeof note !== "string") {
            return NextResponse.json({ error: "Note cannot be empty" }, { status: 400 });
        }

        // Call backend API to add order note
        const result = await apiJson<{ success: boolean }>(
            `${process.env.BACKEND_API_URL}/api/orders/${orderId}/notes`,
      {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-store-id": storeId,
                },
                body: JSON.stringify({ note }),
            }
        );
        
        return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/orders/:id/notes", operation: "POST" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
