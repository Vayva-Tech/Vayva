import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { getTenantFromHost } from "@/lib/tenant";
import { withStorefrontAPI } from "@/lib/api-handler";
import { standardHeaders, logger, BaseError } from "@vayva/shared";

function getRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

export const GET = withStorefrontAPI(async (request: any, ctx: any) => {
  const { requestId } = ctx;
  const { slug } = ctx.params;

  const t = await getTenantFromHost(request.headers.get("host") || undefined);
  if (!t.ok) {
    return NextResponse.json(
      { error: "Store not found", requestId },
      { status: 404 },
    );
  }

  try {
    const store = await prisma.store.findUnique({
      where: { slug: t.slug },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        settings: true,
        plan: true,
        isLive: true,
        isActive: true,
      },
    });

    if (!store || !store.isActive || !store.isLive) {
      return NextResponse.json(
        { error: "Store not found", requestId },
        { status: 404 },
      );
    }

    // Public API only serves published storefront config
    let activeConfig: {
      theme: unknown;
      sections: unknown;
      order: unknown[];
      templateId: string | null;
    } | null = null;

    const published = await prisma.storefrontPublished.findUnique({
      where: { storeId: store.id },
    });
    if (published) {
      const publishedRec = getRecord(published);
      const sectionOrder =
        publishedRec && Array.isArray(publishedRec.sectionOrder)
          ? (publishedRec.sectionOrder as unknown[])
          : [];
      activeConfig = {
        theme: published.themeConfig,
        sections: published.sectionConfig,
        order: sectionOrder,
        templateId: published.activeTemplateId,
      };
    }

    // Transform to PublicStore format
    const settingsRec = getRecord(store.settings) ?? {};
    const themeFromSettings = getRecord(settingsRec.theme) ?? {
      templateId: "vayva-standard",
    };

    const publicStore = {
      id: store.id,
      name: store.name,
      slug: store.slug,
      logo: store.logoUrl,
      theme: activeConfig?.theme || themeFromSettings,
      plan: store.plan,
      isLive: store.isLive,
    };

    return NextResponse.json(publicStore, {
      headers: standardHeaders(requestId),
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    if (error instanceof BaseError) throw error;
    logger.error("Storefront API Error", {
      requestId,
      slug,
      error: error instanceof Error ? error.message : String(error),
      app: "storefront",
    });
    return NextResponse.json(
      { error: "Failed to fetch store", requestId },
      { status: 500, headers: standardHeaders(requestId) },
    );
  }
});
