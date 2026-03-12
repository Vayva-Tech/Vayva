/**
 * GET /api/merchant/billing/invoices
 * 
 * Get usage-based invoices for the current store
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@vayva/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.storeId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const storeId = session.user.storeId;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: { storeId: string; status?: string } = { storeId };
    if (status) {
      where.status = status.toUpperCase();
    }

    const invoices = await prisma.usageInvoice.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 12, // Last 12 invoices
    });

    return NextResponse.json({
      invoices: invoices.map(inv => ({
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
