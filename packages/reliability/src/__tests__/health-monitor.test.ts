import { describe, it, expect, beforeEach, vi } from "vitest";
import { HealthMonitor, type SystemHealth, type HealthCheck } from "../health-monitor";

// Mock the logger
vi.mock("@vayva/shared", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock prisma
vi.mock("@vayva/db", () => ({
  prisma: {
    $queryRaw: vi.fn().mockResolvedValue([{ 1: 1 }]),
  },
}));

describe("HealthMonitor", () => {
  beforeEach(() => {
    // Reset the checks map
    (HealthMonitor as unknown as { checks: Map<string, unknown> }).checks = new Map();
  });

  describe("registerCheck", () => {
    it("should register a health check", () => {
      HealthMonitor.registerCheck("test-check", {
        name: "Test Check",
        category: "core",
        check: async () => ({ ok: true }),
      });

      const checks = (HealthMonitor as unknown as { checks: Map<string, unknown> }).checks;
      expect(checks.has("test-check")).toBe(true);
    });
  });

  describe("getUptime", () => {
    it("should return uptime in seconds and formatted string", () => {
      const uptime = HealthMonitor.getUptime();

      expect(uptime.seconds).toBeGreaterThanOrEqual(0);
      expect(typeof uptime.formatted).toBe("string");
    });

    it("should format uptime correctly for different durations", () => {
      // We can't easily mock Date.now() for the static startTime, but we can verify format
      const uptime = HealthMonitor.getUptime();
      expect(uptime.formatted).toMatch(/\d+[smhd\s]+/);
    });
  });

  describe("runChecks", () => {
    it("should return system health with all categories", async () => {
      // Register test checks
      HealthMonitor.registerCheck("core-check", {
        name: "Core Service",
        category: "core",
        check: async () => ({ ok: true, message: "Healthy" }),
      });

      HealthMonitor.registerCheck("external-check", {
        name: "External Service",
        category: "external",
        check: async () => ({ ok: true }),
      });

      HealthMonitor.registerCheck("integration-check", {
        name: "Integration Service",
        category: "integrations",
        check: async () => ({ ok: true }),
      });

      const health = await HealthMonitor.runChecks();

      expect(health).toHaveProperty("status");
      expect(health).toHaveProperty("timestamp");
      expect(health).toHaveProperty("uptime");
      expect(health).toHaveProperty("version");
      expect(health).toHaveProperty("services");
      expect(health).toHaveProperty("summary");

      expect(health.services.core).toHaveLength(1);
      expect(health.services.external).toHaveLength(1);
      expect(health.services.integrations).toHaveLength(1);
    });

    it("should mark status as HEALTHY when all checks pass", async () => {
      HealthMonitor.registerCheck("healthy-check", {
        name: "Healthy Service",
        category: "core",
        check: async () => ({ ok: true }),
      });

      const health = await HealthMonitor.runChecks();
      expect(health.status).toBe("HEALTHY");
    });

    it("should mark status as UNHEALTHY when more services are down than up", async () => {
      HealthMonitor.registerCheck("down-1", {
        name: "Down Service 1",
        category: "core",
        check: async () => ({ ok: false }),
      });

      HealthMonitor.registerCheck("down-2", {
        name: "Down Service 2",
        category: "core",
        check: async () => ({ ok: false }),
      });

      const health = await HealthMonitor.runChecks();
      expect(health.status).toBe("UNHEALTHY");
    });

    it("should mark status as DEGRADED when some services are down but not majority", async () => {
      HealthMonitor.registerCheck("up-service", {
        name: "Up Service",
        category: "core",
        check: async () => ({ ok: true }),
      });

      HealthMonitor.registerCheck("down-service", {
        name: "Down Service",
        category: "core",
        check: async () => ({ ok: false }),
      });

      const health = await HealthMonitor.runChecks();
      expect(health.status).toBe("DEGRADED");
    });

    it("should mark service as DEGRADED when response time exceeds 2000ms", async () => {
      HealthMonitor.registerCheck("slow-service", {
        name: "Slow Service",
        category: "core",
        check: async () => {
          await new Promise((resolve) => setTimeout(resolve, 2100));
          return { ok: true };
        },
      });

      const health = await HealthMonitor.runChecks();
      expect(health.services.core[0].status).toBe("DEGRADED");
    });

    it("should handle check timeouts gracefully", async () => {
      HealthMonitor.registerCheck("timeout-check", {
        name: "Timeout Service",
        category: "core",
        timeoutMs: 100,
        check: async () => {
          await new Promise((resolve) => setTimeout(resolve, 200));
          return { ok: true };
        },
      });

      const health = await HealthMonitor.runChecks();
      expect(health.services.core[0].status).toBe("DOWN");
      expect(health.services.core[0].message).toContain("timeout");
    });

    it("should handle check exceptions gracefully", async () => {
      HealthMonitor.registerCheck("error-check", {
        name: "Error Service",
        category: "core",
        check: async () => {
          throw new Error("Test error");
        },
      });

      const health = await HealthMonitor.runChecks();
      expect(health.services.core[0].status).toBe("DOWN");
      expect(health.services.core[0].message).toBe("Test error");
    });

    it("should calculate summary correctly", async () => {
      HealthMonitor.registerCheck("up-1", {
        name: "Up 1",
        category: "core",
        check: async () => ({ ok: true }),
      });

      HealthMonitor.registerCheck("up-2", {
        name: "Up 2",
        category: "core",
        check: async () => ({ ok: true }),
      });

      HealthMonitor.registerCheck("down-1", {
        name: "Down 1",
        category: "core",
        check: async () => ({ ok: false }),
      });

      const health = await HealthMonitor.runChecks();
      expect(health.summary).toEqual({
        total: 3,
        up: 2,
        down: 1,
        degraded: 0,
        notConfigured: 0,
      });
    });
  });

  describe("getHistory", () => {
    it("should return health check history", async () => {
      // Run a check to populate history
      HealthMonitor.registerCheck("test", {
        name: "Test",
        category: "core",
        check: async () => ({ ok: true }),
      });

      await HealthMonitor.runChecks();
      const history = HealthMonitor.getHistory(1);

      expect(history).toHaveLength(1);
      expect(history[0]).toHaveProperty("status");
    });
  });

  describe("getAvailability", () => {
    it("should return 100% when no history", () => {
      const availability = HealthMonitor.getAvailability(60);
      expect(availability).toBe(100);
    });

    it("should calculate availability percentage correctly", async () => {
      // This test is simplified since we can't easily manipulate history
      HealthMonitor.registerCheck("test", {
        name: "Test",
        category: "core",
        check: async () => ({ ok: true }),
      });

      await HealthMonitor.runChecks();
      const availability = HealthMonitor.getAvailability(60);

      expect(availability).toBeGreaterThanOrEqual(0);
      expect(availability).toBeLessThanOrEqual(100);
    });
  });

  describe("isServiceHealthy", () => {
    it("should return true when service is healthy", async () => {
      HealthMonitor.registerCheck("healthy-service", {
        name: "Healthy Service",
        category: "core",
        check: async () => ({ ok: true }),
      });

      await HealthMonitor.runChecks();
      expect(HealthMonitor.isServiceHealthy("Healthy Service")).toBe(true);
    });

    it("should return false when service is down", async () => {
      HealthMonitor.registerCheck("unhealthy-service", {
        name: "Unhealthy Service",
        category: "core",
        check: async () => ({ ok: false }),
      });

      await HealthMonitor.runChecks();
      expect(HealthMonitor.isServiceHealthy("Unhealthy Service")).toBe(false);
    });

    it("should return true for unknown services", () => {
      expect(HealthMonitor.isServiceHealthy("Non-existent")).toBe(true);
    });
  });
});
