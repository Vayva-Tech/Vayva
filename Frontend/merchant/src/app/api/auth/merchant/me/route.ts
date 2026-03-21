// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiError, ApiErrorCode, BusinessType } from "@vayva/shared";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

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

export async function GET(request: NextRequest) {
  try {
    // Get session from cookies or headers
    const authHeader = request.headers.get("authorization");
    const sessionId = request.cookies.get("session")?.value;

    if (!authHeader && !sessionId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { 
          status: 401,
          headers: { "Cache-Control": "no-store" }
        }
      );
    }

    // Mock session user - replace with real auth when available
    const sessionUser = {
      id: "user_" + (sessionId || "anonymous"),
      email: "merchant@example.com",
      firstName: "Merchant",
      lastName: "User",
      role: "owner",
    };

    // Default store ID
    const storeId = "store_default";

    // Call backend API to get user/store data and feature flags
    const result = await apiJson<{
      success: boolean;
      user?: { email?: string; firstName?: string; lastName?: string; phone?: string; avatarUrl?: string };
      store?: { name?: string; slug?: string; industrySlug?: string; currency?: string; themeConfig?: any; onboardingCompleted?: boolean; onboardingLastStep?: string };
      features?: { dashboard?: { planTier?: string; cosmeticVariant?: string } };
      error?: string;
    }>(
      `${process.env.BACKEND_API_URL}/api/auth/merchant/me?storeId=${encodeURIComponent(storeId)}`,
      {
        headers: {
          "Content-Type": "application/json",
          "x-user-id": sessionUser.id,
          "x-user-email": sessionUser.email,
        },
      }
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: sessionUser.id,
            email: result.user?.email || sessionUser.email,
            firstName: result.user?.firstName || sessionUser.firstName || "Merchant",
            lastName: result.user?.lastName || sessionUser.lastName || "",
            phone: result.user?.phone || undefined,
            avatarUrl: result.user?.avatarUrl || undefined,
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
            onboardingStatus: result.store?.onboardingCompleted ? "COMPLETE" : "IN_PROGRESS",
            onboardingLastStep: result.store?.onboardingLastStep || undefined,
            industrySlug: result.store?.industrySlug || undefined,
            logoUrl: result.store?.logoUrl || undefined,
            firstName: result.user?.firstName || sessionUser.firstName || "Merchant",
            lastName: result.user?.lastName || sessionUser.lastName || "",
            dashboardPlanTier: resolveDashboardPlanTier(result.features?.dashboard?.planTier),
            dashboardCosmeticVariant: result.features?.dashboard?.cosmeticVariant || null,
            enabledExtensionIds: [],
            externalManifests: [],
            onboardingCompleted: result.store?.onboardingCompleted || false,
            features: result.features || {},
          },
          store: {
            id: storeId,
            name: result.store?.name || "",
            slug: result.store?.slug || "",
            industrySlug: result.store?.industrySlug || null,
            currency: result.store?.currency || "NGN",
            themeConfig: result.store?.themeConfig || undefined,
          },
          features: result.features || {},
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/auth/merchant/me',
      operation: 'GET_MERCHANT_PROFILE',
    });
    return NextResponse.json(
      { error: 'Failed to fetch merchant profile' },
      { status: 500 }
    );
  }
}
