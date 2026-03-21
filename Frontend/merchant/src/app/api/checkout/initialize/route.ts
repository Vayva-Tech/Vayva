// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function POST(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const email = user.email || null;
        const body = await request.json().catch(() => null);
        const rawItems = body?.items;

        if (!Array.isArray(rawItems) || rawItems.length === 0) {
            return NextResponse.json({ error: "Checkout must include items" }, { status: 400 });
        }

        const normalizedItems: CheckoutItem[] = rawItems
            .map((item: unknown) => ({
                productId: String((item as { productId?: string })?.productId || ""),
                quantity: Number((item as { quantity?: number })?.quantity || 0),
            }))
            .filter((item: CheckoutItem) => item.productId && Number.isFinite(item.quantity) && item.quantity > 0);

        if (normalizedItems.length === 0) {
            return NextResponse.json({ error: "Invalid items" }, { status: 400 });
        }

        // Call backend API to initialize checkout
        const result = await apiJson<{
            success: boolean;
            orderId?: string;
            orderNumber?: string;
            paymentUrl?: string;
            totalAmount?: number;
            currency?: string;
            error?: string;
        }>(
            `${process.env.BACKEND_API_URL}/api/checkout/initialize`,
      {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-store-id": storeId,
                },
                body: JSON.stringify({ items: normalizedItems, email }),
            }
        );
        
        if (result.error || !result.success) {
            return NextResponse.json(result, { status: 400 });
        }
        
        return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/checkout/initialize", operation: "POST" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
