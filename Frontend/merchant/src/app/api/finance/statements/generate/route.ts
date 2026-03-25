import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { prisma } from "@vayva/db";

function csvEscape(value: unknown): string {
  const raw = String(value ?? "");
  if (/[",\n]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

function parseMonthYear(input: { month: unknown; year: unknown }): { monthIndex: number; year: number } | null {
  const monthName = String(input.month || "");
  const year = Number(input.year);

  if (!monthName || !Number.isFinite(year)) return null;

  const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth() + 1;
  if (!Number.isFinite(monthIndex) || monthIndex < 1 || monthIndex > 12) return null;

  return { monthIndex, year };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const { searchParams } = new URL(request.url);
    const parsed = parseMonthYear({
      month: searchParams.get("month"),
      year: searchParams.get("year"),
    });
    if (!parsed) {
      return NextResponse.json({ error: "Invalid month/year" }, { status: 400 });
    }
    const { monthIndex, year } = parsed;

    const start = new Date(Date.UTC(year, monthIndex - 1, 1, 0, 0, 0));
    const end = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0));

    const orders = await prisma.order?.findMany({
      where: {
        storeId,
        status: { not: "CANCELLED" },
        createdAt: { gte: start, lt: end },
      },
      select: {
        id: true,
        orderNumber: true,
        createdAt: true,
        total: true,
        currency: true,
        paymentStatus: true,
      },
      orderBy: { createdAt: "asc" },
      take: 5000,
    });

    const header = ["order_id", "order_number", "created_at", "total", "currency", "payment_status"].join(",");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lines = orders.map((o: any) => [
      csvEscape(o.id),
      csvEscape(o.orderNumber),
      csvEscape(new Date(o.createdAt).toISOString()),
      csvEscape(o.total),
      csvEscape(o.currency),
      csvEscape(o.paymentStatus),
    ].join(","));

    const csv = [header, ...lines].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=statement_${year}_${monthIndex}.csv`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/finance/statements/generate',
      operation: 'GENERATE_STATEMENT',
    });
    return NextResponse.json(
      { error: 'Failed to complete operation' },
      { status: 500 }
    );
  }
}
