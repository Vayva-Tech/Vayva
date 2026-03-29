import { NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";
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

    const response = await apiClient.get('/api/v1/admin/support/analytics');
    
    return NextResponse.json(response);
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
