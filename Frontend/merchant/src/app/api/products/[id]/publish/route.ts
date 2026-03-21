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
    const { id } = await params;
    const { id } = await params;
    const storeId = request.headers.get("x-store-id") || "";
    const resolvedParams = await Promise.resolve(params);
        const { id } = resolvedParams;
        const body = await request.json();
        const { category } = body as { category?: string };

        // Call backend API to publish product
        const result = await apiJson<{
            success: boolean;
            listing: {
                id: string;
                productId: string;
                category: string;
                status: string;
            };
        }>(
            `${process.env.BACKEND_API_URL}/api/products/${id}/publish`,
      {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-store-id": storeId,
                },
                body: JSON.stringify({ category }),
            }
        );
        
        return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/products/:id/publish", operation: "POST" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
