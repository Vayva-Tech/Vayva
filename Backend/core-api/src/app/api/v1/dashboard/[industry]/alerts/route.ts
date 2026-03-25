// ============================================================================
// Dashboard Alerts API
// ============================================================================
// GET /api/v1/dashboard/:industry/alerts - Get active alerts
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth/session";
import type { AlertSeverity } from "@vayva/industry-core";

interface RouteParams {
  params: Promise<{
    industry: string;
  }>;
}

/**
 * GET /api/v1/dashboard/:industry/alerts
 * Get active alerts for a dashboard
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { industry } = await params;
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");
    const severity = searchParams.getAll("severity");

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID is required" },
        { status: 400 }
      );
    }

    // Fetch dashboard config to get alerts
    const config = await prisma.industryDashboardConfig.findUnique({
      where: {
        storeId_industry: {
          storeId,
          industry,
        },
      },
      include: {
        dashboardAlerts: {
          where: {
            enabled: true,
            ...(severity.length > 0 && {
              severity: { in: severity },
            }),
          },
          include: {
            history: {
              where: {
                resolvedAt: null,
              },
              orderBy: {
                triggeredAt: "desc",
              },
              take: 1,
            },
          },
        },
      },
    });

    if (!config) {
      return NextResponse.json({
        alerts: [],
        total: 0,
      });
    }

    // Format alerts for response
    const alerts = config.dashboardAlerts.flatMap((alert) =>
      alert.history.map((history) => ({
        id: history.id,
        ruleId: alert.id,
        severity: alert.severity as AlertSeverity,
        message: alert.message,
        triggeredAt: history.triggeredAt,
        data: history.data,
      }))
    );

    return NextResponse.json({
      alerts,
      total: alerts.length,
    });
  } catch (error) {
    console.error("Error fetching dashboard alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}
