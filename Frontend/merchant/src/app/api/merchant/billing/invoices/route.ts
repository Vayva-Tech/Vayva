/**
 * GET /api/merchant/billing/invoices
 *
 * Get usage-based invoices for the current store
 */

import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { logger, ErrorCategory } from "@/lib/logger";

const backendBase = () => process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";

type UsageInvoiceRow = {
  id: string;
  invoiceNumber?: string;
  periodStart?: string;
  periodEnd?: string;
  baseAmount: unknown;
  overageAmount: unknown;
  totalAmount: unknown;
  status?: string;
  paidAt?: string | null;
  lineItems?: unknown;
  createdAt?: string | Date;
};

function isUsageInvoiceRow(v: unknown): v is UsageInvoiceRow {
  return (
    typeof v === "object" &&
    v !== null &&
    "id" in v &&
    typeof (v as { id: unknown }).id === "string"
  );
}

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!auth.user.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const queryParams = new URLSearchParams();
    if (status) queryParams.set("status", status.toUpperCase());

    const invoices = await apiJson<unknown>(
      `${backendBase()}/api/usageinvoice?${queryParams.toString()}`,
      {
        headers: auth.headers,
      }
    );

    const list: UsageInvoiceRow[] = Array.isArray(invoices)
      ? invoices.filter(isUsageInvoiceRow)
      : [];

    return NextResponse.json({
      invoices: list.map((inv) => ({
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
        createdAt:
          inv.createdAt instanceof Date ? inv.createdAt.toISOString() : inv.createdAt,
      })),
    });
  } catch (error) {
    logger.error("[BILLING_INVOICES_API_ERROR]", ErrorCategory.API, error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}
