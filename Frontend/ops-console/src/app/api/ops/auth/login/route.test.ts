import { NextRequest } from "next/server";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

// Mock dependencies
vi.mock("../../../../../lib/ops-auth", () => ({
  OpsAuthService: {
    bootstrapOwner: vi.fn(),
    logEvent: vi.fn(),
    login: vi.fn(),
  },
}));

vi.mock("../../../../../lib/api/rate-limit", () => ({
  checkRateLimit: vi.fn(),
  RateLimits: {},
}));

vi.mock("../../../../../lib/api/errors", () => ({
  createErrorResponse: vi.fn((code, message, status) => ({
    json: async () => ({ error: { code, message }, meta: {} }),
    status,
  })),
  handleAuthError: vi.fn((error) => ({
    json: async () => ({ error: error.message }),
    status: 401,
  })),
  handleInternalError: vi.fn(() => ({
    json: async () => ({ error: "Internal Server Error" }),
    status: 500,
  })),
  ErrorCodes: {
    VALIDATION_MISSING_FIELD: "VAL_001",
    RATE_LIMIT_EXCEEDED: "RATE_001",
    AUTH_INVALID_CREDENTIALS: "AUTH_002",
  },
}));

vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn((body, init) => ({
      json: async () => body,
      status: init?.status || 200,
    })),
  },
}));

// @ts-expect-error - Module resolution pending
import { OpsAuthService } from "@/lib/ops-auth";
// @ts-expect-error - Module resolution pending
import { checkRateLimit } from "@/lib/api/rate-limit";

// Helper to create a mock NextRequest
function createMockNextRequest(body: Record<string, unknown>, ip = "192.168.1.1") {
  return {
    json: vi.fn().mockResolvedValue(body),
    headers: new Headers({ "x-forwarded-for": ip }),
  };
}

describe("POST /api/ops/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 429 when rate limited", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ allowed: false, retryAfter: 60 });
    vi.mocked(OpsAuthService.logEvent).mockResolvedValue(undefined);

    const request = createMockNextRequest({ email: "test@vayva.co", password: "password123" });
    
    const response = await POST(request as unknown as import("next/server").NextRequest);
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(body.error.message).toBe("Too many attempts. Try again later.");
    expect(OpsAuthService.logEvent).toHaveBeenCalledWith(
      null,
      "OPS_LOGIN_BLOCKED_RATE_LIMIT",
      expect.objectContaining({ ip: "192.168.1.1", email: "test@vayva.co" })
    );
  });

  it("should return 401 for invalid credentials", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ allowed: true });
    vi.mocked(OpsAuthService.login).mockResolvedValue(null);
    vi.mocked(OpsAuthService.logEvent).mockResolvedValue(undefined);

    const request = createMockNextRequest({ email: "test@vayva.co", password: "wrongpassword" });
    
    const response = await POST(request as unknown as import("next/server").NextRequest);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error.message).toBe("Invalid credentials");
  });

  it("should return 202 when MFA is required", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ allowed: true });
    vi.mocked(OpsAuthService.login).mockResolvedValue({
      email: "test@vayva.co",
      name: "Test User",
      role: "OPS_ADMIN",
      requiresMfa: true,
      tempToken: "temp-token-123",
    } as { 
      email: string; 
      name: string; 
      role: string; 
      requiresMfa: boolean; 
      tempToken: string 
    });

    const request = createMockNextRequest({ email: "test@vayva.co", password: "password123" });
    
    const response = await POST(request as unknown as import("next/server").NextRequest);
    const body = await response.json();

    expect(response.status).toBe(202);
    expect(body.data.requiresMfa).toBe(true);
    expect(body.data.tempToken).toBe("temp-token-123");
    expect(body.data.message).toBe("MFA code required");
  });

  it("should return 200 with user data on successful login", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ allowed: true });
    vi.mocked(OpsAuthService.login).mockResolvedValue({
      email: "test@vayva.co",
      name: "Test User",
      role: "OPS_ADMIN",
    });

    const request = createMockNextRequest({ email: "test@vayva.co", password: "password123" });
    
    const response = await POST(request as unknown as import("next/server").NextRequest);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.user).toEqual({
      email: "test@vayva.co",
      name: "Test User",
      role: "OPS_ADMIN",
    });
  });

  it("should include MFA code when provided", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ allowed: true });
    vi.mocked(OpsAuthService.login).mockResolvedValue({
      email: "test@vayva.co",
      name: "Test User",
      role: "OPS_ADMIN",
    });

    const request = createMockNextRequest({
      email: "test@vayva.co",
      password: "password123",
      mfaCode: "123456",
    });

    await POST(request as unknown as import("next/server").NextRequest);

    expect(OpsAuthService.login).toHaveBeenCalledWith(
      "test@vayva.co",
      "password123",
      "123456"
    );
  });

  it("should return 500 on unexpected error", async () => {
    vi.mocked(checkRateLimit).mockRejectedValue(new Error("Database error"));

    const request = createMockNextRequest({ email: "test@vayva.co", password: "password123" });
    
    const response = await POST(request as unknown as import("next/server").NextRequest);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Internal Server Error");
  });
});
