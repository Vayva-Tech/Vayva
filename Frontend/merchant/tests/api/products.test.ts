import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createMockRequest,
  getResponseJson,
} from "../helpers/api";
import { createMockProduct, createMockProducts } from "../factories";

// Mock the API handler wrapper
vi.mock("@/lib/api-handler", () => ({
  withVayvaAPI: (permission: any, handler: any) => handler,
  PERMISSIONS: {
    PRODUCTS_VIEW: "PRODUCTS_VIEW",
    PRODUCTS_MANAGE: "PRODUCTS_MANAGE",
  },
}));

// Mock fetch for backend API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock audit logging
vi.mock("@/lib/audit", () => ({
  logAuditEvent: vi.fn(),
  AuditEventType: {
    PRODUCT_CREATED: "PRODUCT_CREATED",
    PRODUCT_UPDATED: "PRODUCT_UPDATED",
    PRODUCT_DELETED: "PRODUCT_DELETED",
  },
}));

// Mock input sanitization
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

// Import after mocks
import { GET, POST } from "@/app/api/products/route";

describe("Products API - /api/products", () => {
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

      const request = createMockRequest("GET", "/api/products");
      const response = await GET(request, mockContext);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      expect(data.data).toBeDefined();
      expect(data.meta.total).toBe(2);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/products"),
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

      const request = createMockRequest("GET", "/api/products", {
        searchParams: { status: "ACTIVE", limit: "10", offset: "20" },
      });

      await GET(request, mockContext);

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

      const request = createMockRequest("GET", "/api/products");
      const response = await GET(request, mockContext);

      expect(response.status).toBe(500);
    });
  });

  describe("POST /api/products", () => {
    it("should create product via backend API", async () => {
      const newProduct = createMockProduct({
        title: "New Test Product",
        price: 2500,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: newProduct,
        }),
      });

      const request = createMockRequest("POST", "/api/products", {
        body: {
          title: "New Test Product",
          description: "A new product description",
          price: 2500,
          status: "DRAFT",
        },
      });

      const response = await POST(request, mockContext);

      expect(response.status).toBe(200);
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/products",
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

    it("should handle backend validation errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: "Title is required" }),
      });

      const request = createMockRequest("POST", "/api/products", {
        body: {
          price: 1000,
        },
      });

      const response = await POST(request, mockContext);

      expect(response.status).toBe(400);
    });

    it("should handle backend errors during creation", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: "Database error" }),
      });

      const request = createMockRequest("POST", "/api/products", {
        body: {
          title: "Test Product",
          price: 1000,
        },
      });

      const response = await POST(request, mockContext);

      expect(response.status).toBe(500);
    });
  });
});
