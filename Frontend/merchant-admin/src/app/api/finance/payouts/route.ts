import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(PERMISSIONS.PAYOUTS_VIEW, async (_req: NextRequest, { storeId }: { storeId: string }) => {
  try {
    const payouts = await prisma.payout?.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(payouts, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("[FINANCE_PAYOUTS_GET]", { error: err.message, storeId });
    return NextResponse.json({ error: "Failed to load payouts" }, { status: 500 });
  }
});

export const POST = withVayvaAPI(PERMISSIONS.PAYOUTS_MANAGE, async (req: NextRequest, { storeId }: { storeId: string }) => {
  try {
    const body = await req.json().catch(() => ({}));
    const amount = Number(body?.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const payout = await prisma.payout?.create({
      data: {
        storeId,
        provider: "MANUAL",
        providerPayoutId: `manual_${Date.now()}`,
        status: "PENDING",
        amount,
        currency: "NGN",
        reference: `payout_${Date.now()}`,
        destination: body?.bankDetails || null,
      },
    });

    return NextResponse.json(payout);
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("[FINANCE_PAYOUTS_POST]", { error: err.message, storeId });
    return NextResponse.json({ error: "Failed to request payout" }, { status: 500 });
  }
});
