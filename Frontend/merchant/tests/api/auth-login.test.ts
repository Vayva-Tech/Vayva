import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockRequest, getResponseJson } from "../helpers/api";

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

vi.mock("bcryptjs", () => ({
  compare: vi.fn(),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

import { POST } from "@/app/api/auth/merchant/login/route";

describe("Auth Login - POST /api/auth/merchant/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BACKEND_API_URL = "http://localhost:3001";
    process.env.NODE_ENV = "development";
  });

  it("should return OTP_REQUIRED on valid credentials", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({
        error: { code: "OTP_REQUIRED", message: "OTP_REQUIRED" },
        email: "test@example.com",
      }),
    });

    const request = createMockRequest("POST", "/api/auth/merchant/login", {
      body: { email: "test@example.com", password: "validpass123" },
    });
    const response = await POST(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(403);
    expect(data.error?.message || data.message).toBeDefined();
    expect(data.email).toBe("test@example.com");
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/auth/merchant/login",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "validpass123",
          otpMethod: "EMAIL",
        }),
      }),
    );
  });

  it("should expose OTP in dev mode when email is not enabled", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({
        error: { code: "OTP_REQUIRED", message: "OTP_REQUIRED" },
        email: "test@example.com",
        otp: "654321",
      }),
    });

    const request = createMockRequest("POST", "/api/auth/merchant/login", {
      body: { email: "test@example.com", password: "validpass123" },
    });
    const response = await POST(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(403);
    expect(data.otp).toBe("654321");
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
      json: async () => ({
        error: { code: "INVALID_CREDENTIALS", message: "Invalid credentials" },
      }),
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
      json: async () => ({
        error: { code: "INVALID_CREDENTIALS", message: "Invalid credentials" },
      }),
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
