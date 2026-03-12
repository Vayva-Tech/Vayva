import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  MetricsManager,
  metricsManager,
  recordMetric,
  incrementCounter,
  recordTimer,
  recordGauge,
  recordHistogram,
  timeFunction,
  getMetricStats,
  Metrics,
  BusinessMetrics,
  type MetricValue,
} from "../metrics";

// Mock the logger
vi.mock("@vayva/shared", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("MetricsManager", () => {
  beforeEach(() => {
    metricsManager.clear();
  });

  describe("record", () => {
    it("should record a metric with default type", async () => {
      await metricsManager.record("test.metric", 100);

      const stats = metricsManager.getStats("test.metric");
      expect(stats).not.toBeNull();
      expect(stats?.count).toBe(1);
      expect(stats?.sum).toBe(100);
    });

    it("should record a metric with tags", async () => {
      await metricsManager.record("test.metric", 100, {
        tags: { env: "test", region: "us-east" },
      });

      const stats = metricsManager.getStats("test.metric", "1h", { env: "test" });
      expect(stats?.count).toBe(1);
    });

    it("should record a metric with unit", async () => {
      await metricsManager.record("test.duration", 150, {
        type: "timer",
        unit: "ms",
      });

      const metrics = metricsManager.query({ name: "test.duration" });
      expect(metrics[0].unit).toBe("ms");
    });
  });

  describe("increment", () => {
    it("should increment counter by 1 by default", async () => {
      await metricsManager.increment("test.counter");

      const stats = metricsManager.getStats("test.counter");
      expect(stats?.sum).toBe(1);
    });

    it("should increment counter by specified value", async () => {
      await metricsManager.increment("test.counter", { value: 5 });

      const stats = metricsManager.getStats("test.counter");
      expect(stats?.sum).toBe(5);
    });

    it("should record counter type", async () => {
      await metricsManager.increment("test.counter");

      const metrics = metricsManager.query({ name: "test.counter" });
      expect(metrics[0].type).toBe("counter");
    });
  });

  describe("timer", () => {
    it("should record timer metric", async () => {
      await metricsManager.timer("test.timer", 250);

      const stats = metricsManager.getStats("test.timer");
      expect(stats?.avg).toBe(250);
    });

    it("should record timer with ms unit", async () => {
      await metricsManager.timer("test.timer", 100);

      const metrics = metricsManager.query({ name: "test.timer" });
      expect(metrics[0].unit).toBe("ms");
      expect(metrics[0].type).toBe("timer");
    });
  });

  describe("time", () => {
    it("should time a function execution", async () => {
      const result = await metricsManager.time("test.timed", async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return "success";
      });

      expect(result).toBe("success");

      const stats = metricsManager.getStats("test.timed");
      expect(stats?.count).toBe(1);
      expect(stats?.avg).toBeGreaterThanOrEqual(45); // Allow some variance
    });

    it("should time a synchronous function", async () => {
      const result = await metricsManager.time("test.sync", () => {
        return 42;
      });

      expect(result).toBe(42);

      const stats = metricsManager.getStats("test.sync");
      expect(stats?.count).toBe(1);
    });

    it("should still record metric when function throws", async () => {
      await expect(
        metricsManager.time("test.error", async () => {
          throw new Error("Test error");
        })
      ).rejects.toThrow("Test error");

      const stats = metricsManager.getStats("test.error");
      expect(stats?.count).toBe(1);
    });
  });

  describe("gauge", () => {
    it("should record gauge metric", async () => {
      await metricsManager.gauge("test.gauge", 75);

      const stats = metricsManager.getStats("test.gauge");
      expect(stats?.avg).toBe(75);
    });
  });

  describe("histogram", () => {
    it("should record histogram metric", async () => {
      await metricsManager.histogram("test.histogram", 200);

      const stats = metricsManager.getStats("test.histogram");
      expect(stats?.count).toBe(1);
    });
  });

  describe("getStats", () => {
    it("should return null when no metrics exist", () => {
      const stats = metricsManager.getStats("nonexistent");
      expect(stats).toBeNull();
    });

    it("should calculate percentiles correctly", async () => {
      // Record values: 10, 20, 30, 40, 50, 60, 70, 80, 90, 100
      for (let i = 1; i <= 10; i++) {
        await metricsManager.record("test.percentiles", i * 10);
      }

      const stats = metricsManager.getStats("test.percentiles");
      expect(stats?.min).toBe(10);
      expect(stats?.max).toBe(100);
      expect(stats?.avg).toBe(55);
      expect(stats?.p50).toBe(50);
      expect(stats?.p95).toBe(95);
      expect(stats?.p99).toBe(100);
    });

    it("should filter by tags", async () => {
      await metricsManager.record("test.tagged", 100, { tags: { env: "prod" } });
      await metricsManager.record("test.tagged", 200, { tags: { env: "dev" } });

      const prodStats = metricsManager.getStats("test.tagged", "1h", { env: "prod" });
      expect(prodStats?.avg).toBe(100);

      const devStats = metricsManager.getStats("test.tagged", "1h", { env: "dev" });
      expect(devStats?.avg).toBe(200);
    });
  });

  describe("query", () => {
    it("should return all matching metrics", async () => {
      await metricsManager.record("test.query", 1);
      await metricsManager.record("test.query", 2);
      await metricsManager.record("test.query", 3);

      const metrics = metricsManager.query({ name: "test.query" });
      expect(metrics).toHaveLength(3);
    });

    it("should filter by time range", async () => {
      const now = Date.now();
      
      // Manually add metrics with specific timestamps
      const store = (metricsManager as unknown as { store: { add: (m: MetricValue) => void } }).store;
      store.add({
        name: "test.time",
        value: 1,
        type: "gauge",
        tags: {},
        timestamp: now - 2 * 60 * 60 * 1000, // 2 hours ago
      });
      store.add({
        name: "test.time",
        value: 2,
        type: "gauge",
        tags: {},
        timestamp: now - 30 * 60 * 1000, // 30 minutes ago
      });

      const recent = metricsManager.query({
        name: "test.time",
        from: now - 60 * 60 * 1000, // 1 hour ago
      });
      expect(recent).toHaveLength(1);
      expect(recent[0].value).toBe(2);
    });
  });

  describe("getBatchStats", () => {
    it("should return stats for multiple metrics", async () => {
      await metricsManager.record("metric.a", 10);
      await metricsManager.record("metric.b", 20);

      const stats = metricsManager.getBatchStats(["metric.a", "metric.b", "metric.c"]);
      
      expect(stats["metric.a"]?.avg).toBe(10);
      expect(stats["metric.b"]?.avg).toBe(20);
      expect(stats["metric.c"]).toBeNull();
    });
  });

  describe("getHealthSummary", () => {
    it("should return summary of all metrics", async () => {
      await metricsManager.record("metric.1", 1);
      await metricsManager.record("metric.2", 2);

      const summary = metricsManager.getHealthSummary();
      
      expect(summary.totalMetrics).toBe(2);
      expect(summary.uniqueNames).toContain("metric.1");
      expect(summary.uniqueNames).toContain("metric.2");
    });
  });
});

