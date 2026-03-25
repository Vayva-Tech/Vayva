import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockRequest, getResponseJson } from "../helpers/api";

const { apiJson } = vi.hoisted(() => ({ apiJson: vi.fn() }));
const { buildBackendAuthHeaders, buildBackendUrl } = vi.hoisted(() => ({
  buildBackendAuthHeaders: vi.fn(),
  buildBackendUrl: vi.fn(),
}));

vi.mock("@/lib/api-client-shared", () => ({ apiJson }));
vi.mock("@/lib/backend-proxy", () => ({
  buildBackendAuthHeaders,
  buildBackendUrl,
}));

import { POST } from "@/app/api/storefront/publish/route";

describe("Control Center - Storefront Publish proxy (/api/storefront/publish)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    buildBackendUrl.mockImplementation((p: string) => `http://backend.test${p}`);
    buildBackendAuthHeaders.mockResolvedValue({
      user: { storeId: "store_test_123" },
      headers: { Authorization: "Bearer test", "x-store-id": "store_test_123" },
    });
  });

  it("POST forwards auth and publishes through backend", async () => {
    apiJson.mockResolvedValueOnce({ success: true, published: { id: "p1" } });

    const req = createMockRequest("POST", "/api/storefront/publish", {
      body: {},
    });
    const res = await POST(req);
    const json = await getResponseJson(res);

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(buildBackendAuthHeaders).toHaveBeenCalledTimes(1);
    expect(apiJson).toHaveBeenCalledWith(
      "http://backend.test/api/storefront/publish",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer test" }),
        body: JSON.stringify({}),
      }),
    );
  });
});

