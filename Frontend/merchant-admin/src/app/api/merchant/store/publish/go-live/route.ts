import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import type { Store, MerchantPolicy } from "@vayva/db";

interface OnboardingData {
  kyc?: { ninVerified?: boolean };
}

interface ReadinessInput {
  store: Store | null;
  hasStorefrontPublished: boolean;
  policies: Array<{ type: string; status: string }>;
  kycCompleted: boolean;
}

function computeReadiness(input: ReadinessInput) {
  const issues: Array<{ code: string; title: string; severity: "blocker" | "warning"; actionUrl?: string }> = [];

  if (!input.store?.isActive) {
    issues.push({
      code: "STORE_SUSPENDED",
      title: "Store is suspended",
      severity: "blocker",
    });
  }

  if (!input.store?.onboardingCompleted) {
    issues.push({
      code: "ONBOARDING_INCOMPLETE",
      title: "Complete onboarding",
      severity: "blocker",
      actionUrl: "/onboarding",
    });
  }

  if (!input.kycCompleted) {
    issues.push({
      code: "KYC_NOT_COMPLETED",
      title: "Complete KYC verification (NIN required)",
      severity: "blocker",
      actionUrl: "/onboarding",
    });
  }

  if (!input.hasStorefrontPublished) {
    issues.push({
      code: "STOREFRONT_NOT_PUBLISHED",
      title: "Publish your storefront",
      severity: "blocker",
      actionUrl: "/dashboard/control-center",
    });
  }

  const requiredPolicyTypes = ["TERMS", "PRIVACY", "RETURNS", "REFUNDS", "SHIPPING_DELIVERY"];
  const policyStatusByType = new Map(input.policies?.map((p) => [p.type, (p as any).status]));
  const missingOrUnpublished = requiredPolicyTypes.filter((t) => policyStatusByType.get(t) !== "PUBLISHED");

  if (missingOrUnpublished.length > 0) {
    issues.push({
      code: "POLICIES_NOT_PUBLISHED",
      title: "Publish required store policies",
      severity: "blocker",
      actionUrl: "/dashboard/settings/store-policies",
    });
  }

  const rawPlan = String(input.store?.plan || "free");
  const plan = rawPlan.toLowerCase();
  const isPaid = ["growth", "pro", "business", "enterprise"].includes(plan);
  if (!isPaid) {
    issues.push({
      code: "BILLING_REQUIRED",
      title: "Choose a Growth or Pro plan to go live",
      severity: "blocker",
      actionUrl: "/dashboard/settings/billing",
    });
  }

  const blockers = issues.filter((i) => i.severity === "blocker");

  return {
    level: blockers.length === 0 ? "ready" : "blocked",
    issues,
  };
}

export const POST = withVayvaAPI(PERMISSIONS.STOREFRONT_MANAGE, async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string } }) => {
  const store = await prisma.store?.findUnique({
    where: { id: storeId },
    select: { id: true, isLive: true, isActive: true, onboardingCompleted: true, plan: true, kycStatus: true },
  });

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const [storefrontPublished, policies] = await Promise.all([
    prisma.storefrontPublished?.findUnique({ where: { storeId } }),
    prisma.merchantPolicy?.findMany({
      where: { storeId },
      select: { type: true, status: true },
    }),
  ]);

  // Check if KYC is completed (manual approval)
  const kycCompleted = store.kycStatus === "VERIFIED";

  const readiness = computeReadiness({
    store: store as any,
    hasStorefrontPublished: Boolean(storefrontPublished),
    policies: policies.map((p: any) => ({ type: String(p.type), status: String((p as any).status) })),
    kycCompleted,
  });

  if (readiness.level !== "ready") {
    return NextResponse.json({
      message: "Store is not ready to go live",
      readiness,
    }, { status: 409 });
  }

  await prisma.store?.update({
    where: { id: storeId },
    data: { isLive: true },
  });

  return NextResponse.json({ success: true });
});
