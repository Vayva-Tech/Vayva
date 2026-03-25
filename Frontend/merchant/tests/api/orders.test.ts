import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createMockRequest,
  getResponseJson,
} from "../helpers/api";
import { createMockOrders } from "../factories";

vi.mock("@/lib/api-handler", () => ({
  withVayvaAPI: (permission: any, handler: any) => handler,
  PERMISSIONS: {
    ORDERS_VIEW: "ORDERS_VIEW",
    ORDERS_MANAGE: "ORDERS_MANAGE",
  },
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

import { GET } from "@/app/api/orders/route";

describe("Orders API - /api/orders", () => {
  const mockStoreId = "store_test_123";

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BACKEND_API_URL = "http://localhost:3001";
  });

  describe("GET /api/orders", () => {
    it("should return paginated orders from backend", async () => {
      const mockOrders = createMockOrders(2);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          data: mockOrders,
          meta: { total: 2, limit: 50, offset: 0 },
        }),
      });

      const request = createMockRequest("GET", "/api/orders");
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      expect(data.data).toBeDefined();
      expect(data.meta.total).toBe(2);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/orders"),
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "x-store-id": mockStoreId,
          }),
        })
      );
    });

    it("should forward query params to backend", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: [], meta: { total: 0 } }),
      });

      const request = createMockRequest("GET", "/api/orders", {
        searchParams: { status: "PENDING", limit: "10", offset: "20" },
      });

      await GET(request);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("status=PENDING"),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("limit=10"),
        expect.any(Object)
      );
    });

    it("should handle backend errors gracefully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: "Backend error" }),
      });

      const request = createMockRequest("GET", "/api/orders");
      const response = await GET(request);

      expect(response.status).toBe(500);
    });

    it("should handle network errors gracefully", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const request = createMockRequest("GET", "/api/orders");
      const response = await GET(request);

      expect(response.status).toBe(500);
    });
  });
});
