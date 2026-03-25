import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { handleApiError } from "@/lib/api-error-handler";
import { prisma } from "@vayva/db";

function formatNaira(value: number): string {
  return `₦${Math.round(value).toLocaleString("en-NG")}`;
}

function monthLabel(d: Date): string {
  return d.toLocaleString("en-NG", { month: "short" });
}

function mapStatus(status: string | null | undefined): "Completed" | "Pending" | "Failed" {
  const s = String(status || "").toUpperCase();
  if (s === "SUCCESS" || s === "SUCCESSFUL" || s === "COMPLETED") return "Completed";
  if (s === "FAILED" || s === "FAILURE") return "Failed";
  return "Pending";
}

/**
 * GET /api/finance/overview
 * Finance dashboard aggregate (used by /dashboard/finance)
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;

    const now = new Date();
    const start6Months = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [wallet, recentCharges, recentPayouts, monthAgg] = await Promise.all([
      (prisma as any).wallet?.findUnique({
        where: { storeId },
        select: {
          availableKobo: true,
          pendingKobo: true,
          vaStatus: true,
          vaBankName: true,
          vaAccountNumber: true,
          vaAccountName: true,
        },
      }),
      prisma.paymentTransaction?.findMany({
        where: { storeId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, createdAt: true, amount: true, status: true, reference: true },
      }),
      prisma.payout?.findMany({
        where: { storeId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, createdAt: true, amount: true, status: true, reference: true, destination: true },
      }),
      prisma.$queryRaw`
        SELECT
          DATE_TRUNC('month', o."createdAt") as month,
          COALESCE(SUM(o."total"), 0)::float as revenue
        FROM "Order" o
        WHERE o."storeId" = ${storeId}
          AND o."status" != 'CANCELLED'
          AND o."createdAt" >= ${start6Months}
        GROUP BY 1
        ORDER BY 1 ASC
      ` as Promise<Array<{ month: Date; revenue: number }>>,
    ]);

    const availableBalance = Number(wallet?.availableKobo || 0) / 100;
    const pendingBalance = Number(wallet?.pendingKobo || 0) / 100;
    const virtualAccount =
      wallet?.vaAccountNumber && wallet?.vaBankName && wallet?.vaAccountName
        ? {
            status: String(wallet?.vaStatus || "UNKNOWN"),
            bankName: String(wallet.vaBankName),
            accountNumber: String(wallet.vaAccountNumber),
            accountName: String(wallet.vaAccountName),
          }
        : null;

    // Build last 6 months labels and fill zeros where missing
    const months: Date[] = Array.from({ length: 6 }).map((_, i) => new Date(now.getFullYear(), now.getMonth() - (5 - i), 1));
    const monthMap = new Map<string, number>(
      (monthAgg || []).map((r) => [new Date(r.month).toISOString().slice(0, 7), Number(r.revenue || 0)]),
    );
    const revenueData = months.map((m) => {
      const key = m.toISOString().slice(0, 7);
      return { month: monthLabel(m), value: monthMap.get(key) ?? 0 };
    });

    const totalRevenueNum = revenueData.reduce((sum, r) => sum + r.value, 0);
    const pendingPayoutsNum = pendingBalance;

    const transactions = recentCharges.map((c) => ({
      id: c.id,
      date: c.createdAt ? c.createdAt.toLocaleDateString("en-NG") : "",
      description: c.reference || "Card / Transfer",
      amount: Number(c.amount || 0),
      type: "Credit" as const,
      status: mapStatus(c.status),
    }));

    const payouts = recentPayouts.map((p) => {
      const dest = (p.destination || null) as any;
      const bank = dest?.bankName
        ? `${dest.bankName}${dest.accountNumber ? ` · ${String(dest.accountNumber).slice(-4)}` : ""}`
        : (p.reference || "Withdrawal");
      return {
        id: p.id,
        amount: Number(p.amount || 0),
        bank,
        date: p.createdAt ? p.createdAt.toLocaleDateString("en-NG") : "",
        status: mapStatus(p.status),
      };
    });

    // Finance page expects these, but we don't yet compute real expense buckets/margins here.
    const expenseBreakdown: Array<{ label: string; value: number; color: string }> = [];
    const profitMarginData: Array<{ month: string; margin: number }> = [];

    return NextResponse.json(
      {
        revenueData,
        transactions,
        payouts,
        expenseBreakdown,
        profitMarginData,
        virtualAccount,
        kpis: {
          totalRevenue: formatNaira(totalRevenueNum),
          revenueTrend: "—",
          revenueTrendUp: true,
          availableBalance: formatNaira(availableBalance),
          balanceTrend: "—",
          balanceTrendUp: true,
          pendingPayouts: formatNaira(pendingPayoutsNum),
          payoutsTrend: "—",
          payoutsTrendUp: false,
          monthlyGrowth: "—",
          growthTrend: "—",
          growthTrendUp: true,
          totalExpenses: "₦0",
          currentMargin: "—",
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    handleApiError(error, { endpoint: "/api/finance/overview", operation: "GET" });
    return NextResponse.json({ error: "Failed to fetch finance overview" }, { status: 500 });
  }
}

