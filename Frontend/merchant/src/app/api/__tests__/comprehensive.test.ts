/**
 * Comprehensive Test Suite for Critical API Routes
 * Tests authentication, payments, orders, and core business logic
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { createMockRequest, createMockResponse } from "@/lib/test-helpers";

// Mock external dependencies
vi.mock("@/lib/redis");
vi.mock("@vayva/db");
vi.mock("@/lib/email/resend");

describe("Authentication API", () => {
  describe("POST /api/auth/merchant/login", () => {
    it("should return 400 if email or password is missing", async () => {
      const { POST } = await import("../app/api/auth/merchant/login/route");
      
      const request = createMockRequest("POST", "/auth/merchant/login", {
        email: "test@example.com",
        // Missing password
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("required");
    });

    it("should return 401 for invalid credentials", async () => {
      const { POST } = await import("../app/api/auth/merchant/login/route");
      
      const request = createMockRequest("POST", "/auth/merchant/login", {
        email: "invalid@example.com",
        password: "wrongpassword",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });

    it("should return success with valid credentials", async () => {
      const { POST } = await import("../app/api/auth/merchant/login/route");
      
      const request = createMockRequest("POST", "/auth/merchant/login", {
        email: "valid@example.com",
        password: "correctpassword123",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user).toHaveProperty("id");
      expect(data.user).toHaveProperty("email");
    });

    it("should enforce rate limiting after 10 failed attempts", async () => {
      const { POST } = await import("../app/api/auth/merchant/login/route");
      
      // Make 10 failed login attempts
      for (let i = 0; i < 10; i++) {
        const request = createMockRequest("POST", "/auth/merchant/login", {
          email: "test@example.com",
          password: "wrongpassword",
        });
        await POST(request);
      }

      // 11th attempt should be rate limited
      const request = createMockRequest("POST", "/auth/merchant/login", {
        email: "test@example.com",
        password: "wrongpassword",
      });
      
      const response = await POST(request);
      
      expect(response.status).toBe(429);
      expect((await response.json()).error).toContain("Too many requests");
    });
  });

  describe("POST /api/auth/merchant/register", () => {
    it("should validate required fields", async () => {
      const { POST } = await import("../app/api/auth/merchant/register/route");
      
      const request = createMockRequest("POST", "/auth/merchant/register", {
        email: "incomplete",
        // Missing other required fields
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Validation");
    });

    it("should reject weak passwords", async () => {
      const { POST } = await import("../app/api/auth/merchant/register/route");
      
      const request = createMockRequest("POST", "/auth/merchant/register", {
        email: "new@example.com",
        password: "weak", // Too short, no uppercase, no number
        firstName: "John",
        lastName: "Doe",
        businessName: "Test Business",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("password");
    });

    it("should create account with valid data", async () => {
      const { POST } = await import("../app/api/auth/merchant/register/route");
      
      const request = createMockRequest("POST", "/auth/merchant/register", {
        email: "newuser@example.com",
        password: "StrongP@ssw0rd",
        firstName: "John",
        lastName: "Doe",
        businessName: "Test Business",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.email).toBe("newuser@example.com");
    });
  });
});

describe("Product API", () => {
  describe("POST /api/products/create", () => {
    it("should validate product data", async () => {
      const { POST } = await import("../app/api/products/create/route");
      
      const request = createMockRequest("POST", "/products/create", {
        name: "", // Invalid - empty name
        price: -10, // Invalid - negative price
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Invalid");
    });

    it("should create product with valid data", async () => {
      const { POST } = await import("../app/api/products/create/route");
      
      const request = createMockRequest("POST", "/products/create", {
        name: "Test Product",
        description: "A great product",
        price: 29.99,
        inventory: 100,
        sku: "TEST-001",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.product.name).toBe("Test Product");
    });
  });

  describe("PATCH /api/products/[id]", () => {
    it("should update product successfully", async () => {
      const { PATCH } = await import("../app/api/products/[id]/route");
      
      const request = createMockRequest("PATCH", "/products/123", {
        name: "Updated Name",
        price: 39.99,
      }, { id: "123" });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it("should return 404 for non-existent product", async () => {
      const { PATCH } = await import("../app/api/products/[id]/route");
      
      const request = createMockRequest("PATCH", "/products/nonexistent", {
        name: "Updated",
      }, { id: "nonexistent" });

      const response = await PATCH(request);
      
      expect(response.status).toBe(404);
    });
  });
});

describe("Order API", () => {
  describe("POST /api/orders", () => {
    it("should validate order items", async () => {
      const { POST } = await import("../app/api/orders/route");
      
      const request = createMockRequest("POST", "/orders", {
        items: [], // Invalid - empty items
        customer: {
          email: "customer@example.com",
          firstName: "Jane",
          lastName: "Doe",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("items");
    });

    it("should create order successfully", async () => {
      const { POST } = await import("../app/api/orders/route");
      
      const request = createMockRequest("POST", "/orders", {
        items: [
          {
            productId: "prod_123",
            quantity: 2,
            price: 29.99,
          },
        ],
        customer: {
          email: "customer@example.com",
          firstName: "Jane",
          lastName: "Doe",
          phone: "+1234567890",
        },
        shippingAddress: {
          street: "123 Main St",
          city: "Lagos",
          state: "LA",
          postalCode: "100001",
          country: "NG",
        },
        paymentMethod: "CARD",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.order).toHaveProperty("id");
    });
  });
});

describe("Payment API", () => {
  describe("POST /api/payments/initialize", () => {
    it("should validate payment amount", async () => {
      const { POST } = await import("../app/api/payments/initialize/route");
      
      const request = createMockRequest("POST", "/payments/initialize", {
        amount: -100, // Invalid - negative
        currency: "NGN",
        orderId: "order_123",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("amount");
    });

    it("should initialize payment successfully", async () => {
      const { POST } = await import("../app/api/payments/initialize/route");
      
      const request = createMockRequest("POST", "/payments/initialize", {
        amount: 10000,
        currency: "NGN",
        orderId: "order_123",
        paymentMethod: "CARD",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.payment).toHaveProperty("authorizationUrl");
    });
  });
});

describe("Customer API", () => {
  describe("GET /api/customers", () => {
    it("should return list of customers", async () => {
      const { GET } = await import("../app/api/customers/route");
      
      const request = createMockRequest("GET", "/customers");

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.customers).toBeInstanceOf(Array);
    });

    it("should support pagination", async () => {
      const { GET } = await import("../app/api/customers/route");
      
      const request = createMockRequest("GET", "/customers?page=1&limit=10");

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("total");
      expect(data).toHaveProperty("page");
      expect(data).toHaveProperty("limit");
    });
  });
});

describe("Email Service", () => {
  describe("sendTransactionalEmail", () => {
    it("should send email successfully", async () => {
      const { ResendEmailService } = await import("../lib/email/resend");

      const result = await ResendEmailService.sendTransactionalEmail({
        to: "recipient@example.com",
        subject: "Test Subject",
        html: "<p>Test Content</p>",
      });

      expect(result.success).toBe(true);
      expect(result).toHaveProperty("messageId");
    });

    it("should handle invalid email addresses", async () => {
      const { ResendEmailService } = await import("../lib/email/resend");

      await expect(
        ResendEmailService.sendTransactionalEmail({
          to: "invalid-email",
          subject: "Test",
          html: "<p>Test</p>",
        })
      ).rejects.toThrow();
    });
  });
});

describe("Rate Limiting", () => {
  describe("withRateLimit helper", () => {
    it("should allow requests under limit", async () => {
      const { withRateLimit } = await import("../lib/rate-limit-helper");
      
      const request = createMockRequest("POST", "/test");
      const handler = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );

      const response = await withRateLimit(request, "api", handler);
      
      expect(response.status).toBe(200);
      expect(handler).toHaveBeenCalled();
    });

    it("should block requests over limit", async () => {
      const { withRateLimit } = await import("../lib/rate-limit-helper");
      
      const request = createMockRequest("POST", "/test");
      const handler = vi.fn();

      // Simulate exceeding rate limit
      for (let i = 0; i < 35; i++) {
        await withRateLimit(request, "strict", handler);
      }

      expect(handler).not.toHaveBeenCalledTimes(35);
    });
  });
});

describe("Health Check", () => {
  describe("GET /api/health/comprehensive", () => {
    it("should return health status", async () => {
      const { GET } = await import("../app/api/health/comprehensive/route");

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("status");
      expect(data).toHaveProperty("services");
      expect(data).toHaveProperty("timestamp");
    });

    it("should include all monitored services", async () => {
      const { GET } = await import("../app/api/health/comprehensive/route");

      const response = await GET();
      const data = await response.json();

      expect(data.services).toHaveProperty("database");
      expect(data.services).toHaveProperty("redis");
      expect(data.services).toHaveProperty("backendAPI");
      expect(data.integrations).toHaveProperty("resend");
      expect(data.integrations).toHaveProperty("paystack");
    });
  });
});
