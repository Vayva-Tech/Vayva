import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import {
  createMockRequest,
  mockAuthContext,
  getResponseJson,
} from "../helpers/api";
import { createMockOrder, createMockOrders } from "../factories";

// Mock the API handler wrapper
vi.mock("@/lib/api-handler", () => ({
  withVayvaAPI: (permission: any, handler: any) => handler,
  PERMISSIONS: {
    ORDERS_VIEW: "ORDERS_VIEW",
    ORDERS_MANAGE: "ORDERS_MANAGE",
  },
}));

// Mock fetch for backend API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Import after mocks
import { GET, POST } from "@/app/api/orders/route";

describe("Orders API - /api/orders", () => {
  const mockStoreId = "store_test_123";
  const mockUserId = "user_test_123";
  const mockContext = {
    storeId: mockStoreId,
    userId: mockUserId,
    user: { id: mockUserId, email: "test@example.com" },
  };

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
      const response = await GET(request, mockContext);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      expect(data.data).toBeDefined();
      expect(data.meta.total).toBe(2);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/orders"),
        expect.objectContaining({
          headers: { "x-store-id": mockStoreId },
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

      await GET(request, mockContext);

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
      const response = await GET(request, mockContext);

      expect(response.status).toBe(500);
    });

    it("should handle network errors gracefully", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const request = createMockRequest("GET", "/api/orders");
      const response = await GET(request, mockContext);

      expect(response.status).toBe(500);
    });
  });

  describe("POST /api/orders", () => {
    it("should proxy order creation to backend", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { id: "order_new_123", status: "PENDING" },
        }),
      });

      const request = createMockRequest("POST", "/api/orders", {
        body: {
          customerEmail: "customer@example.com",
          items: [],
          total: 1000,
        },
      });

      const response = await POST(request, mockContext);

      expect(response.status).toBe(200);
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/orders",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-store-id": mockStoreId,
          },
          body: expect.any(String),
        })
      );
    });

    it("should handle backend errors during creation", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: "Invalid order data" }),
      });

      const request = createMockRequest("POST", "/api/orders", {
        body: {
          customerEmail: "customer@example.com",
          items: [],
          total: 1000,
        },
      });

      const response = await POST(request, mockContext);

      expect(response.status).toBe(400);
    });
  });
});
