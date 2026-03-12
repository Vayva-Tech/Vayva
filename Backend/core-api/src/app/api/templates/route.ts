import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { TEMPLATE_REGISTRY } from "@/lib/templates/index";
import { logger } from "@/lib/logger";

const PLAN_HIERARCHY = {
  free: 0,
  growth: 1,
  pro: 2,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizePlan(plan: unknown): keyof typeof PLAN_HIERARCHY {
  const p = String(plan || "free").toLowerCase();
  if (p === "pro" || p === "business" || p === "enterprise") return "pro";
  if (p === "growth") return "growth";
  return "free";
}

function isLocked(storePlan: unknown, requiredPlan: unknown): boolean {
  const storeTier = PLAN_HIERARCHY[normalizePlan(storePlan)] ?? 0;
  const requiredTier = PLAN_HIERARCHY[normalizePlan(requiredPlan)] ?? 0;
  return storeTier < requiredTier;
}

const INDUSTRY_SLUGS = new Set([
  "retail",
  "fashion",
  "electronics",
  "beauty",
  "grocery",
  "food",
  "services",
  "digital",
  "events",
  "b2b",
  "real_estate",
  "automotive",
  "travel_hospitality",
  "blog_media",
  "creative_portfolio",
  "nonprofit",
  "education",
  "marketplace",
  "one_product",
  "nightlife",
]);

export const GET = withVayvaAPI(
  PERMISSIONS.STOREFRONT_VIEW,
  async (request, { storeId }) => {
    try {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { plan: true, industrySlug: true },
      });

      const templates = await prisma.templateManifest.findMany({
        where: { isArchived: false },
        orderBy: { createdAt: "desc" },
      });
      const storeIndustrySlug = store?.industrySlug
        ? String(store.industrySlug)
        : null;

      type TemplateRow = (typeof templates)[number];
      const registryById = isRecord(TEMPLATE_REGISTRY)
        ? (TEMPLATE_REGISTRY as Record<string, unknown>)
        : {};

      const formatted = templates.map((t: TemplateRow) => {
        const registry = registryById[t.id];
        const registryRecord = isRecord(registry) ? registry : undefined;

        const industrySet = new Set<string>();
        const registryIndustry = registryRecord?.industry;
        if (registryIndustry && INDUSTRY_SLUGS.has(String(registryIndustry))) {
          industrySet.add(String(registryIndustry));
        }

        const tags = Array.isArray(t.tags) ? t.tags : [];
        for (const tag of tags) {
          const slug = String(tag || "")
            .toLowerCase()
            .trim();
          if (INDUSTRY_SLUGS.has(slug)) industrySet.add(slug);
        }

        const industrySlugs = Array.from(industrySet);
        const requiredPlan = String(registryRecord?.requiredPlan || "free");
        const recommended = Boolean(
          storeIndustrySlug &&
          industrySlugs.includes(String(storeIndustrySlug)),
        );

        return {
          id: t.id,
          key: t.id,
          name: t.name,
          description: t.description,
          category: "Storefront",
          previewImageUrl: t.previewImageUrl,
          version: t.version,
          requiredPlan,
          isLocked: isLocked(store?.plan, requiredPlan),
          industrySlugs,
          isRecommended: recommended,
          configSchema: t.configSchema,
          supportedPages: t.supportedPages,
        };
      });
      return NextResponse.json(formatted, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    } catch (error: unknown) {
      logger.error("[TEMPLATES_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch templates" },
        { status: 500 },
      );
    }
  },
);
