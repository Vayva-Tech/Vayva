import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { kycService } from "@/services/kyc";
import { checkRateLimitCustom } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { EventBus } from "@/lib/events/eventBus";

export const dynamic = "force-dynamic";

export const POST = withVayvaAPI(PERMISSIONS.KYC_MANAGE, async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string } }) => {
    try {
        const body = await req.json().catch(() => ({}));
        const userId = user.id;

        await checkRateLimitCustom(userId, "kyc_submit", 5, 3600);

        const { nin, cacNumber, consent } = body;
        const ip = req.headers?.get("x-forwarded-for") || "unknown";

        if (!nin || !consent) {
            return NextResponse.json({ error: "NIN and consent are required" }, { status: 400 });
        }

        const trimmedNin = nin.trim();
        if (!/^\d{11}$/.test(trimmedNin)) {
            return NextResponse.json({ error: "NIN must be exactly 11 digits" }, { status: 400 });
        }

        if (cacNumber) {
            const trimmedCac = cacNumber.trim();
            if (!/^(RC|BN)?\d{5,8}$/i.test(trimmedCac)) {
                return NextResponse.json({ error: "Invalid CAC registration number format" }, { status: 400 });
            }
        }

        const result = await kycService.submitForReview(storeId, {
            nin: trimmedNin,
            cacNumber: cacNumber?.trim() || undefined,
            consent,
            ipAddress: ip,
            actorUserId: userId,
        });

        // Notify ops admins of new KYC submission
        try {
            await EventBus.publish({
                type: "kyc.submitted",
                merchantId: storeId,
                entityType: "kyc",
                entityId: result.recordId,
                payload: {
                    ninMasked: `${trimmedNin.slice(0, 4)}****${trimmedNin.slice(-3)}`,
                    cacNumber: cacNumber?.trim() || undefined,
                    merchantId: storeId,
                    submittedBy: userId,
                },
                dedupeKey: `kyc-submit-${storeId}-${Date.now()}`,
                ctx: {
                    actorId: userId,
                    actorType: "merchant",
                    actorLabel: "Merchant",
                    ipAddress: ip,
                    correlationId: result.recordId,
                },
            });
        } catch (eventError: any) {
            logger.error("[KYC_SUBMIT_POST] Failed to publish KYC event", eventError);
            // Don't fail the request if event publishing fails
        }

        return NextResponse.json(result);
    } catch (error: unknown) {
        logger.error("[KYC_SUBMIT_POST]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
});
