import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user } = await OpsAuthService.requireSession();
  if (!["OPS_OWNER", "OPS_ADMIN", "OPS_SUPPORT"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [total, pending, inTransit, delivered] = await Promise.all([
    prisma.shipment.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.shipment.count({
      where: { status: "CREATED", createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.shipment.count({
      where: { status: "IN_TRANSIT", createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.shipment.count({
      where: { status: "DELIVERED", createdAt: { gte: thirtyDaysAgo } },
    }),
  ]);

  return NextResponse.json({
    data: {
      total,
      pending,
      inTransit,
      delivered,
      period: "30d",
    },
  });
}
