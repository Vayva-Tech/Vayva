import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(
  PERMISSIONS.FINANCE_VIEW,
  async (req, { storeId }) => {
    try {
      const url = new URL(req.url);
      const limit = Math.min(Number(url.searchParams.get("limit")) || 50, 200);

      // Fetch PaymentTransactions (charges) for this store
      const payments = await prisma.paymentTransaction.findMany({
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
      const payouts = await prisma.payout.findMany({
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
      const refunds = await prisma.refund.findMany({
        where: { storeId },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          chargeId: true,
          amount: true,
          currency: true,
          status: true,
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
          status: mapStatus(String(p.status)),
          date: p.createdAt.toISOString(),
          provider: p.provider || "unknown",
        })),
        ...payouts.map((p) => ({
          id: p.id,
          reference: p.reference || p.id,
          type: "PAYOUT" as const,
          amount: Number(p.amount),
          currency: p.currency || "NGN",
          status: mapStatus(p.status),
          date: p.createdAt.toISOString(),
          provider: p.provider || "unknown",
        })),
        ...refunds.map((r) => ({
          id: r.id,
          reference: r.chargeId || r.id,
          type: "REFUND" as const,
          amount: Number(r.amount),
          currency: r.currency || "NGN",
          status: mapStatus(r.status),
          date: r.createdAt.toISOString(),
          provider: "internal",
        })),
      ];

      // Sort by date descending and limit
      transactions.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      const limited = transactions.slice(0, limit);

      return NextResponse.json(
        { data: limited },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[FINANCE_TRANSACTIONS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to load transactions" },
        { status: 500 },
      );
    }
  },
);

function mapStatus(
  status: string | null | undefined,
): "SUCCESS" | "FAILED" | "PENDING" {
  if (!status) return "PENDING";
  const upper = status.toUpperCase();
  if (
    upper === "SUCCESS" ||
    upper === "SUCCESSFUL" ||
    upper === "COMPLETED" ||
    upper === "PAID"
  ) {
    return "SUCCESS";
  }
  if (upper === "FAILED" || upper === "REJECTED" || upper === "CANCELLED") {
    return "FAILED";
  }
  return "PENDING";
}
