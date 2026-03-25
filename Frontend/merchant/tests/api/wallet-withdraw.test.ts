import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockRequest, getResponseJson } from "../helpers/api";

const mockFetch = vi.fn();
global.fetch = mockFetch;

import { GET } from "@/app/api/wallet/withdraw/route";

describe("Wallet withdraw - GET /api/wallet/withdraw", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BACKEND_API_URL = "http://localhost:3001";
  });

  it("proxies wallet summary from backend", async () => {
    const payload = {
      balance: 10000,
      availableBalance: 8000,
      pendingWithdrawals: 2000,
      currency: "NGN",
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => payload,
    });

    const request = createMockRequest("GET", "/api/wallet/withdraw", {
      headers: { "x-store-id": "store_test_123" },
    });
    const response = await GET(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(200);
    expect(data).toEqual(payload);
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/wallet/withdraw",
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "x-store-id": "store_test_123",
        }),
      })
    );
  });

  it("returns 500 when backend errors", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: "fail" }),
    });

    const request = createMockRequest("GET", "/api/wallet/withdraw", {
      headers: { "x-store-id": "store_test_123" },
    });
    const response = await GET(request);
    expect(response.status).toBe(500);
  });
});
