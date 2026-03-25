import { NextRequest, NextResponse } from "next/server";
import { prisma, prismaDelegates, ReturnStatus } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";
import { logger } from "@vayva/shared";

interface ReturnRequestWithOrder {
  id: string;
  orderId: string;
  status: string;
  reasonText: string | null;
  reasonCode: string;
  merchantId: string;
  createdAt: Date;
}

export async function GET(req: NextRequest) {
  await OpsAuthService.requireSession();

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "PENDING";

    // Get return requests first
    const returns = await prismaDelegates.returnRequest.findMany({
      where: { status: status as ReturnStatus },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // Get store info separately for each merchantId
    const merchantIds = [
      ...new Set(
        returns.map((r: { merchantId: string }) => r.merchantId),
      ),
    ] as string[];
    const stores = await prisma.store.findMany({
      where: { id: { in: merchantIds } },
      select: { id: true, name: true },
    });
    const storeMap = new Map(stores.map((s: any) => [s.id, s]));

    // Get order info separately
    const orderIds = returns.map((r: { orderId: string }) => r.orderId);
    const orders = await prisma.order.findMany({
      where: { id: { in: orderIds } },
      select: { id: true, orderNumber: true, storeId: true, customerEmail: true },
    });
    const orderMap = new Map(orders.map((o) => [o.id, o]));

    const refunds = (returns as unknown as ReturnRequestWithOrder[]).map((ret) => {
      const order = orderMap.get(ret.orderId);
      const store = order ? storeMap.get(order.storeId) : null;
      return {
        id: ret.id,
        orderId: ret.orderId,
        orderNumber: order?.orderNumber || ret.orderId.slice(0, 8),
        amount: 0, // ReturnRequest doesn't have refundAmount field
        status: ret.status,
        reason: ret.reasonText || ret.reasonCode || "No reason provided",
        storeName: store?.name || "Unknown",
        storeId: order?.storeId || "",
        customerEmail: order?.customerEmail || "",
        createdAt: ret.createdAt.toISOString(),
      };
    });

    // Stats
    const [pending, approved, rejected] = await Promise.all([
      prismaDelegates.returnRequest.count({
        where: { status: "PENDING" as ReturnStatus },
      }),
      prismaDelegates.returnRequest.count({
        where: { status: "APPROVED" as ReturnStatus },
      }),
      prismaDelegates.returnRequest.count({
        where: { status: "REJECTED" as ReturnStatus },
      }),
    ]);

    return NextResponse.json({
      refunds,
      stats: { pending, approved, rejected },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    logger.error("[REFUNDS_ERROR]", { error });
    return NextResponse.json(
      { error: "Failed to fetch refunds" },
      { status: 500 },
    );
  }
}
