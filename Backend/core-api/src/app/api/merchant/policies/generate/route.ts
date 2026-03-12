import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { PolicyType, prisma } from "@vayva/db";
import { generateDefaultPolicies } from "@vayva/compliance";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function parsePolicyType(value: string): PolicyType | null {
  const normalized = value.toUpperCase().replace(/-/g, "_");
  const allowed = Object.values(PolicyType) as string[];
  return allowed.includes(normalized) ? (normalized as PolicyType) : null;
}

export const POST = withVayvaAPI(
  PERMISSIONS.STOREFRONT_MANAGE,
  async (req, { storeId, user }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const { type } = body;
      const policyType = getString(type);
      if (!policyType) {
        return NextResponse.json(
          { error: "policy type is required" },
          { status: 400 },
        );
      }

      const resolvedType = parsePolicyType(policyType);
      if (!resolvedType) {
        return NextResponse.json(
          { error: "Invalid policy type" },
          { status: 400 },
        );
      }

      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { name: true, slug: true, settings: true },
      });
      if (!store) {
        return NextResponse.json({ error: "Store not found" }, { status: 404 });
      }
      // Generate default policies
      const settings = isRecord(store.settings) ? store.settings : {};
      const policies = generateDefaultPolicies({
        storeName: store.name,
        storeSlug: store.slug,
        merchantSupportWhatsApp: getString(settings.supportWhatsApp),
        supportEmail: getString(settings.supportEmail),
      });

      // Find the specific policy requested
      const targetPolicy = policies.find(
        (p) => p.type.toUpperCase().replace(/-/g, "_") === resolvedType,
      );
      if (!targetPolicy) {
        return NextResponse.json(
          { error: "Policy not found in defaults" },
          { status: 404 },
        );
      }

      const created = await prisma.merchantPolicy.upsert({
        where: {
          storeId_type: {
            storeId,
            type: resolvedType,
          },
        },
        create: {
          storeId,
          merchantId: user.id,
          storeSlug: store.slug,
          type: resolvedType,
          title: targetPolicy.title,
          contentMd: targetPolicy.contentMd,
          status: "DRAFT",
        },
        update: {
          title: targetPolicy.title,
          contentMd: targetPolicy.contentMd,
        },
      });

      return NextResponse.json({ policy: created });
    } catch (error: unknown) {
      logger.error("[POLICIES_GENERATE_POST]", error, { storeId });
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  },
);