describe("Convenience exports", () => {
  beforeEach(() => {
    metricsManager.clear();
  });

  it("recordMetric should work", async () => {
    await recordMetric("convenience.test", 100);
    const stats = getMetricStats("convenience.test");
    expect(stats?.count).toBe(1);
  });

  it("incrementCounter should work", async () => {
    await incrementCounter("convenience.counter");
    const stats = getMetricStats("convenience.counter");
    expect(stats?.sum).toBe(1);
  });

  it("recordTimer should work", async () => {
    await recordTimer("convenience.timer", 150);
    const stats = getMetricStats("convenience.timer");
    expect(stats?.avg).toBe(150);
  });

  it("recordGauge should work", async () => {
    await recordGauge("convenience.gauge", 75);
    const stats = getMetricStats("convenience.gauge");
    expect(stats?.avg).toBe(75);
  });

  it("recordHistogram should work", async () => {
    await recordHistogram("convenience.histogram", 200);
    const stats = getMetricStats("convenience.histogram");
    expect(stats?.count).toBe(1);
  });

  it("timeFunction should work", async () => {
    const result = await timeFunction("convenience.timed", async () => "done");
    expect(result).toBe("done");
    const stats = getMetricStats("convenience.timed");
    expect(stats?.count).toBe(1);
  });
});

describe("Metrics constants", () => {
  it("should have predefined metric names", () => {
    expect(Metrics.API_LATENCY).toBe("api.latency");
    expect(Metrics.WHATSAPP_MESSAGES_SENT).toBe("whatsapp.messages.sent");
    expect(Metrics.AI_TOKENS_USED).toBe("ai.tokens.used");
    expect(Metrics.ORDERS_CREATED).toBe("orders.created");
  });
});

describe("BusinessMetrics", () => {
  beforeEach(() => {
    metricsManager.clear();
  });

  it("orderCreated should record order metrics", async () => {
    await BusinessMetrics.orderCreated(5000, "NGN", "whatsapp");

    const orderStats = getMetricStats(Metrics.ORDERS_CREATED);
    expect(orderStats?.count).toBe(1);

    const valueStats = getMetricStats(Metrics.ORDER_VALUE);
    expect(valueStats?.avg).toBe(5000);
  });

  it("paymentCompleted should record payment metrics", async () => {
    await BusinessMetrics.paymentCompleted(10000, "NGN", "card", true);

    const paymentStats = getMetricStats(Metrics.PAYMENTS_PROCESSED);
    expect(paymentStats?.count).toBe(1);
  });

  it("aiUsage should record AI metrics", async () => {
    await BusinessMetrics.aiUsage(150, "gpt-4", "merchant-123");

    const requestStats = getMetricStats(Metrics.AI_REQUESTS);
    expect(requestStats?.count).toBe(1);

    const tokenStats = getMetricStats(Metrics.AI_TOKENS_USED);
    expect(tokenStats?.avg).toBe(150);
  });

  it("whatsappMessage should record WhatsApp metrics", async () => {
    await BusinessMetrics.whatsappMessage("sent", "text", true);

    const stats = getMetricStats(Metrics.WHATSAPP_MESSAGES_SENT);
    expect(stats?.count).toBe(1);
  });

  it("apiRequest should record API metrics", async () => {
    await BusinessMetrics.apiRequest("/orders", "POST", 200, 150);

    const requestStats = getMetricStats(Metrics.API_REQUESTS);
    expect(requestStats?.count).toBe(1);

    const latencyStats = getMetricStats(Metrics.API_LATENCY);
    expect(latencyStats?.avg).toBe(150);
  });

  it("apiRequest should record error metrics for failed requests", async () => {
    await BusinessMetrics.apiRequest("/orders", "POST", 500, 200);

    const errorStats = getMetricStats(Metrics.API_ERRORS);
    expect(errorStats?.count).toBe(1);
  });
});
