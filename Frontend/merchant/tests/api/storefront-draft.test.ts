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

import { GET, POST, PATCH } from "@/app/api/storefront/draft/route";

describe("Control Center - Storefront Draft proxy (/api/storefront/draft)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    buildBackendUrl.mockImplementation((p: string) => `http://backend.test${p}`);
    buildBackendAuthHeaders.mockResolvedValue({
      user: { storeId: "store_test_123" },
      headers: { Authorization: "Bearer test", "x-store-id": "store_test_123" },
    });
  });

  it("GET forwards auth and normalizes response to { draft }", async () => {
    apiJson.mockResolvedValueOnce({ found: true, draft: { id: "d1" } });

    const req = createMockRequest("GET", "/api/storefront/draft");
    const res = await GET(req);
    const json = await getResponseJson(res);

    expect(res.status).toBe(200);
    expect(json).toEqual({ draft: { id: "d1" } });

    expect(buildBackendAuthHeaders).toHaveBeenCalledTimes(1);
    expect(apiJson).toHaveBeenCalledWith(
      "http://backend.test/api/storefront/draft",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer test" }),
        cache: "no-store",
      }),
    );
  });

  it("POST forwards auth and body to backend", async () => {
    apiJson.mockResolvedValueOnce({ success: true, draft: { id: "d1" } });

    const req = createMockRequest("POST", "/api/storefront/draft", {
      body: { activeTemplateId: "tpl_1" },
    });
    const res = await POST(req);
    const json = await getResponseJson(res);

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(buildBackendAuthHeaders).toHaveBeenCalledTimes(1);
    expect(apiJson).toHaveBeenCalledWith(
      "http://backend.test/api/storefront/draft",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer test" }),
        body: JSON.stringify({ activeTemplateId: "tpl_1" }),
      }),
    );
  });

  it("PATCH supports autosave and forwards auth to backend", async () => {
    apiJson.mockResolvedValueOnce({ success: true, draft: { id: "d1" } });

    const req = createMockRequest("PATCH", "/api/storefront/draft", {
      body: { themeConfig: { color: "green" } },
    });
    const res = await PATCH(req);
    const json = await getResponseJson(res);

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(buildBackendAuthHeaders).toHaveBeenCalledTimes(1);
    expect(apiJson).toHaveBeenCalledWith(
      "http://backend.test/api/storefront/draft",
      expect.objectContaining({
        method: "PATCH",
        headers: expect.objectContaining({ Authorization: "Bearer test" }),
        body: JSON.stringify({ themeConfig: { color: "green" } }),
      }),
    );
  });
});

