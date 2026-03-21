import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockRequest, getResponseJson } from "../helpers/api";

vi.mock("@/lib/api-handler", () => ({
  withVayvaAPI: (_permission: unknown, handler: (...args: any[]) => any) =>
    handler,
}));

vi.mock("@/lib/team/permissions", () => ({
  PERMISSIONS: { BILLING_MANAGE: "BILLING_MANAGE" },
}));

vi.mock("@/lib/payment/paystack", () => ({
  PaystackService: {
    verifyPlanChangePayment: vi.fn(),
  },
}));

vi.mock("@vayva/db", () => ({
  prisma: {
    paymentTransaction: { findUnique: vi.fn(), upsert: vi.fn() },
    store: { findUnique: vi.fn(), update: vi.fn() },
    $transaction: vi.fn(),
  },
  SubscriptionPlan: { FREE: "FREE", STARTER: "STARTER", PRO: "PRO" },
}));

vi.mock("@/lib/audit", () => ({
  logAuditEvent: vi.fn(),
  AuditEventType: { SETTINGS_CHANGED: "SETTINGS_CHANGED" },
}));

vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

// Mock fetch for backend API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

import { POST } from "@/app/api/billing/verify-payment/route";
import { PaystackService } from "@/lib/payment/paystack";
import { prisma } from "@vayva/db";

describe("Billing Verify Payment - POST /api/billing/verify-payment", () => {
  const mockContext = {
    storeId: "store_test_123",
    userId: "user_test_123",
    user: {
      id: "user_test_123",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
    },
    correlationId: "corr_123",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BACKEND_API_URL = "http://localhost:3001";
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: {} }),
    });
  });

  it("returns 400 if reference is missing", async () => {
    const req = createMockRequest("POST", "/api/billing/verify-payment", {
      body: {},
    });
    const res = await (POST as (...args: any[]) => any)(req, mockContext);
    const json = await getResponseJson(res);
    expect(res.status).toBe(400);
    expect(json.error).toContain("reference");
  });

  it("returns 403 if payment storeId does not match context storeId", async () => {
    vi.mocked(PaystackService.verifyPlanChangePayment).mockResolvedValue({
      success: true,
      storeId: "store_OTHER",
      newPlan: "STARTER",
      amountKobo: 2150000,
      currency: "NGN",
    });

    const req = createMockRequest("POST", "/api/billing/verify-payment", {
      body: { reference: "sub_test_123" },
    });
    const res = await (POST as (...args: any[]) => any)(req, mockContext);
    expect(res.status).toBe(403);
  });

  it("returns success for idempotent re-verification of completed payment", async () => {
    vi.mocked(PaystackService.verifyPlanChangePayment).mockResolvedValue({
      success: true,
      storeId: "store_test_123",
      newPlan: "STARTER",
      amountKobo: 2150000,
      currency: "NGN",
    });

    vi.mocked(prisma.paymentTransaction.findUnique).mockResolvedValue({
      storeId: "store_test_123",
      status: "SUCCESS",
    } as any);

    const req = createMockRequest("POST", "/api/billing/verify-payment", {
      body: { reference: "sub_test_123" },
    });
    const res = await (POST as (...args: any[]) => any)(req, mockContext);
    const json = await getResponseJson(res);
    expect(json.success).toBe(true);
    expect(json.message).toContain("already verified");
  });

  it("returns 409 if reference belongs to a different store", async () => {
    vi.mocked(PaystackService.verifyPlanChangePayment).mockResolvedValue({
      success: true,
      storeId: "store_test_123",
      newPlan: "STARTER",
      amountKobo: 2150000,
      currency: "NGN",
    });

    vi.mocked(prisma.paymentTransaction.findUnique).mockResolvedValue({
      storeId: "store_OTHER",
      status: "PENDING",
    } as any);

    const req = createMockRequest("POST", "/api/billing/verify-payment", {
      body: { reference: "sub_test_123" },
    });
    const res = await (POST as (...args: any[]) => any)(req, mockContext);
    expect(res.status).toBe(409);
  });

  it("successfully verifies payment and updates plan", async () => {
    vi.mocked(PaystackService.verifyPlanChangePayment).mockResolvedValue({
      success: true,
      storeId: "store_test_123",
      newPlan: "STARTER",
      amountKobo: 2150000,
      currency: "NGN",
    });

    vi.mocked(prisma.paymentTransaction.findUnique).mockResolvedValue(null);

    vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => {
      const tx = {
        store: {
          findUnique: vi.fn().mockResolvedValue({ plan: "FREE" }),
          update: vi.fn(),
        },
        paymentTransaction: { upsert: vi.fn() },
      };
      return fn(tx);
    });

    const req = createMockRequest("POST", "/api/billing/verify-payment", {
      body: { reference: "sub_test_123" },
    });
    const res = await (POST as (...args: any[]) => any)(req, mockContext);
    const json = await getResponseJson(res);
    expect(json.success).toBe(true);
    expect(json.message).toContain("updated successfully");
  });

  it("returns 500 if Paystack verification throws", async () => {
    vi.mocked(PaystackService.verifyPlanChangePayment).mockRejectedValue(
      new Error("Payment not successful"),
    );

    const req = createMockRequest("POST", "/api/billing/verify-payment", {
      body: { reference: "sub_test_123" },
    });
    const res = await (POST as (...args: any[]) => any)(req, mockContext);
    const json = await getResponseJson(res);
    expect(res.status).toBe(500);
    expect(json.error).toContain("Payment not successful");
  });

  it("returns 500 if database transaction fails", async () => {
    vi.mocked(PaystackService.verifyPlanChangePayment).mockResolvedValue({
      success: true,
      storeId: "store_test_123",
      newPlan: "PRO",
      amountKobo: 3225000,
      currency: "NGN",
    });

    vi.mocked(prisma.paymentTransaction.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.$transaction).mockRejectedValue(
      new Error("DB write failed"),
    );

    const req = createMockRequest("POST", "/api/billing/verify-payment", {
      body: { reference: "sub_test_123" },
    });
    const res = await (POST as (...args: any[]) => any)(req, mockContext);
    expect(res.status).toBe(500);
  });
});
