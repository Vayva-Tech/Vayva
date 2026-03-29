import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

interface ReadinessIssue {
  code: string;
  title: string;
  description: string;
  severity: "blocker" | "warning";
  actionUrl: string;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
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
  } catch (error) {
    handleApiError(error, { endpoint: "/merchant/readiness", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
