import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { PERMISSIONS } from "@/lib/team/permissions";

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
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
    handleApiError(error, { endpoint: "/api/merchant/billing/status", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
