import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockRequest, getResponseJson } from "../helpers/api";

const { apiJson } = vi.hoisted(() => ({ apiJson: vi.fn() }));
const { buildBackendAuthHeaders } = vi.hoisted(() => ({
  buildBackendAuthHeaders: vi.fn(),
}));

vi.mock("@/lib/api-client-shared", () => ({ apiJson }));
vi.mock("@/lib/backend-proxy", () => ({ buildBackendAuthHeaders }));

import { GET } from "@/app/api/templates/route";

describe("Control Center - Templates proxy (/api/templates)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BACKEND_API_URL = "http://backend.test";
    buildBackendAuthHeaders.mockResolvedValue({
      user: { storeId: "store_test_123" },
      headers: { Authorization: "Bearer test", "x-store-id": "store_test_123" },
    });
  });

  it("GET forwards auth headers to backend", async () => {
    apiJson.mockResolvedValueOnce({ success: true, data: [{ id: "t1" }] });

    const req = createMockRequest("GET", "/api/templates");
    const res = await GET(req);
    const json = await getResponseJson(res);

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(apiJson).toHaveBeenCalledWith(
      "http://backend.test/api/templates?includeSystem=true",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer test" }),
        cache: "no-store",
      }),
    );
  });
});

