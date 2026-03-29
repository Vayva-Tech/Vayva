import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { logActivity } from "@/lib/activity-logger";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function PATCH(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storeId = auth.user.storeId;
    const actorUserId =
      "id" in auth.user && typeof (auth.user as { id: unknown }).id === "string"
        ? (auth.user as { id: string }).id
        : auth.user.email;

    const body: unknown = await request.json().catch(() => ({}));
    if (body === null || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const itemsRaw = (body as Record<string, unknown>).items;
    if (!Array.isArray(itemsRaw) || itemsRaw.length === 0) {
      return NextResponse.json({ error: "No items to update" }, { status: 400 });
    }

    const items = itemsRaw.filter(
      (entry): entry is { id: string; data: unknown } =>
        entry !== null &&
        typeof entry === "object" &&
        typeof (entry as { id?: unknown }).id === "string",
    );
    if (items.length !== itemsRaw.length) {
      return NextResponse.json({ error: "Each item must have an id" }, { status: 400 });
    }

    const result = await apiJson<{
      success: boolean;
      updated: Array<{ id: string; title: string; price: number; status: string }>;
    }>(`${process.env.BACKEND_API_URL}/api/products/bulk`, {
      method: "PATCH",
      headers: { ...auth.headers },
      body: JSON.stringify({ items }),
    });

    result.updated.forEach((updated) => {
      void logActivity({
        storeId,
        actorUserId,
        action: "PRODUCT_BULK_UPDATE",
        targetType: "PRODUCT",
        targetId: updated.id,
        after: {
          title: updated.title,
          price: updated.price,
          status: updated.status,
        },
      });
    });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/products/bulk", operation: "PATCH" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 },
    );
  }
}
