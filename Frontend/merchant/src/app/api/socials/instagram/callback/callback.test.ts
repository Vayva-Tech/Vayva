import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/api-handler", () => ({
  withVayvaAPI: (
    _permission: unknown,
    handler: (req: unknown, ctx: { storeId: string }) => unknown,
  ) => {
    return (req: unknown) => handler(req, { storeId: "store_1" });
  },
}));

vi.mock("@/lib/security/encryption", () => ({
  encrypt: vi.fn((v: string) => `enc:${v}`),
}));

const { storeFindUnique, storeUpdate } = vi.hoisted(() => ({
  storeFindUnique: vi.fn(),
  storeUpdate: vi.fn(),
}));

vi.mock("@vayva/db", () => ({
  prisma: {
    store: {
      findUnique: storeFindUnique,
      update: storeUpdate,
    },
  },
}));

import { encrypt } from "../../../../../lib/security/encryption";
import { GET } from "./route";

function mockReq(params: {
  url: string;
  cookies?: Record<string, string>;
}): unknown {
  const u = new URL(params.url);
  return {
    nextUrl: u,
    cookies: {
      get: (key: string) => {
        const v = params.cookies?.[key];
        return v ? { value: v } : undefined;
      },
    },
  };
}

describe("GET /api/socials/instagram/callback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storeFindUnique.mockReset();
    storeUpdate.mockReset();
    globalThis.fetch = vi.fn() as unknown as typeof fetch;
  });

  it("redirects with invalid_state when state cookie mismatches", async () => {
    const req = mockReq({
      url: "https://dash.test/api/socials/instagram/callback?code=abc&state=wrong",
      cookies: {
        ig_oauth_state: "expected",
        ig_oauth_return_to: "/dashboard/socials",
        ig_oauth_store_id: "store_1",
      },
    });

    const res = await GET(req as Parameters<typeof GET>[0]);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(
      "https://dash.test/dashboard/socials?ig=error&reason=invalid_state",
    );
  });

  it("stores encrypted page token and redirects to connected", async () => {
    process.env.META_APP_ID = "app_id";
    process.env.META_APP_SECRET = "app_secret";
    process.env.META_IG_REDIRECT_URI = "https://dash.test/api/socials/instagram/callback";

    storeFindUnique.mockResolvedValue({ id: "store_1", settings: {} });
    storeUpdate.mockResolvedValue({});

    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock
      // short-lived token exchange
      .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ access_token: "short" }) })
      // long-lived token exchange
      .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ access_token: "long" }) })
      // accounts/pages fetch
      .mockResolvedValueOnce({
        ok: true,
        text: async () =>
          JSON.stringify({
            data: [
              {
                id: "page_1",
                name: "My Page",
                access_token: "page_token",
                instagram_business_account: { id: "ig_biz_1" },
              },
            ],
          }),
      });

    const req = mockReq({
      url: "https://dash.test/api/socials/instagram/callback?code=abc&state=expected",
      cookies: {
        ig_oauth_state: "expected",
        ig_oauth_return_to: "/dashboard/socials",
        ig_oauth_store_id: "store_1",
      },
    });

    const res = await GET(req as Parameters<typeof GET>[0]);

    expect(encrypt).toHaveBeenCalledWith("page_token");
    expect(storeUpdate).toHaveBeenCalledTimes(1);
    const updateArgs = storeUpdate.mock.calls[0]?.[0];
    expect(updateArgs.where.id).toBe("store_1");
    const settings = updateArgs.data.settings as Record<string, unknown>;
    expect((settings.instagram as Record<string, unknown> | undefined)).toMatchObject({
      connected: true,
      provider: "meta",
      pageId: "page_1",
      pageName: "My Page",
      igBusinessId: "ig_biz_1",
      encryptedPageAccessToken: "enc:page_token",
    });

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("https://dash.test/dashboard/socials?ig=connected");
  });
});
