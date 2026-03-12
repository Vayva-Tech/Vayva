import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/api-handler", () => ({
  withVayvaAPI: (
    _permission: unknown,
    handler: (req: Request, ctx: { storeId: string }) => Promise<Response>,
  ) => handler,
}));

const { findMany } = vi.hoisted(() => ({
  findMany: vi.fn(),
}));

vi.mock("@vayva/db", () => ({
  prisma: {
    conversation: {
      findMany,
    },
  },
}));

import { GET } from "./route";

describe("GET /api/support/conversations", () => {
  beforeEach(() => {
    findMany.mockReset();
    findMany.mockResolvedValue([]);
  });

  it("adds a contact.channel filter when channel=instagram", async () => {
    const req = new Request("https://dash.test/api/support/conversations?channel=instagram");

    const res = await GET(req as any, { storeId: "store_1" } as Parameters<typeof GET>[1]);

    expect(findMany).toHaveBeenCalledTimes(1);
    const args = findMany.mock.calls[0]?.[0];
    expect(args.where.storeId).toBe("store_1");
    expect(args.where.contact.channel).toBe("INSTAGRAM");

    const json = await res.json();
    expect(json).toEqual({ success: true, data: [] });
  });

  it("adds a contact.channel filter when channel=whatsapp", async () => {
    const req = new Request("https://dash.test/api/support/conversations?channel=whatsapp");

    const res = await GET(req as any, { storeId: "store_1" } as Parameters<typeof GET>[1]);

    expect(findMany).toHaveBeenCalledTimes(1);
    const args = findMany.mock.calls[0]?.[0];
    expect(args.where.storeId).toBe("store_1");
    expect(args.where.contact.channel).toBe("WHATSAPP");

    const json = await res.json();
    expect(json).toEqual({ success: true, data: [] });
  });

  it("does not add contact.channel filter when channel is missing", async () => {
    const req = new Request("https://dash.test/api/support/conversations");

    const res = await GET(req as any, { storeId: "store_1" } as Parameters<typeof GET>[1]);

    expect(findMany).toHaveBeenCalledTimes(1);
    const args = findMany.mock.calls[0]?.[0];
    expect(args.where.storeId).toBe("store_1");
    expect(args.where.contact).toBeUndefined();

    const json = await res.json();
    expect(json).toEqual({ success: true, data: [] });
  });
});
