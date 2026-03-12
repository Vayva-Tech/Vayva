import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma, Prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

type PolicyMap = {
  refundPolicy?: string;
  shippingPolicy?: string;
  termsOfService?: string;
  privacyPolicy?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getSettingsObject(settings: unknown): Record<string, unknown> {
  return isRecord(settings) ? settings : {};
}

function getPolicyMap(value: unknown): PolicyMap {
  if (!isRecord(value)) return {};

  const policy: PolicyMap = {};
  if (typeof value.refundPolicy === "string")
    policy.refundPolicy = value.refundPolicy;
  if (typeof value.shippingPolicy === "string")
    policy.shippingPolicy = value.shippingPolicy;
  if (typeof value.termsOfService === "string")
    policy.termsOfService = value.termsOfService;
  if (typeof value.privacyPolicy === "string")
    policy.privacyPolicy = value.privacyPolicy;
  return policy;
}

function getDefaultPolicies(): Required<PolicyMap> {
  return {
    refundPolicy: "",
    shippingPolicy: "",
    termsOfService: "",
    privacyPolicy: "",
  };
}

export const GET = withVayvaAPI(
  PERMISSIONS.STOREFRONT_VIEW,
  async (_req, { storeId }) => {
    try {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { settings: true },
      });
      const settings = getSettingsObject(store?.settings);
      const policies = {
        ...getDefaultPolicies(),
        ...getPolicyMap(settings.policies),
      };
      return NextResponse.json(policies, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    } catch (error: unknown) {
      logger.error("[STORE_POLICIES_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch policies" },
        { status: 500 },
      );
    }
  },
);

export const POST = withVayvaAPI(
  PERMISSIONS.STOREFRONT_MANAGE,
  async (req, { storeId }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};

      // Fetch current settings to merge
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { settings: true },
      });
      const currentSettings = getSettingsObject(store?.settings);

      const updatedPolicies = {
        ...getDefaultPolicies(),
        ...getPolicyMap(currentSettings.policies),
        ...getPolicyMap(body),
      };
      const updatedSettings = {
        ...currentSettings,
        policies: updatedPolicies,
      };
      await prisma.store.update({
        where: { id: storeId },
        data: { settings: updatedSettings as Prisma.InputJsonValue },
      });
      return NextResponse.json(updatedPolicies);
    } catch (error: unknown) {
      logger.error("[STORE_POLICIES_POST]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to update policies" },
        { status: 500 },
      );
    }
  },
);
