import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

interface CheckoutItem {
  productId: string;
  quantity: number;
}

export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email =
      "email" in auth.user && typeof auth.user.email === "string"
        ? auth.user.email
        : null;

    const body: unknown = await request.json().catch(() => null);
    const rawItems =
      body !== null && typeof body === "object" && "items" in body
        ? (body as { items?: unknown }).items
        : undefined;

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json(
        { error: "Checkout must include items" },
        { status: 400 },
      );
    }

    const normalizedItems: CheckoutItem[] = rawItems
      .map((item: unknown) => ({
        productId: String((item as { productId?: string })?.productId || ""),
        quantity: Number((item as { quantity?: number })?.quantity || 0),
      }))
      .filter(
        (item): item is CheckoutItem =>
          Boolean(item.productId) &&
          Number.isFinite(item.quantity) &&
          item.quantity > 0,
      );

    if (normalizedItems.length === 0) {
      return NextResponse.json({ error: "Invalid items" }, { status: 400 });
    }

    const result = await apiJson<{
      success: boolean;
      orderId?: string;
      orderNumber?: string;
      paymentUrl?: string;
      totalAmount?: number;
      currency?: string;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/checkout/initialize`, {
      method: "POST",
      headers: { ...auth.headers },
      body: JSON.stringify({ items: normalizedItems, email }),
    });

    if (result.error || !result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/checkout/initialize",
      operation: "POST_CHECKOUT_INITIALIZE",
    });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 },
    );
  }
}
