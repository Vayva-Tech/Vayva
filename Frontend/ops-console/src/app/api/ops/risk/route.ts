import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";
import { logger } from "@vayva/shared";

export async function GET(req: NextRequest) {
  await OpsAuthService.requireSession();

  try {
    const { searchParams } = new URL(req.url);
    const severity = searchParams.get("severity") || "all";

    // Get stores with risk indicators
    const stores = await prisma.store.findMany({
      where: {
        OR: [
          { kycStatus: "REJECTED" },
          { payoutsEnabled: false },
          { isActive: false },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        kycStatus: true,
        payoutsEnabled: true,
        isActive: true,
        createdAt: true,
      },
      take: 100,
    });

    // Generate risk flags from store data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const flags: any[] = [];

    stores.forEach((store) => {
      if (store.kycStatus === "REJECTED") {
        flags.push({
          id: `kyc-${store.id}`,
          storeId: store.id,
          storeName: store.name,
          storeSlug: store.slug,
          flagType: "KYC_REJECTED",
          severity: "high",
          description: "KYC verification was rejected. Manual review required.",
          status: "ACTIVE",
          createdAt: store.createdAt.toISOString(),
        });
      }

      if (!store.payoutsEnabled) {
        flags.push({
          id: `payout-${store.id}`,
          storeId: store.id,
          storeName: store.name,
          storeSlug: store.slug,
          flagType: "PAYOUTS_DISABLED",
          severity: "medium",
          description: "Payouts have been disabled for this merchant.",
          status: "ACTIVE",
          createdAt: store.createdAt.toISOString(),
        });
      }

      if (!store.isActive) {
        flags.push({
          id: `suspended-${store.id}`,
          storeId: store.id,
          storeName: store.name,
          storeSlug: store.slug,
          flagType: "ACCOUNT_SUSPENDED",
          severity: "critical",
          description: "Merchant account has been suspended.",
          status: "ACTIVE",
          createdAt: store.createdAt.toISOString(),
        });
      }
    });

    // Filter by severity if specified
    const filteredFlags =
      severity === "all" ? flags : flags.filter((f) => f.severity === severity);

    // Sort by severity (critical first)
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    filteredFlags.sort(
      (a, b) =>
        (severityOrder[a.severity as keyof typeof severityOrder] || 3) -
        (severityOrder[b.severity as keyof typeof severityOrder] || 3),
    );

    // Stats
    const stats = {
      critical: flags.filter((f) => f.severity === "critical").length,
      high: flags.filter((f) => f.severity === "high").length,
      medium: flags.filter((f) => f.severity === "medium").length,
      low: flags.filter((f) => f.severity === "low").length,
    };

    return NextResponse.json({ flags: filteredFlags, stats });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    logger.error("[RISK_FLAGS_ERROR]", { error });
    return NextResponse.json(
      { error: "Failed to fetch risk flags" },
      { status: 500 },
    );
  }
}
