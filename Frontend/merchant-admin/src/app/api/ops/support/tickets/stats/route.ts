import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";

const INTERNAL_SECRET = process.env?.INTERNAL_API_SECRET;

function verifyInternalAuth(req: NextRequest): boolean {
  if (!INTERNAL_SECRET) {
    logger.error("[INTERNAL_AUTH] INTERNAL_API_SECRET not configured");
    return false;
  }
  const secret = req.headers?.get("x-internal-secret");
  return secret === INTERNAL_SECRET;
}

export const dynamic = "force-dynamic";

// GET /api/ops/support/tickets/stats - Get ticket statistics
export async function GET(req: NextRequest) {
  try {
    if (!verifyInternalAuth(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");

    const dateFilter: { createdAt?: { gte?: Date; lte?: Date } } = {};
    if (fromDate || toDate) {
      dateFilter.createdAt = {};
      if (fromDate) dateFilter.createdAt!.gte = new Date(fromDate);
      if (toDate) dateFilter.createdAt!.lte = new Date(toDate);
    }

    const [
      total,
      open,
      resolved,
      pending,
      escalated,
      byPriority,
      byCategory,
    ] = await Promise.all([
      prisma.supportTicket?.count({ where: dateFilter }),
      prisma.supportTicket?.count({ where: { ...dateFilter, status: status as any } }),
      prisma.supportTicket?.count({ where: { ...dateFilter, status: "resolved" } }),
      prisma.supportTicket?.count({ where: { ...dateFilter, status: status as any } }),
      prisma.supportTicket?.count({ where: { ...dateFilter, priority: { in: ["high", "urgent"] } } }),
      prisma.supportTicket?.groupBy({
        by: ["priority"],
        where: dateFilter,
        _count: { priority: true },
      }),
      prisma.supportTicket?.groupBy({
        by: ["category"],
        where: dateFilter,
        _count: { category: true },
      }),
      // Average resolution time calculated manually below
    ]);

    // Calculate average resolution time manually
    const resolvedTickets = await prisma.supportTicket?.findMany({
      where: { ...dateFilter, status: "resolved" },
      select: { createdAt: true, updatedAt: true },
    });

    let avgResolutionHours = 0;
    if (resolvedTickets.length > 0) {
      const totalHours = resolvedTickets.reduce((sum: number, ticket: { createdAt: Date; updatedAt: Date }) => {
        const created = new Date(ticket.createdAt).getTime();
        const resolved = new Date(ticket.updatedAt).getTime();
        return sum + (resolved - created) / (1000 * 60 * 60);
      }, 0);
      avgResolutionHours = Math.round(totalHours / resolvedTickets.length);
    }

    return NextResponse.json({
      data: {
        total,
        open,
        resolved,
        pending,
        escalated,
        byPriority: byPriority.reduce((acc: Record<string, number>, item: { priority: string; _count: { priority: number } }) => {
          acc[item.priority] = item._count?.priority;
          return acc;
        }, {} as Record<string, number>),
        byCategory: byCategory.reduce((acc: Record<string, number>, item: { category: string; _count: { category: number } }) => {
          acc[item.category] = item._count?.category;
          return acc;
        }, {} as Record<string, number>),
        avgResolutionHours,
      },
    });
  } catch (error) {
    logger.error("[OPS_TICKET_STATS] Failed to fetch ticket stats", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
