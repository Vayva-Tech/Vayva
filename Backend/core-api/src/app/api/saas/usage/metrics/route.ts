import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

interface UsageAnalytics {
  totalApiCalls: number;
  totalBandwidth: number; // in GB
  byEndpoint: Array<{
    endpoint: string;
    calls: number;
    percentage: number;
    avgResponseTime: number;
  }>;
  topConsumers: Array<{
    tenantId: string;
    tenantName: string;
    apiCalls: number;
    bandwidth: number;
    period: string;
  }>;
  trends: Array<{
    period: string;
    apiCalls: number;
    bandwidth: number;
    activeTenants: number;
  }>;
}

export const GET = withVayvaAPI(
  PERMISSIONS.TEAM_VIEW,
  async (request: NextRequest, { storeId }: APIContext) => {
    try {
      const now = new Date();
      const _startOfDay = new Date(now.setHours(0, 0, 0, 0));

      // Get usage metrics from the last 24 hours
      const usageMetrics = await prisma.saaSUsageMetric.findMany({
        where: {
          storeId,
          periodStart: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          metricType: 'api_calls',
        },
        include: {
          tenant: true,
        },
      });

      // Calculate total API calls
      const totalApiCalls = usageMetrics.reduce((acc, m) => acc + (m.metricValue || 0), 0);

      // Calculate bandwidth (sum of all bandwidth metrics)
      const bandwidthMetrics = await prisma.saaSUsageMetric.findMany({
        where: {
          storeId,
          periodStart: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          metricType: 'bandwidth',
        },
      });
      const totalBandwidthGB = bandwidthMetrics.reduce((acc, m) => acc + (m.metricValue || 0), 0) / (1024 * 1024 * 1024);

      // Mock endpoint breakdown (in production, this would be tracked per endpoint)
      const endpointBreakdown = [
        { endpoint: '/api/v1/data', calls: Math.round(totalApiCalls * 0.42), percentage: 42, avgResponseTime: 120 },
        { endpoint: '/api/v1/users', calls: Math.round(totalApiCalls * 0.28), percentage: 28, avgResponseTime: 95 },
        { endpoint: '/api/v1/reports', calls: Math.round(totalApiCalls * 0.18), percentage: 18, avgResponseTime: 250 },
        { endpoint: '/api/v1/auth', calls: Math.round(totalApiCalls * 0.12), percentage: 12, avgResponseTime: 45 },
      ];

      // Get top consumers by tenant
      const tenantUsage = usageMetrics.reduce((acc, metric) => {
        if (!metric.tenantId) return acc;
        if (!acc[metric.tenantId]) {
          acc[metric.tenantId] = {
            tenantId: metric.tenantId,
            tenantName: metric.tenant?.name || 'Unknown',
            apiCalls: 0,
            bandwidth: 0,
          };
        }
        acc[metric.tenantId].apiCalls += metric.metricValue || 0;
        return acc;
      }, {} as Record<string, { tenantId: string; tenantName: string; apiCalls: number; bandwidth: number }>);

      const topConsumers = Object.values(tenantUsage)
        .sort((a, b) => b.apiCalls - a.apiCalls)
        .slice(0, 5)
        .map(consumer => ({
          ...consumer,
          bandwidth: Math.round(consumer.apiCalls * 0.1), // Estimate bandwidth
          period: 'Last 24h',
        }));

      // Generate 7-day trend data
      const trends = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dayLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        // Mock trend data with some variation
        const baseCalls = totalApiCalls / 7;
        const variation = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
        const dayCalls = Math.round(baseCalls * variation);
        
        trends.push({
          period: dayLabel,
          apiCalls: dayCalls,
          bandwidth: Math.round(dayCalls * 0.3), // Estimate
          activeTenants: Math.round(800 + Math.random() * 100),
        });
      }

      const analytics: UsageAnalytics = {
        totalApiCalls,
        totalBandwidth: Math.round(totalBandwidthGB),
        byEndpoint: endpointBreakdown,
        topConsumers,
        trends,
      };

      return NextResponse.json({ data: analytics }, {
        headers: { "Cache-Control": "no-store" },
      });
    } catch (error: unknown) {
      logger.error("[SAAS_USAGE_METRICS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch usage analytics" },
        { status: 500 }
      );
    }
  }
);
