// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logActivity } from "@/lib/activity-logger";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function PATCH(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const body = await request.json().catch(() => ({}));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { items }: { items: { id: string, data: any }[] } = body;
        
        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "No items to update" }, { status: 400 });
        }

        // Call backend API to bulk update products
        const result = await apiJson<{
            success: boolean;
            updated: Array<{ id: string; title: string; price: number; status: string }>;
        }>(
            `${process.env.BACKEND_API_URL}/api/products/bulk`,
      {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "x-store-id": storeId,
                },
                body: JSON.stringify({ items }),
            }
        );

        // Async Logging
        result.updated.forEach((updated) => {
            logActivity({
                storeId,
                actorUserId: user.id,
                action: "PRODUCT_BULK_UPDATE",
                targetType: "PRODUCT",
                targetId: updated.id,
                after: { title: updated.title, price: updated.price, status: updated.status }
            });
        });

        return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/products/bulk", operation: "PATCH" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
