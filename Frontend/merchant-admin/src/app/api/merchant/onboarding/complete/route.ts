import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { syncOnboardingData } from "@/lib/onboarding-sync";
import { INDUSTRY_PROFILES } from "@/lib/onboarding-profiles";
import { logger } from "@/lib/logger";

interface IndustryProfileMap {
  [key: string]: { features: string[] } | undefined;
}

interface OnboardingBody {
  industry?: string;
  industrySlug?: string;
  identity?: { fullName?: string };
  finance?: { accountName?: string; accountNumber?: string; bankCode?: string };
  settings?: Record<string, unknown>;
}

function normalizeName(name: string | null | undefined) {
    if (!name) return "";
    return name.replace(/[^a-zA-Z\s]/g, "").toLowerCase().trim();
}

function accountNameMatchesIdentity(accountName: string, fullName: string) {
    const acc = normalizeName(accountName);
    const tokens = normalizeName(fullName)
        .split(" ")
        .filter((t) => t.length >= 3);
    if (tokens.length === 0) return false;
    return tokens.every((t) => acc.includes(t));
}

export const POST = withVayvaAPI(PERMISSIONS.ONBOARDING_MANAGE, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const body = await req.json().catch(() => ({})) as OnboardingBody;

        const industryKey = body.industrySlug || body.industry || "default";

        // Validate generic profile
        const profile = (INDUSTRY_PROFILES as unknown as IndustryProfileMap)[industryKey];
        if (!profile) {
            return NextResponse.json({ error: "Invalid industry" }, { status: 400 });
        }

        // ENHANCED VALIDATION: Real Bank Verification
        const state = body;

        // CRITICAL: Verify payout name matches identity (simple first-token match)
        if (state.identity?.fullName &&
            state.finance?.accountName &&
            !accountNameMatchesIdentity(state.finance?.accountName, state.identity?.fullName)) {
            // Soft warning log
            logger.warn("[ONBOARDING_COMPLETE] Identity mismatch", { identity: state.identity?.fullName, accountName: state.finance?.accountName });
        }

        // CRITICAL: Paystack Verification before Final Sync
        // We want to ensure the name we save is the OFFICIAL verified name
        if (state.finance?.accountNumber && state.finance?.bankCode) {
            try {
                const { PaystackService } = await import("@/lib/payment/paystack");
                const resolved = await PaystackService.resolveAccount(state.finance?.accountNumber, state.finance?.bankCode);

                // Overwrite with verified name
                if (state.finance) state.finance.accountName = resolved.account_name;

                // Re-check identity match against OFFICIAL name if desired (Strict Mode)
                if (state.identity?.fullName && !accountNameMatchesIdentity(resolved.account_name, state.identity?.fullName)) {
                    return NextResponse.json({
                        error: `Bank account name (${resolved.account_name}) does not match your identity (${state?.identity?.fullName}).`,
                        code: "ACCOUNT_NAME_MISMATCH",
                        step: "finance",
                    }, { status: 422 });
                }
            } catch (e: unknown) {
                const err = e instanceof Error ? e : new Error(String(e));
                logger.error("[ONBOARDING_COMPLETE] Paystack verification failed", { message: err.message });
                return NextResponse.json({
                    error: "Could not verify bank account details. Please check and try again.",
                    code: "BANK_VERIFICATION_FAILED",
                    step: "finance"
                }, { status: 422 });
            }
        }

        // Sync data to core tables
        await syncOnboardingData(storeId, state as any);

        // Update store status
        await prisma.store?.update({
            where: { id: storeId },
            data: {
                onboardingStatus: "COMPLETE",
                settings: {
                    ...(body.settings || {}),
                    onboardingCompletedAt: new Date().toISOString()
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("[ONBOARDING_COMPLETE] Failed to complete onboarding", { storeId, message: err.message });
        return NextResponse.json({ error: "Failed to complete onboarding" }, { status: 500 });
    }
});
