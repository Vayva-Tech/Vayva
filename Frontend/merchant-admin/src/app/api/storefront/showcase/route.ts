import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

interface ShowcaseConfig {
  mode?: string;
  autoStrategy?: string;
  limit?: number;
  productIds?: string[];
}

interface SectionConfig {
  featured?: ShowcaseConfig;
  [key: string]: unknown;
}

export const GET = withVayvaAPI(PERMISSIONS.STOREFRONT_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const draft = await prisma.storefrontDraft?.findUnique({
            where: { storeId },
            select: { sectionConfig: true },
        });

        const sectionConfig = (draft?.sectionConfig as SectionConfig | null) ?? {};
        const showcaseConfig = sectionConfig.featured ?? {
            mode: "auto",
            autoStrategy: "newest",
            limit: 8,
            productIds: [],
        };

        const products = await prisma.product?.findMany({
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
            image: (p as any).productImages?.[0]?.url || "",
        }));

        return NextResponse.json({
            config: showcaseConfig,
            availableProducts: formattedProducts,
        }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("[STOREFRONT_SHOWCASE_GET] Failed to fetch showcase", { error: err.message });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});

export const POST = withVayvaAPI(PERMISSIONS.STOREFRONT_MANAGE, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const body = await req.json().catch(() => ({}));
        const { mode, autoStrategy, limit, productIds } = body;

        const draft = await prisma.storefrontDraft?.findUnique({
            where: { storeId },
            select: { sectionConfig: true },
        });

        const currentSectionConfig = (draft?.sectionConfig as SectionConfig | null) ?? {};
        
        const updatedSectionConfig: SectionConfig = {
            ...currentSectionConfig,
            featured: {
                mode: mode || currentSectionConfig.featured?.mode || "auto",
                autoStrategy: autoStrategy || currentSectionConfig.featured?.autoStrategy || "newest",
                limit: limit ?? currentSectionConfig.featured?.limit ?? 8,
                productIds: productIds || currentSectionConfig.featured?.productIds || [],
            },
        };

        await prisma.storefrontDraft?.update({
            where: { storeId },
            data: { sectionConfig: updatedSectionConfig as any },
        });

        return NextResponse.json({ success: true, config: updatedSectionConfig.featured });
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("[STOREFRONT_SHOWCASE_PATCH] Failed to update showcase", { error: err.message });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});
