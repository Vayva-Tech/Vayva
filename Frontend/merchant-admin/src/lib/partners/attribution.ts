import { prisma } from "@vayva/db";
import { verifyReferralToken } from "./referral";
export class AttributionService {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async trackSignup(merchantId: any, token: string | null | undefined) {
        const payload = verifyReferralToken(token);
        if (!payload)
            return null;
        // Verify Partner/Code exist
        const partner = await prisma.partner.findUnique({
            where: { id: payload.partnerId },
        });
        if (!partner || partner.status !== "active")
            return null;
        // Idempotency: Ignore if merchant already attributed
        const existing = await prisma.referralAttribution.findUnique({
            where: { merchantId },
        });
        if (existing)
            return existing;
        return prisma.referralAttribution.create({
            data: {
                partnerId: payload.partnerId,
                merchantId,
                referralCode: payload.code,
                signupCompletedAt: new Date(),
            },
        });
    }
    static async trackStoreLive(storeId: string) {
        // Need to link Store -> Merchant.
        // We assume Store has a 'Subscription' or we look up owner.
        // For V1, let's assume `storeId` tells us the merchant implicitly via ownership.
        // Or better: `ReferralAttribution` is keyed by `merchantId`.
        // We need `merchantId` from `storeId`.
        const store = await prisma.store.findUnique({
            where: { id: storeId },
            include: { memberships: { where: { role_enum: "OWNER" } } },
        });
        const ownerId = store?.memberships[0]?.userId; // Assuming membership links to User (Merchant)
        if (!ownerId)
            return;
        const attr = await prisma.referralAttribution.findUnique({
            where: { merchantId: ownerId },
        });
        if (attr && !attr.storeLiveAt) {
            await prisma.referralAttribution.update({
                where: { id: attr.id },
                data: { storeLiveAt: new Date() },
            });
            // Optional: Create "activation" ledger entry?
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async trackPayment(storeId: string, amount: any) {
        const store = await prisma.store.findUnique({
            where: { id: storeId },
            include: { memberships: { where: { role_enum: "OWNER" } } },
        });
        const ownerId = store?.memberships[0]?.userId;
        if (!ownerId)
            return;
        const attr = await prisma.referralAttribution.findUnique({
            where: { merchantId: ownerId },
        });
        if (attr && !attr.firstPaymentAt) {
            // First payment! Credit generic commission (e.g. 10% or fixed)
            await prisma.$transaction([
                prisma.referralAttribution.update({
                    where: { id: attr.id },
                    data: { firstPaymentAt: new Date() },
                }),
                prisma.partnerPayoutLedger.create({
                    data: {
                        partnerId: attr.partnerId,
                        merchantId: ownerId,
                        amountNgn: Math.floor(amount * 0.1), // 10% example
                        reason: "subscription_commission",
                        status: "pending",
                    },
                }),
            ]);
        }
    }
}
