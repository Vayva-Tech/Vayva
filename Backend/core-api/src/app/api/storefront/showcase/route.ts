import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { Prisma, prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

type ShowcaseConfig = {
  mode: string;
  autoStrategy: string;
  limit: number;
  productIds: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function getNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function getStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value.filter((v): v is string => typeof v === "string");
  return items;
}

function toInputJsonValue(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === null) return undefined;
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean") return value;
  if (Array.isArray(value)) {
    const coerced = value
      .map((v) => toInputJsonValue(v))
      .filter((v): v is Prisma.InputJsonValue => v !== undefined);
    return coerced as Prisma.InputJsonValue;
  }
  if (isRecord(value)) {
    const obj: Record<string, Prisma.InputJsonValue> = {};
    for (const [k, v] of Object.entries(value)) {
      const coerced = toInputJsonValue(v);
      if (coerced !== undefined) obj[k] = coerced;
    }
    return obj as Prisma.InputJsonValue;
  }
  return undefined;
}

function getDefaultShowcaseConfig(): ShowcaseConfig {
  return {
    mode: "auto",
    autoStrategy: "newest",
    limit: 8,
    productIds: [],
  };
}

function getFeaturedConfig(sectionConfig: unknown): ShowcaseConfig {
  const defaults = getDefaultShowcaseConfig();
  if (!isRecord(sectionConfig)) return defaults;
  const featured = sectionConfig.featured;
  if (!isRecord(featured)) return defaults;

  return {
    mode: getString(featured.mode) ?? defaults.mode,
    autoStrategy: getString(featured.autoStrategy) ?? defaults.autoStrategy,
    limit: getNumber(featured.limit) ?? defaults.limit,
    productIds: getStringArray(featured.productIds) ?? defaults.productIds,
  };
}

export const GET = withVayvaAPI(
  PERMISSIONS.STOREFRONT_VIEW,
  async (req, { storeId }) => {
    try {
      const draft = await prisma.storefrontDraft.findUnique({
        where: { storeId },
        select: { sectionConfig: true },
      });

      const showcaseConfig = getFeaturedConfig(draft?.sectionConfig);

      const products = await prisma.product.findMany({
        where: { storeId, status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: 100,
        select: {
          id: true,
          title: true,
          price: true,
          productImages: {
            orderBy: { position: "asc" },
            take: 1,
            select: { url: true },
          },
        },
      });

      const formattedProducts = products.map((p) => ({
        id: p.id,
        name: p.title,
        price: Number(p.price),
        image: p.productImages?.[0]?.url || "",
      }));

      return NextResponse.json(
        {
          config: showcaseConfig,
          availableProducts: formattedProducts,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      // Error details are logged via getErrorMessage if needed, but not used here
      logger.error("[STOREFRONT_SHOWCASE_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Internal Server Error" },
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
      const body: Record<string, unknown> = isRecord(parsedBody)
        ? parsedBody
        : {};

      const mode = getString(body.mode);
      const autoStrategy = getString(body.autoStrategy);
      const limit = getNumber(body.limit);
      const productIds = getStringArray(body.productIds);

      const draft = await prisma.storefrontDraft.findUnique({
        where: { storeId },
        select: { sectionConfig: true },
      });

      const currentSectionConfig = isRecord(draft?.sectionConfig)
        ? draft?.sectionConfig
        : {};
      const currentFeatured = getFeaturedConfig(currentSectionConfig);

      const updatedFeatured: ShowcaseConfig = {
        mode: mode ?? currentFeatured.mode,
        autoStrategy: autoStrategy ?? currentFeatured.autoStrategy,
        limit: limit ?? currentFeatured.limit,
        productIds: productIds ?? currentFeatured.productIds,
      };

      const updatedSectionConfig: Record<string, unknown> = {
        ...currentSectionConfig,
        featured: updatedFeatured,
      };

      await prisma.storefrontDraft.update({
        where: { storeId },
        data: {
          sectionConfig: toInputJsonValue(
            updatedSectionConfig,
          ) as Prisma.InputJsonObject,
        },
      });

      return NextResponse.json({ success: true, config: updatedFeatured });
    } catch (error: unknown) {
      // Error details are logged via getErrorMessage if needed, but not used here
      logger.error("[STOREFRONT_SHOWCASE_POST]", error, { storeId });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
