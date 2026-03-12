import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { user } = await OpsAuthService.requireSession();
  if (!["OPS_OWNER", "OPS_ADMIN", "OPS_FINANCE"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50");

  const subs = await prisma.subscription.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    where: {
      status: { in: ["ACTIVE", "TRIALING", "PAST_DUE"] },
    },
  });

  // Manual join for Store names since schema might not have back-relation accessible easily or for perf
  const storeIds = subs.map((s) => s.storeId);
  const stores = await prisma.store.findMany({
    where: { id: { in: storeIds } },
    select: { id: true, name: true, slug: true },
  });
  const storeMap = new Map(stores.map((s) => [s.id, s]));

  const data = subs.map((s) => ({
    ...s,
    store: storeMap.get(s.storeId),
  }));

  return NextResponse.json({ data });
}
