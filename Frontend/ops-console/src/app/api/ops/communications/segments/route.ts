import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { user } = await OpsAuthService.requireSession();
  if (!["OPS_OWNER", "OPS_ADMIN", "OPS_SUPPORT"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get("storeId")?.trim();
  if (!storeId) {
    return NextResponse.json(
      { error: "storeId query parameter is required" },
      { status: 400 },
    );
  }

  const minSpend = parseInt(searchParams.get("minSpend") || "0");
  const minOrders = parseInt(searchParams.get("minOrders") || "0");

  const customers = await prisma.customer.findMany({
    where: {
      storeId,
      orders: {
        some: { storeId },
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      createdAt: true,
      orders: {
        select: {
          total: true,
        },
      },
    },
    take: 200,
  });

  const filtered = customers
    .map((c: any) => ({
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      phone: c.phone,
      createdAt: c.createdAt,
      orderCount: c.orders.length,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      totalSpend: c.orders.reduce(
        (sum: number, o: any) => sum + Number(o.total ?? 0),
        0,
      ),
    }))
    .filter((c) => c.totalSpend >= minSpend && c.orderCount >= minOrders)
    .sort((a, b) => b.totalSpend - a.totalSpend);

  return NextResponse.json({ data: filtered });
}
