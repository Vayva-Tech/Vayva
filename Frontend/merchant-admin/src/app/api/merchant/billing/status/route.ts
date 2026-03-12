import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(PERMISSIONS.BILLING_MANAGE, async (_req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const [store, subscription] = await Promise.all([
            prisma.store.findUnique({
                where: { id: storeId },
                select: { plan: true },
            }),
            prisma.subscription.findUnique({
                where: { storeId },
                select: { 
                    planKey: true, 
                    status: true, 
                    currentPeriodEnd: true, 
                    cancelAtPeriodEnd: true,
                    trialEndsAt: true,
                    gracePeriodEndsAt: true,
                },
            }),
        ]);

        const planKey = (subscription?.planKey || store?.plan || "FREE").toUpperCase();
        const status = subscription?.status || "TRIALING";
        const periodEnd = subscription?.currentPeriodEnd || null;

        return NextResponse.json({
            currentPlan: {
                planKey: planKey.toLowerCase(),
                status: status.toLowerCase(),
                periodEnd,
                cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd || false,
                trialEndsAt: subscription?.trialEndsAt,
                gracePeriodEndsAt: subscription?.gracePeriodEndsAt,
            },
            subscription: subscription ? {
                status: subscription.status,
                periodEnd: subscription.currentPeriodEnd,
                cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
                trialEndsAt: subscription.trialEndsAt,
                gracePeriodEndsAt: subscription.gracePeriodEndsAt,
            } : null,
            invoices: [], // Note: Invoice integration to be added in future release
        }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    } catch (error) {
        logger.error("[BILLING_STATUS_GET] Failed to fetch billing status", { storeId, error });
        return NextResponse.json({ error: "Failed to fetch billing status" }, { status: 500 });
    }
});
