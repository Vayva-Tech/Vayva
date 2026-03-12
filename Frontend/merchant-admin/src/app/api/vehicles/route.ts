import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma, type ProductStatus } from "@vayva/db";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(PERMISSIONS.PRODUCTS_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");

        const vehicles = await prisma.product?.findMany({
            where: {
                storeId,
                productType: "vehicle",
                ...(status && { status: status as ProductStatus }),
            },
            include: {
                productImages: { take: 1, orderBy: { position: "asc" } },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({
            vehicles: vehicles.map((v) => ({
                id: v.id,
                make: (v.metadata as { make?: string })?.make || "",
                model: (v.metadata as { model?: string })?.model || "",
                year: (v.metadata as { year?: string })?.year || "",
                price: Number(v.price),
                status: v.status,
                image: v.productImages[0]?.url || null,
                createdAt: v.createdAt,
            })),
            total: vehicles.length,
        }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    } catch (error) {
        logger.error("[VEHICLES_GET]", error instanceof Error ? error.message : String(error));
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});

export const POST = withVayvaAPI(PERMISSIONS.PRODUCTS_MANAGE, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const body = await req.json().catch(() => ({}));
        const {
            make,
            model,
            year,
            price,
            description,
            condition,
            mileage,
            fuelType,
            transmission,
            images,
        } = body;

        if (!make || !model || !price) {
            return NextResponse.json({ error: "Make, model and price are required" }, { status: 400 });
        }

        const handle = `${make}-${model}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");

        const vehicle = await prisma.product?.create({
            data: {
                storeId,
                title: `${year} ${make} ${model}`,
                description: description || "",
                price: Number(price),
                handle,
                productType: "vehicle",
                status: "ACTIVE",
                metadata: {
                    make,
                    model,
                    year,
                    condition,
                    mileage,
                    fuelType,
                    transmission,
                },
                productImages: images?.length ? {
                    create: images.map((url: string, i: number) => ({
                        url,
                        position: i,
                    })),
                } : undefined,
            },
        });

        return NextResponse.json({ vehicle }, { status: 201 });
    } catch (error) {
        logger.error("[VEHICLES_POST]", error instanceof Error ? error.message : String(error));
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});
