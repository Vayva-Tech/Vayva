import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";
import { logger } from "@vayva/shared";

export async function GET(req: Request) {
  try {
    await OpsAuthService.requireSession();

    const [merchants, stores, transactions, kycPending] = await Promise.all([
      prisma.tenant.count(),
      prisma.store.count(),
      prisma.paymentTransaction.count(),
      prisma.kycRecord.count({ where: { status: "PENDING" } }),
    ]);

    const stats = {
      merchants,
      stores,
      transactions,
      kycPending,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json({ stats });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("[AUDIT_OVERVIEW_ERROR]", { error });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
