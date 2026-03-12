import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma, type Product, type ProductImage, type Prisma, type ProductStatus } from "@vayva/db";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(PERMISSIONS.PRODUCTS_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const type = searchParams.get("type");

        const where: Prisma.ProductWhereInput = {
            storeId,
            productType: "ACCOMMODATION",
        };
        if (status) where.status = status as ProductStatus;

        const stays = await prisma.product?.findMany({
            where,
            include: {
                productImages: { take: 1, orderBy: { position: "asc" } },
                accommodationProduct: true,
            },
            orderBy: { createdAt: "desc" },
        });

        let filtered = stays;
        if (type) {
            filtered = filtered.filter((s) =>
                (s.accommodationProduct as { type?: string } | null)?.type?.toLowerCase() === type.toLowerCase()
            );
        }

        return NextResponse.json({
            stays: filtered.map((s: Product & { productImages: ProductImage[]; accommodationProduct: { type?: string; maxGuests?: number; bedCount?: number; bathrooms?: number; totalUnits?: number; amenities?: unknown } | null }) => ({
                id: s.id,
                title: s.title,
                description: s.description,
                price: Number(s.price),
                status: s.status,
                image: s.productImages[0]?.url || null,
                type: s.accommodationProduct?.type,
                maxGuests: s.accommodationProduct?.maxGuests,
                bedCount: s.accommodationProduct?.bedCount,
                bathrooms: s.accommodationProduct?.bathrooms,
                totalUnits: s.accommodationProduct?.totalUnits,
                amenities: s.accommodationProduct?.amenities as string[] | undefined,
                createdAt: s.createdAt,
            })),
            total: filtered.length,
        }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    } catch (error) {
        logger.error("[STAYS_GET]", error instanceof Error ? error.message : String(error));
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});

export const POST = withVayvaAPI(PERMISSIONS.PRODUCTS_MANAGE, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const body = await req.json().catch(() => ({}));
        const {
            title,
            description,
            price,
            type,
            maxGuests,
            bedCount,
            bathrooms,
            totalUnits,
            amenities,
            images,
        } = body;

        if (!title || !price) {
            return NextResponse.json({ error: "Title and price are required" }, { status: 400 });
        }

        const handle = `${title}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");

        const stay = await prisma.product?.create({
            data: {
                storeId,
                title,
                description: description || "",
                price,
                handle,
                status: "ACTIVE",
                productType: "ACCOMMODATION",
                accommodationProduct: {
                    create: {
                        type: type || "ROOM",
                        maxGuests: maxGuests || 2,
                        bedCount: bedCount || 1,
                        bathrooms: bathrooms || 1,
                        totalUnits: totalUnits || 1,
                        amenities: amenities || [],
                    },
                },
                productImages: images?.length
                    ? {
                          create: images.map((url: string, i: number) => ({
                              url,
                              position: i,
                          })),
                      }
                    : undefined,
            },
            include: {
                accommodationProduct: true,
                productImages: true,
            },
        });

        return NextResponse.json({ stay }, { status: 201 });
    } catch (error) {
        logger.error("[STAYS_POST]", error instanceof Error ? error.message : String(error));
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});
