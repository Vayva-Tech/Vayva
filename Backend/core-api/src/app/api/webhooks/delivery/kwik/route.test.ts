import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

vi.mock("@vayva/db", () => ({
  prisma: {
    shipment: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    trackingEvent: {
      create: vi.fn(),
    },
    store: {
      findUnique: vi.fn(),
    },
  },
  DispatchJobStatus: {
    ACCEPTED: "ACCEPTED",
    PICKED_UP: "PICKED_UP",
    IN_TRANSIT: "IN_TRANSIT",
    DELIVERED: "DELIVERED",
    FAILED: "FAILED",
    CANCELED: "CANCELED",
  },
}));

vi.mock("@/lib/tracking-notifications", () => ({
  sendDeliveryStatusUpdate: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("@vayva/shared", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import crypto from "crypto";
import { prisma } from "@vayva/db";

describe("Kwik Delivery Webhook", () => {
  const secret = "test-secret";

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.KWIK_WEBHOOK_SECRET = secret;
  });

  function sign(body: string) {
    return crypto.createHmac("sha256", secret).update(body).digest("hex");
  }

  const createReq = (payload: any, signature?: string) => {
    const body = JSON.stringify(payload);
    return new Request("http://localhost/api/webhooks/delivery/kwik", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-kwik-signature": signature ?? sign(body),
      },
      body,
    }) as any;
  };

  it("rejects missing signature", async () => {
    const req = new Request("http://localhost/api/webhooks/delivery/kwik", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job_id: "abc", job_status: 1 }),
    }) as any;
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("rejects invalid signature", async () => {
    const req = createReq({ job_id: "abc", job_status: 1 }, "deadbeef");
    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("updates shipment status for valid webhook", async () => {
    (prisma.shipment.findFirst as any).mockResolvedValueOnce({
      id: "sh_1",
      status: "CREATED",
      trackingCode: "abc",
      recipientPhone: "+2348000000000",
      storeId: "st_1",
    });
    (prisma.shipment.update as any).mockResolvedValueOnce({});

    const req = createReq({ job_id: "abc", job_status: 1 });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(prisma.shipment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "sh_1" },
        data: expect.objectContaining({ status: "ACCEPTED" }),
      }),
    );
  });
});

