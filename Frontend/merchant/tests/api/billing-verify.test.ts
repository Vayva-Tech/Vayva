import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockRequest, getResponseJson } from "../helpers/api";

const mockFetch = vi.fn();
global.fetch = mockFetch;

import { POST } from "@/app/api/billing/verify-payment/route";

describe("Billing Verify Payment - POST /api/billing/verify-payment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BACKEND_API_URL = "http://localhost:3001";
  });

  it("returns 400 if reference is missing", async () => {
    const req = createMockRequest("POST", "/api/billing/verify-payment", {
      body: {},
      headers: { "x-store-id": "store_test_123" },
    });
    const res = await POST(req);
    const json = await getResponseJson(res);
    expect(res.status).toBe(400);
    expect(json.error).toContain("reference");
  });

  it("proxies to backend and returns 201 on success", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: { verified: true, subscriptionId: "sub_1" },
      }),
    });

    const req = createMockRequest("POST", "/api/billing/verify-payment", {
      body: { reference: "ref_abc" },
      headers: { "x-store-id": "store_test_123" },
    });
    const res = await POST(req);
    const json = await getResponseJson(res);

    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data).toEqual({ verified: true, subscriptionId: "sub_1" });
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/billing/verify-payment",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "x-store-id": "store_test_123",
        }),
        body: JSON.stringify({ reference: "ref_abc" }),
      })
    );
  });

  it("returns 500 when backend proxy fails", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 502,
      json: async () => ({ error: "Upstream error" }),
    });

    const req = createMockRequest("POST", "/api/billing/verify-payment", {
      body: { reference: "ref_abc" },
      headers: { "x-store-id": "store_test_123" },
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});
