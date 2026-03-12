import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockRequest, getResponseJson } from "../helpers/api";

// Mock dependencies
vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

vi.mock("@/lib/flags/flagService", () => ({
  FlagService: { isEnabled: vi.fn().mockResolvedValue(true) },
}));

vi.mock("@/lib/ai/revenue.service", () => ({
  RevenueService: {
    checkTrialEligibility: vi.fn().mockResolvedValue({ allowed: true }),
  },
}));

vi.mock("@/lib/ratelimit", () => ({
  checkRateLimit: vi
    .fn()
    .mockResolvedValue({ success: true, limit: 60, remaining: 59, reset: 0 }),
  checkRateLimitCustom: vi.fn().mockResolvedValue(undefined),
  RateLimitError: class RateLimitError extends Error {
    constructor(m: string) {
      super(m);
      this.name = "RateLimitError";
    }
  },
}));

vi.mock("bcryptjs", () => ({
  hash: vi.fn().mockResolvedValue("$2a$10$hashed"),
}));

// Mock fetch for backend API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

import { POST } from "@/app/api/auth/merchant/register/route";

describe("Auth Register - POST /api/auth/merchant/register", () => {
  const validBody = {
    email: "new@example.com",
    password: "securepass123",
    firstName: "John",
    lastName: "Doe",
    businessName: "Test Business",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BACKEND_API_URL = "http://localhost:3001";
  });

  it("should register a new user successfully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          user: {
            id: "user_new_123",
            email: "new@example.com",
            firstName: "John",
            lastName: "Doe",
            emailVerified: false,
          },
        },
      }),
    });

    const request = createMockRequest("POST", "/api/auth/merchant/register", {
      body: validBody,
    });
    const response = await POST(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.user.email).toBe("new@example.com");
    expect(data.data.user.emailVerified).toBe(false);
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/auth/register",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "new@example.com",
          password: "securepass123",
          firstName: "John",
          lastName: "Doe",
          businessName: "Test Business",
        }),
      })
    );
  });

  it("should reject missing required fields", async () => {
    const request = createMockRequest("POST", "/api/auth/merchant/register", {
      body: { email: "test@example.com" },
    });
    const response = await POST(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it("should reject invalid email format", async () => {
    const request = createMockRequest("POST", "/api/auth/merchant/register", {
      body: { ...validBody, email: "not-an-email" },
    });
    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it("should reject short passwords", async () => {
    const request = createMockRequest("POST", "/api/auth/merchant/register", {
      body: { ...validBody, password: "short" },
    });
    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it("should reject duplicate email", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ error: { code: "EMAIL_EXISTS", message: "Email already registered" } }),
    });

    const request = createMockRequest("POST", "/api/auth/merchant/register", {
      body: validBody,
    });
    const response = await POST(request);

    expect(response.status).toBe(409);
  });

  it("should return 429 when rate limited", async () => {
    const { checkRateLimitCustom } = await import("@/lib/ratelimit");
    const { RateLimitError } = await import("@/lib/ratelimit");
    (checkRateLimitCustom as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new (RateLimitError as any)("Rate limit exceeded"),
    );

    const request = createMockRequest("POST", "/api/auth/merchant/register", {
      body: validBody,
    });
    const response = await POST(request);

    expect(response.status).toBe(429);
  });

  it("should handle backend errors gracefully", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Backend connection failed"));

    const request = createMockRequest("POST", "/api/auth/merchant/register", {
      body: validBody,
    });
    const response = await POST(request);

    expect(response.status).toBe(500);
  });
});
