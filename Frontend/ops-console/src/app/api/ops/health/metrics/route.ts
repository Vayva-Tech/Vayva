import { NextRequest, NextResponse } from "next/server";
import { getMetricStats, metricsManager } from "@/lib/stubs/reliability";
import { OpsAuthService } from "@/lib/ops-auth";
import { opsApiAuthErrorResponse } from "@/lib/ops-api-auth";

/**
 * GET /api/ops/health/metrics
 * 
 * Returns aggregated metrics for the health dashboard:
 * - API latency statistics (p50, p95, p99)
 * - Error rates
 * - WhatsApp delivery rates
 * - System resource usage
 */
export async function GET(_req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();
    try {
      OpsAuthService.requireRole(user, "OPERATOR");
    } catch (roleErr) {
      const r = opsApiAuthErrorResponse(roleErr);
      if (r) return r;
      throw roleErr;
    }

    // Initialize metrics manager
    await metricsManager.init();

    // Get metrics from the last hour
    const timeRange = "1h";

    // Fetch various metric statistics
    const [latency, errors, whatsapp, orders, payments] = await Promise.all([
      // API latency
      getMetricStats("api.latency", timeRange),
      // Error rate
      getMetricStats("api.errors", timeRange),
      // WhatsApp delivery rate
      getMetricStats("whatsapp.delivery.rate", timeRange),
      // Order creation rate
      getMetricStats("orders.created", timeRange),
      // Payment success rate
      getMetricStats("payment.success_rate", timeRange),
    ]);

    return NextResponse.json(
      {
        latency,
        errors,
        whatsapp,
        orders,
        payments,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (error) {
    const authRes = opsApiAuthErrorResponse(error);
    if (authRes) return authRes;
    console.error("[HEALTH_METRICS] Error fetching metrics:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch metrics",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
