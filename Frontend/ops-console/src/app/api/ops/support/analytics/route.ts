import { NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

export const dynamic = "force-dynamic";

interface SupportAnalytics {
  overview: {
    totalTickets: number;
    openTickets: number;
    resolvedToday: number;
    avgResolutionTime: number; // in hours
    satisfactionScore: number;
  };
  byCategory: {
    category: string;
    count: number;
    avgResolutionTime: number;
    percentage: number;
  }[];
  byPriority: {
    priority: string;
    count: number;
    avgResolutionTime: number;
  }[];
  volumeTrend: {
    date: string;
    created: number;
    resolved: number;
  }[];
  agentPerformance: {
    agentId: string;
    agentName: string;
    ticketsResolved: number;
    avgResolutionTime: number;
    satisfactionScore: number;
  }[];
  escalationMetrics: {
    totalEscalations: number;
    escalationRate: number;
    avgEscalationTime: number;
  };
  merchantHealth: {
    highTicketMerchants: { storeId: string; storeName: string; ticketCount: number }[];
    avgTicketsPerMerchant: number;
  };
}

export async function GET() {
  try {
    const { user } = await OpsAuthService.requireSession();
    (OpsAuthService as any).requireRole(user, "OPS_SUPPORT");

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const today = new Date(now.setHours(0, 0, 0, 0));

    // Get all tickets from last 30 days
    const tickets = await prisma.supportTicket.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      include: {
        store: { select: { id: true, name: true } },
        ticketMessages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        feedback: true,
      },
    });

    // Calculate overview metrics
    const totalTickets = tickets.length;
    const openTickets = tickets.filter((t) => t.status === "open").length;
    const resolvedToday = tickets.filter(
      (t) =>
        t.status === "resolved" &&
        t.updatedAt >= today,
    ).length;

    // Calculate average resolution time (use updatedAt as proxy for resolved time)
    const resolvedTickets = tickets.filter((t) => t.status === "resolved");
    const avgResolutionTime =
      resolvedTickets.length > 0
        ? resolvedTickets.reduce((acc, t) => {
            const resolved = new Date(t.updatedAt).getTime();
            const created = new Date(t.createdAt).getTime();
            return acc + (resolved - created) / (1000 * 60 * 60); // hours
          }, 0) / resolvedTickets.length
        : 0;

    // Group by category
    const categoryMap = new Map<string, { count: number; totalTime: number }>();
    tickets.forEach((t) => {
      const cat = t.category || "General";
      const existing = categoryMap.get(cat) || { count: 0, totalTime: 0 };
      existing.count++;
      if (t.status === "resolved") {
        const resolved = new Date(t.updatedAt).getTime();
        const created = new Date(t.createdAt).getTime();
        existing.totalTime += (resolved - created) / (1000 * 60 * 60);
      }
      categoryMap.set(cat, existing);
    });

    const byCategory = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      count: data.count,
      avgResolutionTime: data.count > 0 ? Math.round(data.totalTime / data.count) : 0,
      percentage: Math.round((data.count / totalTickets) * 100),
    })).sort((a, b) => b.count - a.count);

    // Group by priority
    const priorityMap = new Map<string, { count: number; totalTime: number }>();
    tickets.forEach((t) => {
      const pri = t.priority || "medium";
      const existing = priorityMap.get(pri) || { count: 0, totalTime: 0 };
      existing.count++;
      if (t.status === "resolved") {
        const resolved = new Date(t.updatedAt).getTime();
        const created = new Date(t.createdAt).getTime();
        existing.totalTime += (resolved - created) / (1000 * 60 * 60);
      }
      priorityMap.set(pri, existing);
    });

    const byPriority = Array.from(priorityMap.entries()).map(([priority, data]) => ({
      priority,
      count: data.count,
      avgResolutionTime: data.count > 0 ? Math.round(data.totalTime / data.count) : 0,
    })).sort((a, b) => b.count - a.count);

    // Volume trend (last 14 days)
    const volumeTrend: { date: string; created: number; resolved: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const created = tickets.filter(
        (t) => t.createdAt >= dayStart && t.createdAt <= dayEnd,
      ).length;
      const resolved = tickets.filter(
        (t) =>
          t.status === "resolved" &&
          t.updatedAt >= dayStart &&
          t.updatedAt <= dayEnd,
      ).length;

      volumeTrend.push({ date: dateStr, created, resolved });
    }

    // Agent performance - use assignedToUserId and get user details separately
    const assignedUserIds = [...new Set(resolvedTickets.map(t => t.assignedToUserId).filter((id): id is string => !!id))];
    const assignedUsers = assignedUserIds.length > 0 ? await prisma.user.findMany({
      where: { id: { in: assignedUserIds } },
      select: { id: true, firstName: true, lastName: true },
    }) : [];
    const userMap = new Map(assignedUsers.map(u => [u.id, `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Unknown"]));

    const agentMap = new Map<string, { 
      name: string; 
      resolved: number; 
      totalTime: number;
      satisfactionSum: number;
      satisfactionCount: number;
    }>();
    
    resolvedTickets.forEach((t) => {
      if (t.assignedToUserId) {
        const existing = agentMap.get(t.assignedToUserId) || {
          name: userMap.get(t.assignedToUserId) || "Unknown",
          resolved: 0,
          totalTime: 0,
          satisfactionSum: 0,
          satisfactionCount: 0,
        };
        existing.resolved++;
        const resolved = new Date(t.updatedAt).getTime();
        const created = new Date(t.createdAt).getTime();
        existing.totalTime += (resolved - created) / (1000 * 60 * 60);
        if (t.feedback?.rating) {
          const ratingMap: Record<string, number> = { "ONE": 1, "TWO": 2, "THREE": 3, "FOUR": 4, "FIVE": 5 };
          existing.satisfactionSum += ratingMap[t.feedback.rating] || 0;
          existing.satisfactionCount++;
        }
        agentMap.set(t.assignedToUserId, existing);
      }
    });

    const agentPerformance = Array.from(agentMap.entries()).map(([agentId, data]) => ({
      agentId,
      agentName: data.name,
      ticketsResolved: data.resolved,
      avgResolutionTime: data.resolved > 0 ? Math.round(data.totalTime / data.resolved) : 0,
      satisfactionScore: data.satisfactionCount > 0 
        ? Math.round((data.satisfactionSum / data.satisfactionCount) * 10) / 10 
        : 0,
    })).sort((a, b) => b.ticketsResolved - a.ticketsResolved);

    // Escalation metrics - use handoffEvents as proxy for escalations
    const escalations = await prisma.handoffEvent.count({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    const escalationEvents = await prisma.handoffEvent.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      include: {
        ticket: {
          select: { createdAt: true },
        },
      },
    });

    const avgEscalationTime =
      escalationEvents.length > 0
        ? escalationEvents.reduce((acc, e) => {
            const escalated = new Date(e.createdAt).getTime();
            const ticketCreated = new Date(e.ticket.createdAt).getTime();
            return acc + (escalated - ticketCreated) / (1000 * 60 * 60);
          }, 0) / escalationEvents.length
        : 0;

    // Merchant health metrics
    const merchantTicketMap = new Map<string, { name: string; count: number }>();
    tickets.forEach((t) => {
      if (t.store) {
        const existing = merchantTicketMap.get(t.store.id) || {
          name: t.store.name,
          count: 0,
        };
        existing.count++;
        merchantTicketMap.set(t.store.id, existing);
      }
    });

    const highTicketMerchants = Array.from(merchantTicketMap.entries())
      .filter(([_, data]) => data.count > 2)
      .map(([storeId, data]) => ({
        storeId,
        storeName: data.name,
        ticketCount: data.count,
      }))
      .sort((a, b) => b.ticketCount - a.ticketCount)
      .slice(0, 10);

    const uniqueMerchants = merchantTicketMap.size;
    const avgTicketsPerMerchant = uniqueMerchants > 0 ? totalTickets / uniqueMerchants : 0;

    // Calculate satisfaction score from feedback
    const ratedTickets = tickets.filter((t) => t.feedback?.rating);
    const satisfactionScore =
      ratedTickets.length > 0
        ? ratedTickets.reduce((acc, t) => {
            const ratingMap: Record<string, number> = { "ONE": 1, "TWO": 2, "THREE": 3, "FOUR": 4, "FIVE": 5 };
            return acc + (ratingMap[t.feedback!.rating] || 0);
          }, 0) / ratedTickets.length
        : 0;

    const analytics: SupportAnalytics = {
      overview: {
        totalTickets,
        openTickets,
        resolvedToday,
        avgResolutionTime: Math.round(avgResolutionTime),
        satisfactionScore: Math.round(satisfactionScore * 10) / 10,
      },
      byCategory,
      byPriority,
      volumeTrend,
      agentPerformance,
      escalationMetrics: {
        totalEscalations: escalations,
        escalationRate: totalTickets > 0 ? Math.round((escalations / totalTickets) * 100) : 0,
        avgEscalationTime: Math.round(avgEscalationTime),
      },
      merchantHealth: {
        highTicketMerchants,
        avgTicketsPerMerchant: Math.round(avgTicketsPerMerchant * 10) / 10,
      },
    };

    return NextResponse.json({ data: analytics });
  } catch (error: unknown) {
    if (
      error instanceof Error ? error.message : String(error) === "Unauthorized"
    )
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (
      error instanceof Error
        ? error.message
        : String(error)?.includes("Insufficient permissions")
    )
      return NextResponse.json(
        { error: error instanceof Error ? error.message : String(error) },
        { status: 403 },
      );

    logger.error("[SUPPORT_ANALYTICS_ERROR]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
