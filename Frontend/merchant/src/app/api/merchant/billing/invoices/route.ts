// @ts-nocheck
/**
 * GET /api/merchant/billing/invoices
 *
 * Get usage-based invoices for the current store
 */

import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const queryParams = new URLSearchParams();
    if (status) queryParams.set("status", status.toUpperCase());

    const invoices = await apiJson<Array<any>>(
      `${process.env.BACKEND_API_URL}/api/usageinvoice?${queryParams.toString()}`,
      {
        headers: {
          "x-store-id": storeId,
        },
      }
    );

    const list = Array.isArray(invoices) ? invoices : [];

    return NextResponse.json({
      invoices: list.map((inv: any) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        periodStart: inv.periodStart,
        periodEnd: inv.periodEnd,
        baseAmount: Number(inv.baseAmount),
        overageAmount: Number(inv.overageAmount),
        totalAmount: Number(inv.totalAmount),
        status: inv.status,
        paidAt: inv.paidAt,
        lineItems: inv.lineItems,
        createdAt: inv.createdAt,
      })),
    });
  } catch (error) {
    console.error("[BILLING_INVOICES_API_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}
