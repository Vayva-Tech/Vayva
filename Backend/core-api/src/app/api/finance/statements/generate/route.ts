import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

function csvEscape(value: unknown): string {
  const raw = String(value ?? "");
  if (/[",\n]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseMonthYear(input: {
  month: unknown;
  year: unknown;
}): { monthIndex: number; year: number } | null {
  const monthName = String(input.month || "");
  const year = Number(input.year);

  if (!monthName || !Number.isFinite(year)) return null;

  const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth() + 1;
  if (!Number.isFinite(monthIndex) || monthIndex < 1 || monthIndex > 12)
    return null;

  return { monthIndex, year };
}

export const GET = withVayvaAPI(
  PERMISSIONS.FINANCE_VIEW,
  async (req, { storeId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const parsed = parseMonthYear({
        month: searchParams.get("month"),
        year: searchParams.get("year"),
      });
      if (!parsed) {
        return NextResponse.json(
          { error: "Invalid month/year" },
          { status: 400 },
        );
      }
      const { monthIndex, year } = parsed;

      const start = new Date(Date.UTC(year, monthIndex - 1, 1, 0, 0, 0));
      const end = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0));

      const orders = await prisma.order.findMany({
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

      const header = [
        "order_id",
        "order_number",
        "created_at",
        "total",
        "currency",
        "payment_status",
      ].join(",");
      const lines = orders.map((o) =>
        [
          csvEscape(o.id),
          csvEscape(o.orderNumber),
          csvEscape(new Date(o.createdAt).toISOString()),
          csvEscape(o.total),
          csvEscape(o.currency),
          csvEscape(o.paymentStatus),
        ].join(","),
      );

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
      logger.error("[FINANCE_STATEMENTS_GENERATE]", error);
      return NextResponse.json(
        { error: "Failed to generate statement" },
        { status: 500 },
      );
    }
  },
);

export const POST = withVayvaAPI(PERMISSIONS.FINANCE_VIEW, async (req) => {
  try {
    const parsedBody: unknown = await req.json().catch(() => ({}));
    const body = isRecord(parsedBody) ? parsedBody : {};
    const month = body.month;
    const yearVal = body.year;
    const parsed = parseMonthYear({ month, year: yearVal });
    if (!parsed) {
      return NextResponse.json(
        { error: "Invalid month/year" },
        { status: 400 },
      );
    }
    const { monthIndex, year } = parsed;
    const url = `/api/finance/statements/generate?month=${encodeURIComponent(String(month))}&year=${encodeURIComponent(String(year))}`;
    return NextResponse.json(
      { url, monthIndex, year },
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    logger.error("[FINANCE_STATEMENTS_GENERATE_POST]", error);
    return NextResponse.json(
      { error: "Failed to generate statement" },
      { status: 500 },
    );
  }
});
