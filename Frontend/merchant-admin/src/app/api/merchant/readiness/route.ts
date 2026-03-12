import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

type ReadinessIssue = {
    code: string;
    title: string;
    description: string;
    severity: "blocker" | "warning";
    actionUrl?: string;
};

export const GET = withVayvaAPI(PERMISSIONS.SETTINGS_VIEW, async (_req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const [store, productCount, defaultBank, domain] = await Promise.all([
            prisma.store?.findUnique({
                where: { id: storeId },
                select: { onboardingCompleted: true, kycStatus: true },
            }),
            prisma.product?.count({ where: { storeId } }),
            prisma.bankBeneficiary?.findFirst({ where: { storeId, isDefault: true }, select: { id: true } }),
            prisma.domainMapping?.findFirst({ where: { storeId }, select: { id: true } }),
        ]);

        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        const issues: ReadinessIssue[] = [];

        if (!store.onboardingCompleted) {
            issues.push({
                code: "onboarding_incomplete",
                title: "Complete onboarding",
                description: "Finish onboarding steps to unlock all features.",
                severity: "blocker",
                actionUrl: "/onboarding",
            });
        }

        if (productCount <= 0) {
            issues.push({
                code: "no_products",
                title: "Add products",
                description: "Add at least one product so customers can buy from your store.",
                severity: "blocker",
                actionUrl: "/dashboard/products",
            });
        }

        if (!defaultBank) {
            issues.push({
                code: "no_bank_account",
                title: "Add a bank account",
                description: "Add a payout bank account to receive withdrawals.",
                severity: "blocker",
                actionUrl: "/dashboard/finance",
            });
        }

        if (String(store.kycStatus || "").toUpperCase() !== "VERIFIED") {
            issues.push({
                code: "kyc_not_verified",
                title: "Complete KYC",
                description: "Verify your identity to enable payouts and go live.",
                severity: "blocker",
                actionUrl: "/dashboard/settings/kyc",
            });
        }

        if (!domain) {
            issues.push({
                code: "no_domain",
                title: "Connect a domain",
                description: "Add a custom domain so customers can find your storefront.",
                severity: "warning",
                actionUrl: "/dashboard/domains",
            });
        }

        const hasBlockers = issues.some((i) => i.severity === "blocker");

        return NextResponse.json({
            level: hasBlockers ? "not_ready" : "ready",
            issues,
        }, {
            headers: { "Cache-Control": "no-store" },
        });
    } catch (error: unknown) {
        logger.error("[MERCHANT_READINESS_GET]", error);
        return NextResponse.json({ error: "Failed to load readiness" }, { status: 500 });
    }
});
