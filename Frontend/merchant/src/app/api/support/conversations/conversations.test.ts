import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { buildBackendAuthHeaders } = vi.hoisted(() => ({
  buildBackendAuthHeaders: vi.fn(),
}));

const { findMany } = vi.hoisted(() => ({
  findMany: vi.fn(),
}));

vi.mock("@/lib/backend-proxy", () => ({
  buildBackendAuthHeaders,
}));

vi.mock("@vayva/db", () => ({
  prisma: {
    conversation: {
      findMany,
    },
  },
}));

import { GET } from "./route";

function convRequest(url: string) {
  return new NextRequest(url, {
    headers: { "x-store-id": "store_1" },
  });
}

describe("GET /api/support/conversations", () => {
  beforeEach(() => {
    findMany.mockReset();
    findMany.mockResolvedValue([]);
    buildBackendAuthHeaders.mockReset();
    buildBackendAuthHeaders.mockResolvedValue({
      user: { storeId: "store_1" },
      headers: {},
    });
  });

  it("adds a contact.channel filter when channel=instagram", async () => {
    const req = convRequest("https://dash.test/api/support/conversations?channel=instagram");

    const res = await GET(req);

    expect(findMany).toHaveBeenCalledTimes(1);
    const args = findMany.mock.calls[0]?.[0];
    expect(args.where.storeId).toBe("store_1");
    expect(args.where.contact.channel).toBe("INSTAGRAM");

    const json = await res.json();
    expect(json).toEqual({ success: true, data: [] });
  });

  it("adds a contact.channel filter when channel=whatsapp", async () => {
    const req = convRequest("https://dash.test/api/support/conversations?channel=whatsapp");

    const res = await GET(req);

    expect(findMany).toHaveBeenCalledTimes(1);
    const args = findMany.mock.calls[0]?.[0];
    expect(args.where.storeId).toBe("store_1");
    expect(args.where.contact.channel).toBe("WHATSAPP");

    const json = await res.json();
    expect(json).toEqual({ success: true, data: [] });
  });

  it("does not add contact.channel filter when channel is missing", async () => {
    const req = convRequest("https://dash.test/api/support/conversations");

    const res = await GET(req);

    expect(findMany).toHaveBeenCalledTimes(1);
    const args = findMany.mock.calls[0]?.[0];
    expect(args.where.storeId).toBe("store_1");
    expect(args.where.contact).toBeUndefined();

    const json = await res.json();
    expect(json).toEqual({ success: true, data: [] });
  });
});
