import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockRequest, getResponseJson } from "../helpers/api";

// Mock dependencies
vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
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

vi.mock("@/lib/env-validation", () => ({
  FEATURES: { EMAIL_ENABLED: false, INSTAGRAM_ENABLED: false },
}));

// Mock bcryptjs
vi.mock("bcryptjs", () => ({
  compare: vi.fn(),
}));

// Mock fetch for backend API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

import { POST } from "@/app/api/auth/merchant/login/route";
import { compare } from "bcryptjs";

describe("Auth Login - POST /api/auth/merchant/login", () => {
  const mockBackendUser = {
    id: "user_123",
    email: "test@example.com",
    firstName: "Test",
    requiresOtp: true,
    otp: "123456",
    token: "mock-jwt-token",
    user: {
      id: "user_123",
      email: "test@example.com",
      firstName: "Test",
      memberships: [
        {
          status: "active",
          store: { id: "store_123", name: "Test Store" },
          role: { name: "OWNER" },
        },
      ],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BACKEND_API_URL = "http://localhost:3001";
  });

  it("should return OTP_REQUIRED on valid credentials", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ requiresOtp: true, email: "test@example.com" }),
    });

    const request = createMockRequest("POST", "/api/auth/merchant/login", {
      body: { email: "test@example.com", password: "validpass123" },
    });
    const response = await POST(request);
    const data = await getResponseJson(response);

    // Login returns response from backend (OTP_REQUIRED flow)
    expect(response.status).toBe(200);
    expect(data.requiresOtp).toBe(true);
    expect(data.email).toBe("test@example.com");
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/auth/login",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "validpass123",
        }),
      })
    );
  });

  it("should expose OTP in dev mode when email is not enabled", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ requiresOtp: true, email: "test@example.com", otp: "654321" }),
    });

    const request = createMockRequest("POST", "/api/auth/merchant/login", {
      body: { email: "test@example.com", password: "validpass123" },
    });
    const response = await POST(request);
    const data = await getResponseJson(response);

    // In dev/test mode with EMAIL_ENABLED=false, OTP may be exposed in response from backend
    expect(response.status).toBe(200);
    expect(data.otp).toBeDefined();
    expect(typeof data.otp).toBe("string");
    expect(data.otp.length).toBe(6);
  });

  it("should reject missing email or password", async () => {
    const request = createMockRequest("POST", "/api/auth/merchant/login", {
      body: { email: "test@example.com" },
    });
    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it("should reject non-existent user", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: { code: "INVALID_CREDENTIALS", message: "Invalid credentials" } }),
    });

    const request = createMockRequest("POST", "/api/auth/merchant/login", {
      body: { email: "nobody@example.com", password: "somepass123" },
    });
    const response = await POST(request);

    expect(response.status).toBe(401);
  });

  it("should reject invalid password", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: { code: "INVALID_CREDENTIALS", message: "Invalid credentials" } }),
    });

    const request = createMockRequest("POST", "/api/auth/merchant/login", {
      body: { email: "test@example.com", password: "wrongpass" },
    });
    const response = await POST(request);

    expect(response.status).toBe(401);
  });

  it("should handle backend errors gracefully", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Backend unavailable"));

    const request = createMockRequest("POST", "/api/auth/merchant/login", {
      body: { email: "test@example.com", password: "validpass123" },
    });
    const response = await POST(request);

    expect(response.status).toBeGreaterThanOrEqual(500);
  });

  it("should return 503 when BACKEND_API_URL is not configured", async () => {
    delete process.env.BACKEND_API_URL;

    const request = createMockRequest("POST", "/api/auth/merchant/login", {
      body: { email: "test@example.com", password: "validpass123" },
    });
    const response = await POST(request);

    expect(response.status).toBe(503);
  });
});
