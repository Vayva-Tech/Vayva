import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET } from "../route";
import { NextRequest } from "next/server";

vi.mock("@/lib/api-handler", () => ({
  withVayvaAPI: vi.fn((_permission, handler) => {
    return async (req: NextRequest, context: Record<string, unknown>) => {
      return handler(req, context as never);
    };
  }),
}));

vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), info: vi.fn() },
}));

const findUnique = vi.fn();

vi.mock("@vayva/db", () => ({
  prisma: {
    order: { findUnique: (...args: unknown[]) => findUnique(...args) },
  },
}));

describe("GET /api/orders/[id] tenant isolation", () => {
  const storeA = "store-tenant-a";
  const orderId = "order-uuid-1";

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.NEXT_PUBLIC_API_URL;
  });

  it("queries order with compound id + storeId from auth context", async () => {
    findUnique.mockResolvedValue({
      id: orderId,
      storeId: storeA,
      items: [],
      customer: null,
      shipments: [],
      paymentTransactions: [],
      orderEvents: [],
    });

    const req = new NextRequest(`http://localhost/api/orders/${orderId}`);
    const wrapped = GET as (
      r: NextRequest,
      ctx: { params: Promise<{ id: string }> },
    ) => Promise<Response>;

    const res = await wrapped(req, {
      params: Promise.resolve({ id: orderId }),
      storeId: storeA,
      user: {} as never,
      correlationId: "req-1",
      db: {} as never,
    });

    expect(res.status).toBe(200);
    expect(findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: orderId, storeId: storeA },
      }),
    );
  });

  it("returns 404 when order belongs to another store (no row for compound where)", async () => {
    findUnique.mockResolvedValue(null);

    const req = new NextRequest(`http://localhost/api/orders/${orderId}`);
    const wrapped = GET as (
      r: NextRequest,
      ctx: { params: Promise<{ id: string }> },
    ) => Promise<Response>;

    const res = await wrapped(req, {
      params: Promise.resolve({ id: orderId }),
      storeId: storeA,
      user: {} as never,
      correlationId: "req-2",
      db: {} as never,
    });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Order not found");
  });
});
