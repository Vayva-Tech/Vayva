import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { prisma } from "@vayva/db";

function mapStatus(status: string | null | undefined): string {
  const s = (status || "").toUpperCase();
  if (s === "SUCCESS" || s === "SUCCESSFUL" || s === "COMPLETED") return "success";
  if (s === "FAILED" || s === "FAILURE") return "failed";
  if (s === "PENDING") return "pending";
  return s.toLowerCase() || "unknown";
}

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const url = new URL(request.url);
    const limit = Math.min(Number(url.searchParams?.get("limit")) || 50, 200);

    // Fetch PaymentTransactions (charges) for this store
    const payments = await prisma.paymentTransaction?.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        reference: true,
        amount: true,
        currency: true,
        status: true,
        provider: true,
        type: true,
        createdAt: true,
      },
    });

    // Fetch payouts for this store
    const payouts = await prisma.payout?.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        reference: true,
        amount: true,
        currency: true,
        status: true,
        provider: true,
        createdAt: true,
      },
    });

    // Fetch refunds for this store
    const refunds = await prisma.refund?.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        chargeId: true,
        amount: true,
        currency: true,
        status: true,
        providerRefundId: true,
        createdAt: true,
      },
    });

    // Normalize into unified transaction format
    const transactions = [
      ...payments.map((p) => ({
        id: p.id,
        reference: p.reference || p.id,
        type: "CHARGE" as const,
        amount: Number(p.amount),
        currency: p.currency || "NGN",
        status: mapStatus(p.status),
        date: p.createdAt?.toISOString(),
        provider: p.provider || "unknown",
      })),
      ...payouts.map((p) => ({
        id: p.id,
        reference: p.reference || p.id,
        type: "PAYOUT" as const,
        amount: Number(p.amount),
        currency: p.currency || "NGN",
        status: mapStatus(p.status),
        date: p.createdAt?.toISOString(),
        provider: p.provider || "unknown",
      })),
      ...refunds.map((r) => ({
        id: r.id,
        reference: r.chargeId || r.id,
        type: "REFUND" as const,
        amount: Number(r.amount),
        currency: r.currency || "NGN",
        status: mapStatus(r.status),
        date: r.createdAt?.toISOString(),
        provider: r.providerRefundId ? "external" : "internal",
      })),
    ];

    // Sort by date descending and limit
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const limited = transactions.slice(0, limit);

    return NextResponse.json({ data: limited }, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    handleApiError(error, { endpoint: "/api/finance/transactions", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
