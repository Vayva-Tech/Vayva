/**
 * Real-Time Analytics Aggregation Service
 *
 * Computes rolling time-window metrics from the AnalyticsEvent table.
 * All queries use the existing DB indexes (storeId, timestamp).
 *
 * Designed to be called from dashboard API routes or background jobs.
 */

// ─── Prisma stub ─────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma: any =
  typeof globalThis !== "undefined" &&
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).__vayva_prisma
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).__vayva_prisma
    : {
        analyticsEvent: {
          count: async () => 0,
          groupBy: async () => [],
          findMany: async () => [],
        },
      };

// ─── Types ───────────────────────────────────────────────────────────────────

export type AggregationWindow = "1h" | "24h" | "7d" | "30d" | "90d";

export interface EventCountByCategory {
  category: string;
  count: number;
}

export interface TimeSeriesPoint {
  bucket: string; // ISO date string (truncated to hour/day)
  count: number;
  category?: string;
}

export interface AggregatedMetrics {
  storeId: string;
  window: AggregationWindow;
  totalEvents: number;
  byCategory: EventCountByCategory[];
  timeSeries: TimeSeriesPoint[];
  computedAt: string;
}

export interface FunnelMetricPoint {
  step: string;
  count: number;
  dropOffRate: number; // 0-1
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function windowToMs(window: AggregationWindow): number {
  const map: Record<AggregationWindow, number> = {
    "1h": 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
    "90d": 90 * 24 * 60 * 60 * 1000,
  };
  return map[window];
}

function bucketFormat(window: AggregationWindow): "hour" | "day" {
  return window === "1h" || window === "24h" ? "hour" : "day";
}

// ─── Aggregation Service ─────────────────────────────────────────────────────

export class AnalyticsAggregator {
  /**
   * Compute aggregate metrics for a store over a given time window.
   */
  async aggregate(
    storeId: string,
    window: AggregationWindow = "24h",
  ): Promise<AggregatedMetrics> {
    const since = new Date(Date.now() - windowToMs(window));
    const where = { storeId, timestamp: { gte: since } };

    // Total event count
    const totalEvents: number = await prisma.analyticsEvent.count({ where });

    // Group by category
    const categoryGroups: Array<{ category: string; _count: { id: number } }> =
      await prisma.analyticsEvent.groupBy({
        by: ["category"],
        where,
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      });

    const byCategory: EventCountByCategory[] = categoryGroups.map((g) => ({
      category: g.category,
      count: g._count.id,
    }));

    // Time-series points (raw events, bucketed in application layer)
    const rawEvents: Array<{ timestamp: Date; category: string }> =
      await prisma.analyticsEvent.findMany({
        where,
        select: { timestamp: true, category: true },
        orderBy: { timestamp: "asc" },
      });

    const timeSeries = this.buildTimeSeries(rawEvents, window);

    return {
      storeId,
      window,
      totalEvents,
      byCategory,
      timeSeries,
      computedAt: new Date().toISOString(),
    };
  }

  /**
   * Compute a simple funnel from ordered event names for a store.
   *
   * Returns step counts + drop-off rates for each step after the first.
   */
  async computeFunnel(
    storeId: string,
    steps: string[], // EventName values in order
    window: AggregationWindow = "30d",
  ): Promise<FunnelMetricPoint[]> {
    const since = new Date(Date.now() - windowToMs(window));

    const counts: number[] = await Promise.all(
      steps.map((action) =>
        prisma.analyticsEvent.count({
          where: { storeId, action, timestamp: { gte: since } },
        }),
      ),
    );

    return steps.map((step, i) => {
      const count = counts[i] ?? 0;
      const prev = i === 0 ? count : (counts[i - 1] ?? 1);
      const dropOffRate = i === 0 ? 0 : prev > 0 ? 1 - count / prev : 1;
      return { step, count, dropOffRate: Math.min(1, Math.max(0, dropOffRate)) };
    });
  }

  /**
   * Bucket raw events into time-series data points.
   */
  private buildTimeSeries(
    events: Array<{ timestamp: Date; category: string }>,
    window: AggregationWindow,
  ): TimeSeriesPoint[] {
    const fmt = bucketFormat(window);
    const buckets = new Map<string, number>();

    for (const ev of events) {
      const d = new Date(ev.timestamp);
      const key =
        fmt === "hour"
          ? `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}T${String(d.getUTCHours()).padStart(2, "0")}:00:00Z`
          : `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }

    return Array.from(buckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([bucket, count]) => ({ bucket, count }));
  }
}

// Singleton
export const analyticsAggregator = new AnalyticsAggregator();
