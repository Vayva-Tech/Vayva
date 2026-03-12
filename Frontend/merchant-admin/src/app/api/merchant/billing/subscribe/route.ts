import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/prisma";
import { PLANS, PlanKey } from "@/lib/billing/plans";

// Use string literals since enums don't exist in Prisma client
const SubscriptionStatus = {
  PENDING_PAYMENT: "PENDING_PAYMENT",
  ACTIVE: "ACTIVE",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED",
} as const;

const BillingProvider = {
  PAYSTACK: "PAYSTACK",
  FLUTTERWAVE: "FLUTTERWAVE",
} as const;

export const POST = withVayvaAPI(PERMISSIONS.BILLING_MANAGE, async (request: NextRequest, { storeId, user }: { storeId: string; user: { id: string; email: string } }) => {
    const body = await request.json() as { plan_slug: string; billing_cycle?: "monthly" | "quarterly"; payment_method?: "card" | "bank_transfer" };
    const { plan_slug, billing_cycle = "monthly", payment_method = "card" } = body;
    
    // Type-safe plan validation
    const planKey = plan_slug.toUpperCase() as PlanKey;
    if (!(planKey in PLANS)) {
        return NextResponse.json({ error: "Invalid Plan" }, { status: 400 });
    }
    
    try {
        const { PaystackService } = await import("@/lib/payment/paystack");
        
        // Calculate period end based on billing cycle
        const now = new Date();
        const periodEnd = new Date(now);
        if (billing_cycle === "quarterly") {
            periodEnd.setMonth(periodEnd.getMonth() + 3);
        } else {
            periodEnd.setMonth(periodEnd.getMonth() + 1);
        }
        
        const payment = await PaystackService.createPaymentForPlanChange(
            user.email, 
            plan_slug, 
            storeId, 
            billing_cycle,
            payment_method
        );
        
        // Upsert pending subscription using the correct Subscription model
        await prisma.subscription.upsert({
            where: { storeId },
            update: {
                planKey: plan_slug.toUpperCase(),
                status: SubscriptionStatus.PENDING_PAYMENT as any,
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd,
                provider: BillingProvider.PAYSTACK,
            },
            create: {
                storeId,
                planKey: plan_slug.toUpperCase(),
                status: SubscriptionStatus.PENDING_PAYMENT as any,
                provider: BillingProvider.PAYSTACK,
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd,
            },
        });
        
        return NextResponse.json({
            success: true,
            checkout_url: payment.authorization_url,
            reference: payment.reference,
        });
    }
    catch (e: any) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
});
