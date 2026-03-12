import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

interface SectionConfig {
  featured?: {
    mode?: string;
    autoStrategy?: string;
    limit?: number;
    productIds?: string[];
  };
  [key: string]: unknown;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const store = await prisma.store.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Try published first, fallback to draft
    const published = await prisma.storefront.findUnique({
      where: { storeId: store.id },
      select: { config: true },
    });

    let sectionConfig: SectionConfig = {};
    if (published?.config) {
      sectionConfig = published.config as SectionConfig;
    } else {
      const draft = await prisma.storefrontDraft.findUnique({
        where: { storeId: store.id },
        select: { sectionConfig: true },
      });
      sectionConfig = (draft?.sectionConfig as SectionConfig | null) ?? {};
    }

    const featured = sectionConfig.featured ?? {
      mode: "auto",
      autoStrategy: "newest",
      limit: 8,
      productIds: [],
    };

    return NextResponse.json({ featured });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("[STOREFRONT_FEATURED_GET] Failed to fetch featured", { error: err.message });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
