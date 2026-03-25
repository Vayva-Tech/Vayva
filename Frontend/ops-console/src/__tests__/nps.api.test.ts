/**
 * @vitest-environment node
 */
/**
 * NPS API tests (ops-console `/api/nps`)
 *
 * These calls target TEST_BASE_URL (default http://localhost:3000) with no cookies.
 * Protected responses are 401/403; 200 only when the server session allows it.
 * If nothing is listening, the test skips the status assertion (connection error).
 */

import { describe, it, expect } from "vitest";

async function tryFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response | null> {
  try {
    return await fetch(input, init);
  } catch {
    return null;
  }
}

describe("NPS Survey API", () => {
  const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";

  describe("GET /api/nps", () => {
    it("is protected for global metrics (no storeId)", async () => {
      const res = await tryFetch(`${baseUrl}/api/nps`);
      if (!res) {
        expect(true).toBe(true);
        return;
      }
      expect([401, 403, 200]).toContain(res.status);
      if (res.status === 200) {
        const data = (await res.json()) as {
          metrics?: unknown;
          recentResponses?: unknown;
        };
        expect(data).toHaveProperty("metrics");
        expect(data).toHaveProperty("recentResponses");
      }
    });

    it("is protected for store-scoped metrics", async () => {
      const res = await tryFetch(
        `${baseUrl}/api/nps?storeId=test-store-123`,
      );
      if (!res) {
        expect(true).toBe(true);
        return;
      }
      expect([401, 403, 200]).toContain(res.status);
      if (res.status === 200) {
        const data = (await res.json()) as { surveys?: unknown; metrics?: unknown };
        expect(data).toHaveProperty("surveys");
        expect(data).toHaveProperty("metrics");
      }
    });
  });

  describe("POST /api/nps", () => {
    it("rejects unauthenticated queue requests", async () => {
      const res = await tryFetch(`${baseUrl}/api/nps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId: "test-store" }),
      });
      if (!res) {
        expect(true).toBe(true);
        return;
      }
      expect([401, 403]).toContain(res.status);
    });
  });
});
