import { NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

export const dynamic = "force-dynamic";

interface ApiUsageAnalytics {
  overview: {
    totalApiCalls24h: number;
    totalApiCalls30d: number;
    avgResponseTime: number;
    errorRate: number;
    activeApiKeys: number;
  };
  topEndpoints: {
    endpoint: string;
    method: string;
    calls: number;
    avgResponseTime: number;
    errorRate: number;
  }[];
  merchantUsage: {
    storeId: string;
    storeName: string;
    apiKeyId: string;
    calls24h: number;
    calls30d: number;
    errorRate: number;
    lastUsed: string;
    status: string;
  }[];
  webhookStats: {
    totalWebhooks: number;
    successRate: number;
    avgDeliveryTime: number;
    pendingRetries: number;
    failedWebhooks: {
      id: string;
      storeName: string;
      endpoint: string;
      failedAt: string;
      error: string;
    }[];
  };
  rateLimitHits: {
    storeId: string;
    storeName: string;
    endpoint: string;
    hits: number;
    lastHit: string;
  }[];
  apiTrend: {
    hour: string;
    calls: number;
    errors: number;
  }[];
}

export async function GET() {
  try {
    const { user } = await OpsAuthService.requireSession();
    (OpsAuthService as any).requireRole(user, "OPS_SUPPORT");

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get API keys
    const apiKeys = await prisma.apiKey.findMany({
      where: {
        status: "ACTIVE",
      },
    });

    // Get store names for API keys
    const apiKeyStoreIds = [...new Set(apiKeys.map(k => k.storeId))];
    const apiKeyStores = await prisma.store.findMany({
      where: { id: { in: apiKeyStoreIds } },
      select: { id: true, name: true },
    });
    const apiKeyStoreMap = new Map(apiKeyStores.map(s => [s.id, s.name]));

    // Get webhook events for activity tracking
    const webhookEvents24h = await prisma.webhookEvent.findMany({
      where: {
        receivedAt: { gte: twentyFourHoursAgo },
      },
      include: {
        store: {
          select: { id: true, name: true },
        },
      },
    });

    const webhookEvents30d = await prisma.webhookEvent.findMany({
      where: {
        receivedAt: { gte: thirtyDaysAgo },
      },
    });

    // Calculate overview stats from webhook events as proxy for API activity
    const totalApiCalls24h = webhookEvents24h.length;
    const totalApiCalls30d = webhookEvents30d.length;

    // Estimate response time and error rate from webhook events
    const processedEvents24h = webhookEvents24h.filter((e) => e.status === "PROCESSED");
    const avgResponseTime =
      processedEvents24h.length > 0
        ? processedEvents24h.reduce((acc, e) => {
            if (e.processedAt && e.receivedAt) {
              return acc + (e.processedAt.getTime() - e.receivedAt.getTime());
            }
            return acc;
          }, 0) / processedEvents24h.length
        : 0;

    const errorEvents24h = webhookEvents24h.filter((e) => e.status === "FAILED" || e.error);
    const errorRate = webhookEvents24h.length > 0 ? (errorEvents24h.length / webhookEvents24h.length) * 100 : 0;

    // Count active API keys
    const activeApiKeys = apiKeys.length;

    // Top event types as proxy for endpoints
    const endpointMap = new Map<
      string,
      { method: string; calls: number; totalResponseTime: number; errors: number }
    >();

    webhookEvents24h.forEach((event) => {
      const key = `POST /webhooks/${event.eventType}`;
      const existing = endpointMap.get(key) || { method: "POST", calls: 0, totalResponseTime: 0, errors: 0 };
      existing.calls++;
      if (event.processedAt && event.receivedAt) {
        existing.totalResponseTime += event.processedAt.getTime() - event.receivedAt.getTime();
      }
      if (event.status === "FAILED" || event.error) existing.errors++;
      endpointMap.set(key, existing);
    });

    const topEndpoints = Array.from(endpointMap.entries())
      .map(([endpoint, data]) => ({
        endpoint: endpoint.split(" ").slice(1).join(" "),
        method: data.method,
        calls: data.calls,
        avgResponseTime: data.calls > 0 ? Math.round(data.totalResponseTime / data.calls) : 0,
        errorRate: data.calls > 0 ? Math.round((data.errors / data.calls) * 100 * 10) / 10 : 0,
      }))
      .sort((a, b) => b.calls - a.calls)
      .slice(0, 10);

    // Merchant usage based on webhook events
    const merchantMap = new Map<
      string,
      {
        storeName: string;
        apiKeyId: string;
        calls24h: number;
        calls30d: number;
        errors: number;
        lastUsed: Date;
      }
    >();

    webhookEvents24h.forEach((event) => {
      const storeId = event.merchantId;
      if (!storeId) return;

      const existing = merchantMap.get(storeId) || {
        storeName: event.store?.name || "Unknown",
        apiKeyId: "webhook",
        calls24h: 0,
        calls30d: 0,
        errors: 0,
        lastUsed: event.receivedAt,
      };
      existing.calls24h++;
      if (event.status === "FAILED" || event.error) existing.errors++;
      if (event.receivedAt > existing.lastUsed) existing.lastUsed = event.receivedAt;
      merchantMap.set(storeId, existing);
    });

    // Add 30-day data
    webhookEvents30d.forEach((event) => {
      const storeId = event.merchantId;
      if (!storeId) return;

      const existing = merchantMap.get(storeId);
      if (existing) {
        existing.calls30d++;
      }
    });

    const merchantUsage = Array.from(merchantMap.entries())
      .map(([storeId, data]) => ({
        storeId,
        storeName: data.storeName,
        apiKeyId: data.apiKeyId,
        calls24h: data.calls24h,
        calls30d: data.calls30d,
        errorRate: data.calls24h > 0 ? Math.round((data.errors / data.calls24h) * 100 * 10) / 10 : 0,
        lastUsed: data.lastUsed.toISOString(),
        status: data.calls24h > 100 ? "High Usage" : "Normal",
      }))
      .sort((a, b) => b.calls24h - a.calls24h)
      .slice(0, 20);

    // Webhook delivery stats
    const webhookDeliveries = await prisma.webhookDelivery.findMany({
      where: {
        createdAt: { gte: twentyFourHoursAgo },
      },
    });

    // Get store names for webhook deliveries
    const webhookStoreIds = [...new Set(webhookDeliveries.map(w => w.storeId))];
    const webhookStores = await prisma.store.findMany({
      where: { id: { in: webhookStoreIds } },
      select: { id: true, name: true },
    });
    const webhookStoreMap = new Map(webhookStores.map(s => [s.id, s.name]));

    const totalWebhooks = webhookDeliveries.length;
    const successfulWebhooks = webhookDeliveries.filter((w) => w.status === "DELIVERED").length;
    const webhookSuccessRate = totalWebhooks > 0 ? (successfulWebhooks / totalWebhooks) * 100 : 0;

    const avgDeliveryTime =
      webhookDeliveries.length > 0
        ? webhookDeliveries.reduce((acc, w) => acc + (w.attempt * 1000), 0) / webhookDeliveries.length
        : 0;

    const pendingRetries = await prisma.webhookDelivery.count({
      where: {
        status: "PENDING",
        nextRetryAt: { gt: now },
      },
    });

    const failedWebhooks = webhookDeliveries
      .filter((w) => w.status === "FAILED")
      .slice(0, 10)
      .map((w) => ({
        id: w.id,
        storeName: webhookStoreMap.get(w.storeId) || "Unknown",
        endpoint: w.eventType || "Unknown",
        failedAt: w.updatedAt.toISOString(),
        error: w.responseBodySnippet || "Delivery failed",
      }));

    // Rate limit hits - estimate from webhook events with errors
    const rateLimitEvents = webhookEvents24h.filter((e) => 
      e.error?.toLowerCase().includes("rate") || e.error?.toLowerCase().includes("limit")
    );

    const rateLimitMap = new Map<
      string,
      { storeName: string; endpoint: string; hits: number; lastHit: Date }
    >();

    rateLimitEvents.forEach((event) => {
      const storeId = event.merchantId;
      if (!storeId) return;

      const key = `${storeId}-webhooks`;
      const existing = rateLimitMap.get(key) || {
        storeName: event.store?.name || "Unknown",
        endpoint: "/webhooks/*",
        hits: 0,
        lastHit: event.receivedAt,
      };
      existing.hits++;
      if (event.receivedAt > existing.lastHit) existing.lastHit = event.receivedAt;
      rateLimitMap.set(key, existing);
    });

    const rateLimitHits = Array.from(rateLimitMap.entries())
      .map(([_, data]) => ({
        storeId: data.storeName,
        storeName: data.storeName,
        endpoint: data.endpoint,
        hits: data.hits,
        lastHit: data.lastHit.toISOString(),
      }))
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 10);

    // API trend (last 24 hours, hourly) based on webhook events
    const apiTrend: ApiUsageAnalytics["apiTrend"] = [];
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourStr = hour.toISOString().slice(0, 13) + ":00";
      const hourStart = new Date(hour.setMinutes(0, 0, 0));
      const hourEnd = new Date(hour.getTime() + 60 * 60 * 1000);

      const hourEvents = webhookEvents24h.filter(
        (e) => e.receivedAt >= hourStart && e.receivedAt < hourEnd,
      );

      apiTrend.push({
        hour: hourStr,
        calls: hourEvents.length,
        errors: hourEvents.filter((e) => e.status === "FAILED" || e.error).length,
      });
    }

    const analytics: ApiUsageAnalytics = {
      overview: {
        totalApiCalls24h,
        totalApiCalls30d,
        avgResponseTime: Math.round(avgResponseTime),
        errorRate: Math.round(errorRate * 10) / 10,
        activeApiKeys,
      },
      topEndpoints,
      merchantUsage,
      webhookStats: {
        totalWebhooks,
        successRate: Math.round(webhookSuccessRate * 10) / 10,
        avgDeliveryTime: Math.round(avgDeliveryTime),
        pendingRetries,
        failedWebhooks,
      },
      rateLimitHits,
      apiTrend,
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

    logger.error("[API_USAGE_ERROR]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
