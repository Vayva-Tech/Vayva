import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { FlagService } from "@/lib/flags/flagService";
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
  async (req, { storeId, user: sessionUser }) => {
    try {
      const [user, store] = await Promise.all([
        prisma.user.findUnique({
          where: { id: sessionUser.id },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true,
          },
        }),
        prisma.store.findUnique({
          where: { id: storeId },
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            industrySlug: true,
            settings: true,
            plan: true,
            isLive: true,
            onboardingCompleted: true,
            onboardingLastStep: true,
          },
        }),
      ]);

      if (!store) {
        return NextResponse.json(
          apiError(ApiErrorCode.NOT_FOUND, "Store context not found"),
          { status: 404 },
        );
      }

      const storeSettings = getObject(store.settings);

      const dashboardPlanTier = resolveDashboardPlanTier(store.plan);
      const dashboardCosmeticVariant =
        typeof storeSettings?.dashboardCosmeticVariant === "string" &&
        storeSettings.dashboardCosmeticVariant.trim()
          ? storeSettings.dashboardCosmeticVariant.trim()
          : null;

      const firstName = user?.firstName || sessionUser.firstName || "Merchant";
      const lastName = user?.lastName || sessionUser.lastName || "";

      const socialsEnabled =
        process.env.NODE_ENV !== "production" ||
        (await FlagService.isEnabled("socials.enabled", {
          merchantId: store.id,
        }));
      const socialsInstagramEnabled =
        process.env.NODE_ENV !== "production" ||
        (await FlagService.isEnabled("socials.instagram.enabled", {
          merchantId: store.id,
        }));
      const transactionsEnabled =
        process.env.NODE_ENV !== "production" ||
        (await FlagService.isEnabled("transactions.enabled", {
          merchantId: store.id,
        }));
      const dashboardV2Enabled =
        process.env.NODE_ENV !== "production" ||
        (await FlagService.isEnabled("dashboard.v2.enabled", {
          merchantId: store.id,
        }));

      // Default KYC level, should be fetched from KYC service in production
      const kycLevel = "NONE";

      return NextResponse.json(
        {
          success: true,
          data: {
            user: {
              id: sessionUser.id,
              email: user?.email || sessionUser.email,
              firstName,
              lastName,
              phone: user?.phone || undefined,
              avatarUrl: user?.avatarUrl || undefined,
              emailVerified: true,
              phoneVerified: false,
              role: sessionUser.role,
              storeId: store.id,
              sessionVersion: sessionUser.sessionVersion,
              createdAt: new Date().toISOString(),
            },
            merchant: {
              merchantId: sessionUser.id,
              storeId: store.id,
              businessType: BusinessType.RETAIL,
              onboardingStatus: store.onboardingCompleted
                ? "COMPLETE"
                : "IN_PROGRESS",
              onboardingLastStep: store.onboardingLastStep || undefined,
              industrySlug: store.industrySlug || undefined,
              logoUrl: store.logoUrl || undefined,
              firstName,
              lastName,
              dashboardPlanTier,
              dashboardCosmeticVariant,
              enabledExtensionIds: [],
              externalManifests: [],
              onboardingCompleted: store.onboardingCompleted,
              kycLevel,

              features: {
                socials: {
                  enabled: socialsEnabled,
                  instagramEnabled: socialsInstagramEnabled,
                },
                transactions: {
                  enabled: transactionsEnabled,
                },
                dashboard: {
                  v2Enabled: dashboardV2Enabled,
                  planTier: dashboardPlanTier,
                  cosmeticVariant: dashboardCosmeticVariant,
                },
              },
            },
            store: {
              id: store.id,
              name: store.name,
              slug: store.slug,
              industrySlug: store.industrySlug || null,
              currency: getString(storeSettings.currency) || "NGN",
              themeConfig: storeSettings.themeConfig || undefined,
            },

            features: {
              socials: {
                enabled: socialsEnabled,
                instagramEnabled: socialsInstagramEnabled,
              },
              transactions: {
                enabled: transactionsEnabled,
              },
              dashboard: {
                v2Enabled: dashboardV2Enabled,
                planTier: dashboardPlanTier,
                cosmeticVariant: dashboardCosmeticVariant,
              },
            },
          },
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[AUTH_ME_GET]", error, { storeId });
      return NextResponse.json(
        apiError(ApiErrorCode.INTERNAL_SERVER_ERROR, "Internal Server Error"),
        { status: 500 },
      );
    }
  },
);
