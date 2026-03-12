import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiError, ApiErrorCode, BusinessType } from "@vayva/shared";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getObject(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function resolveDashboardPlanTier(
  rawPlan: unknown,
): "basic" | "standard" | "advanced" {
  const v = String(rawPlan || "")
    .trim()
    .toLowerCase();

  if (v === "pro" || v === "business" || v === "enterprise") return "advanced";
  if (v === "growth") return "standard";

  return "basic";
}

export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId, user: sessionUser }: { storeId: string; user: { id: string; email: string; firstName: string | null; lastName: string | null; role: string; storeId: string; storeName: string } }) => {
    try {
      // Forward to Backend API to get user/store data and feature flags
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/auth/merchant/me?storeId=${encodeURIComponent(storeId)}`,
        {
          headers: {
            "Content-Type": "application/json",
            "x-user-id": sessionUser.id,
            "x-user-email": sessionUser.email,
          },
        }
      );

      if (!backendResponse.ok) {
        const errorData = await backendResponse.json().catch(() => ({ error: "Failed to fetch user data" }));
        return NextResponse.json(
          apiError(ApiErrorCode.INTERNAL_SERVER_ERROR, errorData.error || "Failed to fetch user data"),
          { status: backendResponse.status },
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json(
        {
          success: true,
          data: {
            user: {
              id: sessionUser.id,
              email: data.user?.email || sessionUser.email,
              firstName: data.user?.firstName || sessionUser.firstName || "Merchant",
              lastName: data.user?.lastName || sessionUser.lastName || "",
              phone: data.user?.phone || undefined,
              avatarUrl: data.user?.avatarUrl || undefined,
              emailVerified: true,
              phoneVerified: false,
              role: sessionUser.role,
              storeId: storeId,
              createdAt: new Date().toISOString(),
            },
            merchant: {
              merchantId: sessionUser.id,
              storeId: storeId,
              businessType: BusinessType.RETAIL,
              onboardingStatus: data.store?.onboardingCompleted ? "COMPLETE" : "IN_PROGRESS",
              onboardingLastStep: data.store?.onboardingLastStep || undefined,
              industrySlug: data.store?.industrySlug || undefined,
              logoUrl: data.store?.logoUrl || undefined,
              firstName: data.user?.firstName || sessionUser.firstName || "Merchant",
              lastName: data.user?.lastName || sessionUser.lastName || "",
              dashboardPlanTier: data.features?.dashboard?.planTier || "basic",
              dashboardCosmeticVariant: data.features?.dashboard?.cosmeticVariant || null,
              enabledExtensionIds: [],
              externalManifests: [],
              onboardingCompleted: data.store?.onboardingCompleted || false,
              features: data.features || {},
            },
            store: {
              id: storeId,
              name: data.store?.name || "",
              slug: data.store?.slug || "",
              industrySlug: data.store?.industrySlug || null,
              currency: data.store?.currency || "NGN",
              themeConfig: data.store?.themeConfig || undefined,
            },
            features: data.features || {},
          },
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[AUTH_ME_GET] Failed to fetch user data", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        apiError(ApiErrorCode.INTERNAL_SERVER_ERROR, "Internal Server Error"),
        { status: 500 },
      );
    }
  },
);
