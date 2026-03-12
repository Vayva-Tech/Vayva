import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

// Mock dependencies
vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

vi.mock("@vayva/db", () => ({
  prisma: {
    paymentWebhookEvent: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
  WebhookEventStatus: {
    RECEIVED: "RECEIVED",
    PROCESSING: "PROCESSING",
    PROCESSED: "PROCESSED",
    FAILED: "FAILED",
  },
}));

vi.mock("@vayva/shared", () => ({
  QUEUES: { PAYMENTS_WEBHOOKS: "payments.webhooks" },
}));

vi.mock("@vayva/redis", () => ({
  getRedis: vi.fn().mockResolvedValue({}),
}));

vi.mock("bullmq", () => ({
  Queue: vi.fn().mockImplementation(() => ({
    add: vi.fn().mockResolvedValue({ id: "job_123" }),
  })),
}));

vi.mock("crypto", () => ({
  createHmac: vi.fn().mockReturnValue({
    update: vi.fn().mockReturnThis(),
    digest: vi.fn().mockReturnValue("computed-signature"),
  }),
  timingSafeEqual: vi.fn().mockReturnValue(true),
  randomUUID: vi.fn().mockReturnValue("mock-uuid"),
  createHash: vi.fn().mockReturnValue({
    update: vi.fn().mockReturnThis(),
    digest: vi.fn().mockReturnValue("mock-hash"),
  }),
}));

import { prisma } from "@vayva/db";
import { Queue } from "bullmq";

describe("Paystack Webhook Handler", () => {
  const mockSecretKey = "sk_test_mock_secret_key";

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PAYSTACK_SECRET_KEY = mockSecretKey;
  });

  const createMockRequest = (body: object, signature: string = "valid-signature") => {
    return new Request("http://localhost/api/webhooks/paystack", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-paystack-signature": signature,
      },
      body: JSON.stringify(body),
    }) as any;
  };

  it("should return 200 immediately and queue job for valid webhook", async () => {
    (prisma.paymentWebhookEvent.findUnique as any).mockResolvedValue(null);
    (prisma.paymentWebhookEvent.create as any).mockResolvedValue({ id: "event_123" });

    const request = createMockRequest({
      event: "charge.success",
      data: {
        id: 12345,
        reference: "REF_123",
        amount: 50000,
        status: "success",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.received).toBe(true);
    expect(data.queued).toBe(true);
    expect(Queue).toHaveBeenCalledWith("payments.webhooks", expect.any(Object));
  });

  it("should return 200 for duplicate events without re-queuing", async () => {
    (prisma.paymentWebhookEvent.findUnique as any).mockResolvedValue({
      id: "existing_event",
      status: "RECEIVED",
    });

    const request = createMockRequest({
      event: "charge.success",
      data: { id: 12345, reference: "REF_123" },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.duplicate).toBe(true);
    expect(prisma.paymentWebhookEvent.create).not.toHaveBeenCalled();
  });

  it("should return 401 for invalid signature", async () => {
    const { timingSafeEqual } = await import("crypto");
    (timingSafeEqual as any).mockReturnValueOnce(false);

    const request = createMockRequest(
      { event: "charge.success", data: {} },
      "invalid-signature"
    );

    const response = await POST(request);

    expect(response.status).toBe(401);
  });

  it("should return 200 even when PAYSTACK_SECRET_KEY is missing", async () => {
    delete process.env.PAYSTACK_SECRET_KEY;

    const request = createMockRequest({ event: "charge.success", data: {} });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.received).toBe(true);
  });

  it("should handle charge.success events", async () => {
    (prisma.paymentWebhookEvent.findUnique as any).mockResolvedValue(null);
    (prisma.paymentWebhookEvent.create as any).mockResolvedValue({ id: "event_123" });

    const request = createMockRequest({
      event: "charge.success",
      data: {
        id: 12345,
        reference: "REF_CHARGE_123",
        amount: 100000,
        currency: "NGN",
        status: "success",
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    const queueAddMock = (Queue as any).mock.results[0].value.add;
    expect(queueAddMock).toHaveBeenCalledWith(
      "process-webhook",
      expect.objectContaining({
        eventType: "charge.success",
        data: expect.objectContaining({
          reference: "REF_CHARGE_123",
          amount: 100000,
        }),
      }),
      expect.objectContaining({
        jobId: expect.any(String),
        attempts: 5,
      })
    );
  });

  it("should handle subscription events", async () => {
    (prisma.paymentWebhookEvent.findUnique as any).mockResolvedValue(null);
    (prisma.paymentWebhookEvent.create as any).mockResolvedValue({ id: "event_123" });

    const request = createMockRequest({
      event: "subscription.disable",
      data: {
        subscription_code: "SUB_12345",
        customer: { email: "test@example.com" },
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    const queueAddMock = (Queue as any).mock.results[0].value.add;
    expect(queueAddMock).toHaveBeenCalledWith(
      "process-webhook",
      expect.objectContaining({
        eventType: "subscription.disable",
      }),
      expect.any(Object)
    );
  });

  it("should handle transfer events", async () => {
    (prisma.paymentWebhookEvent.findUnique as any).mockResolvedValue(null);
    (prisma.paymentWebhookEvent.create as any).mockResolvedValue({ id: "event_123" });

    const request = createMockRequest({
      event: "transfer.success",
      data: {
        reference: "WALLET-WITHDRAW-withdrawal_123",
        transfer_code: "TRF_12345",
        amount: 50000,
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  it("should return 200 even on unhandled errors (to prevent retries)", async () => {
    (prisma.paymentWebhookEvent.findUnique as any).mockRejectedValue(
      new Error("Database error")
    );

    const request = createMockRequest({
      event: "charge.success",
      data: { id: 12345 },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.received).toBe(true);
    expect(data.error).toBe("Processing error");
  });

  it("should persist event with RECEIVED status before queuing", async () => {
    (prisma.paymentWebhookEvent.findUnique as any).mockResolvedValue(null);
    (prisma.paymentWebhookEvent.create as any).mockResolvedValue({ id: "event_123" });

    const request = createMockRequest({
      event: "charge.success",
      data: { id: 12345, reference: "REF_123" },
    });

    await POST(request);

    expect(prisma.paymentWebhookEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        provider: "paystack",
        eventType: "charge.success",
        status: "RECEIVED",
      }),
    });
  });
});
