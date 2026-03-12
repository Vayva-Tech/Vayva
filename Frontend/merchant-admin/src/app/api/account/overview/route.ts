import { urls } from "@vayva/shared";
import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma, type Store, type BankBeneficiary, type SecuritySetting, type DomainMapping, type AuditLog, type KycRecord } from "@vayva/db";
import { ACCOUNT_ROUTES } from "@/config/routes";
import { logger } from "@/lib/logger";

interface StoreSettings {
  paystack?: { connected?: boolean };
  delivery?: { connected?: boolean };
  api?: { active?: boolean };
}

export const GET = withVayvaAPI(PERMISSIONS.ACCOUNT_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        // Fetch all relevant account data in parallel for performance
        const [store, bankAccount, security, domain, recentLogs, kyc] = await Promise.all([
            prisma.store?.findUnique({
                where: { id: storeId },
                select: {
                    name: true,
                    slug: true,
                    category: true,
                    plan: true,
                    isLive: true,
                    onboardingCompleted: true,
                    settings: true,
                },
            }),
            prisma.bankBeneficiary?.findFirst({
                where: { storeId, isDefault: true },
            }),
            prisma.securitySetting?.findUnique({
                where: { storeId },
            }),
            prisma.domainMapping?.findFirst({
                where: { storeId },
            }),
            prisma.auditLog?.findMany({
                where: { targetStoreId: storeId },
                take: 10,
                orderBy: { createdAt: "desc" },
            }),
            prisma.kycRecord?.findUnique({
                where: { storeId },
            }),
        ]);
        if (!store) {
            return NextResponse.json({ error: "Store context not found" }, { status: 404 });
        }
        const lastAudit = recentLogs[0];
        const storeSettings = (store.settings as StoreSettings | null) ?? {};
        
        const data = {
            profile: {
                name: store.name || "Unset",
                category: store.category || "General",
                plan: store.plan || "GROWTH",
                isLive: store.isLive || false,
                onboardingCompleted: store.onboardingCompleted || false,
            },
            subscription: {
                plan: store.plan || "GROWTH",
                status: "active",
                renewalDate: null,
                canUpgrade: true,
            },
            kyc: {
                status: kyc?.status || "NOT_STARTED",
                lastAttempt: kyc?.updatedAt || null,
                rejectionReason: null,
                missingDocs: [],
                canWithdraw: kyc?.status === "VERIFIED",
            },
            payouts: {
                bankConnected: !!bankAccount,
                payoutsEnabled: !!bankAccount && kyc?.status === "VERIFIED",
                maskedAccount: bankAccount
                    ? `******${bankAccount?.accountNumber?.slice(-4)}`
                    : null,
                bankName: bankAccount?.bankName || null,
            },
            domains: {
                customDomain: domain?.domain || null,
                subdomain: `${store.slug || "store"}.${urls.storefrontRoot()}`,
                status: domain?.status || "PENDING",
                sslEnabled: domain?.status === "active",
            },
            integrations: {
                whatsapp: "DISCONNECTED",
                payments: storeSettings.paystack?.connected
                    ? "CONNECTED"
                    : "DISCONNECTED",
                delivery: storeSettings.delivery?.connected
                    ? "CONNECTED"
                    : "DISCONNECTED",
                lastWebhook: lastAudit?.createdAt
                    ? new Date(lastAudit.createdAt).toISOString()
                    : new Date().toISOString(),
            },
            security: {
                mfaEnabled: security?.twoFactorRequired || false,
                recentLogins: recentLogs.filter((l: AuditLog) => l.action?.toLowerCase().includes("login")).length,
                apiKeyStatus: storeSettings.api?.active ? "ACTIVE" : "INACTIVE",
            },
            alerts: buildAlerts(store, bankAccount, kyc),
        };
        return NextResponse.json(data, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    }
    catch (error) {
        logger.error("[ACCOUNT_OVERVIEW_GET] Failed to fetch account overview", { storeId, error });
        return NextResponse.json({ error: "Failed to fetch account overview" }, { status: 500 });
    }
});

function buildAlerts(store: { onboardingCompleted?: boolean | null } | null, bankAccount: BankBeneficiary | null, kyc: KycRecord | null) {
    const alerts: Array<{ id: string; severity: string; message: string; action: string }> = [];
    if (!store?.onboardingCompleted) {
        alerts.push({
            id: "onboarding",
            severity: "warning",
            message: "Onboarding Incomplete. Finish setting up your store to go live.",
            action: ACCOUNT_ROUTES.ONBOARDING,
        });
    }
    if (!bankAccount) {
        alerts.push({
            id: "payouts",
            severity: "error",
            message: "Payouts Disabled. Add a bank account to receive your earnings.",
            action: "Update Payouts",
        });
    }
    if (!kyc || kyc.status !== "VERIFIED") {
        alerts.push({
            id: "kyc",
            severity: "info",
            message: "Identity Verification. Verify your identity to increase withdrawal limits.",
            action: "Verify Now",
        });
    }
    return alerts;
}
// End of file
