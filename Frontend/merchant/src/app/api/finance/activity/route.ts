import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { handleApiError } from "@/lib/api-error-handler";
import { prisma } from "@vayva/db";

function mapStatus(status: string | null | undefined): string {
  const s = String(status || "").toUpperCase();
  if (s === "SUCCESS" || s === "SUCCESSFUL" || s === "COMPLETED") return "completed";
  if (s === "FAILED" || s === "FAILURE") return "failed";
  if (s === "PENDING") return "pending";
  if (s === "PROCESSING") return "processing";
  if (s === "PAID") return "paid";
  if (s === "APPROVAL_REQUIRED") return "approval_required";
  return s.toLowerCase() || "unknown";
}

type ActivityItem =
  | {
      id: string;
      kind: "CHARGE";
      reference: string;
      amount: number;
      currency: string;
      status: string;
      date: string;
      direction: "in";
      counterparty?: string;
      provider?: string;
    }
  | {
      id: string;
      kind: "WITHDRAWAL";
      reference: string;
      amount: number;
      currency: string;
      status: string;
      date: string;
      direction: "out";
      counterparty?: string;
      provider?: string;
    }
  | {
      id: string;
      kind: "REFUND";
      reference: string;
      amount: number;
      currency: string;
      status: string;
      date: string;
      direction: "out";
      counterparty?: string;
      provider?: string;
    }
  | {
      id: string;
      kind: "AFFILIATE_PAYOUT";
      reference: string;
      amount: number;
      currency: string;
      status: string;
      date: string;
      direction: "out";
      counterparty?: string;
      provider?: string;
    };

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storeId = auth.user.storeId;
    const url = new URL(request.url);
    const limit = Math.min(Number(url.searchParams.get("limit") || "50"), 200);

    const [charges, payouts, refunds, affiliatePayouts] = await Promise.all([
      prisma.paymentTransaction.findMany({
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
      }),
      prisma.payout.findMany({
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
          destination: true,
          createdAt: true,
        },
      }),
      prisma.refund.findMany({
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
      }),
      prisma.affiliatePayout.findMany({
        where: { storeId },
        orderBy: { initiatedAt: "desc" },
        take: limit,
        select: {
          id: true,
          amount: true,
          netAmount: true,
          status: true,
          bankName: true,
          accountNumber: true,
          initiatedAt: true,
        },
      }),
    ]);

    const items: ActivityItem[] = [
      ...charges.map((c) => ({
        id: c.id,
        kind: "CHARGE" as const,
        reference: c.reference || c.id,
        amount: Number(c.amount || 0),
        currency: c.currency || "NGN",
        status: mapStatus(c.status),
        date: c.createdAt.toISOString(),
        direction: "in" as const,
        provider: c.provider || undefined,
      })),
      ...payouts.map((p) => {
        const dest = (p.destination || null) as any;
        const counterparty = dest?.bankName
          ? `${String(dest.bankName)}${dest?.accountNumber ? ` · ${String(dest.accountNumber).slice(-4)}` : ""}`
          : undefined;
        return {
          id: p.id,
          kind: "WITHDRAWAL" as const,
          reference: p.reference || p.id,
          amount: Number(p.amount || 0),
          currency: p.currency || "NGN",
          status: mapStatus(p.status),
          date: p.createdAt.toISOString(),
          direction: "out" as const,
          counterparty,
          provider: p.provider || undefined,
        };
      }),
      ...refunds.map((r) => ({
        id: r.id,
        kind: "REFUND" as const,
        reference: r.chargeId || r.id,
        amount: Number(r.amount || 0),
        currency: r.currency || "NGN",
        status: mapStatus(r.status),
        date: r.createdAt.toISOString(),
        direction: "out" as const,
        provider: r.providerRefundId ? "external" : "internal",
      })),
      ...affiliatePayouts.map((p) => ({
        id: p.id,
        kind: "AFFILIATE_PAYOUT" as const,
        reference: `AFF-PAYOUT-${p.id}`,
        amount: Number(p.amount || 0),
        currency: "NGN",
        status: mapStatus(p.status),
        date: p.initiatedAt.toISOString(),
        direction: "out" as const,
        counterparty: p.bankName
          ? `${p.bankName}${p.accountNumber ? ` · ${String(p.accountNumber).slice(-4)}` : ""}`
          : undefined,
        provider: "paystack",
      })),
    ];

    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const limited = items.slice(0, limit);

    return NextResponse.json({ data: limited }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    handleApiError(error, { endpoint: "/api/finance/activity", operation: "GET" });
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
  }
}

