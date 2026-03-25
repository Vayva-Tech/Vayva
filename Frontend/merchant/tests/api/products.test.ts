import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createMockRequest,
  getResponseJson,
} from "../helpers/api";
import { createMockProducts } from "../factories";

vi.mock("@/lib/api-handler", () => ({
  withVayvaAPI: (permission: any, handler: any) => handler,
  PERMISSIONS: {
    PRODUCTS_VIEW: "PRODUCTS_VIEW",
    PRODUCTS_MANAGE: "PRODUCTS_MANAGE",
  },
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock("@/lib/audit", () => ({
  logAuditEvent: vi.fn(),
  AuditEventType: {
    PRODUCT_CREATED: "PRODUCT_CREATED",
    PRODUCT_UPDATED: "PRODUCT_UPDATED",
    PRODUCT_DELETED: "PRODUCT_DELETED",
  },
}));

vi.mock("@/lib/input-sanitization", () => ({
  sanitizeText: (text: string) => text?.trim() || "",
  sanitizeHtml: (html: string) =>
    html?.replace(/<script[^>]*>.*?<\/script>/gi, "") || "",
  sanitizeNumber: (num: any, options?: any) => {
    const parsed = typeof num === "string" ? parseFloat(num) : num;
    if (isNaN(parsed)) return null;
    if (options?.min !== undefined && parsed < options.min) return null;
    if (options?.max !== undefined && parsed > options.max) return null;
    return parsed;
  },
  sanitizeUrl: (url: string) => {
    if (!url || url.startsWith("javascript:")) return null;
    return url;
  },
}));

import { GET } from "@/app/api/products/route";

const storeHeaders = { "x-store-id": "store_test_123" };

describe("Products API - /api/products", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BACKEND_API_URL = "http://localhost:3001";
  });

  describe("GET /api/products", () => {
    it("should return paginated products from backend", async () => {
      const mockProducts = createMockProducts(2);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          data: mockProducts,
          meta: { total: 2, limit: 50, offset: 0 },
        }),
      });

      const request = createMockRequest("GET", "/api/products", {
        headers: storeHeaders,
      });
      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      expect(data.data).toBeDefined();
      expect(data.meta.total).toBe(2);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/products"),
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "x-store-id": storeHeaders["x-store-id"],
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

      const request = createMockRequest("GET", "/api/products", {
        searchParams: { status: "ACTIVE", limit: "10", offset: "20" },
        headers: storeHeaders,
      });

      await GET(request);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("status=ACTIVE"),
        expect.any(Object)
      );
    });

    it("should handle backend errors gracefully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: "Backend error" }),
      });

      const request = createMockRequest("GET", "/api/products", {
        headers: storeHeaders,
      });
      const response = await GET(request);

      expect(response.status).toBe(500);
    });
  });
});
