import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(PERMISSIONS.PRODUCTS_VIEW, async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const resolvedParams = await Promise.resolve(params);
  const { id } = resolvedParams;

        const stay = await prisma.product?.findFirst({
            where: {
                id,
                storeId,
                productType: "ACCOMMODATION",
            },
            include: {
                productImages: { orderBy: { position: "asc" } },
                accommodationProduct: true,
            },
        });

        if (!stay) {
            return NextResponse.json({ error: "Stay not found" }, { status: 404 });
        }

        return NextResponse.json({ stay }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
        const resolvedParams = await Promise.resolve(params);
        logger.error("[STAYS_ID_GET] Failed to fetch stay", { storeId, id: resolvedParams.id, error });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});

export const PATCH = withVayvaAPI(PERMISSIONS.PRODUCTS_MANAGE, async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const resolvedParams = await Promise.resolve(params);
  const { id } = resolvedParams;
        const body = await req.json().catch(() => ({}));
        const {
            title,
            description,
            price,
            status,
            type,
            maxGuests,
            bedCount,
            bathrooms,
            totalUnits,
            amenities,
        } = body;

        const existing = await prisma.product?.findFirst({
            where: {
                id,
                storeId,
                productType: "ACCOMMODATION",
            },
        });

        if (!existing) {
            return NextResponse.json({ error: "Stay not found" }, { status: 404 });
        }

        const stay = await prisma.product?.update({
            where: { id },
            data: {
                title: title !== undefined ? title : undefined,
                description: description !== undefined ? description : undefined,
                price: price !== undefined ? price : undefined,
                status: status !== undefined ? status : undefined,
                accommodationProduct: {
                    update: {
                        type: type !== undefined ? type : undefined,
                        maxGuests: maxGuests !== undefined ? maxGuests : undefined,
                        bedCount: bedCount !== undefined ? bedCount : undefined,
                        bathrooms: bathrooms !== undefined ? bathrooms : undefined,
                        totalUnits: totalUnits !== undefined ? totalUnits : undefined,
                        amenities: amenities !== undefined ? amenities : undefined,
                    },
                },
            },
            include: {
                accommodationProduct: true,
                productImages: true,
            },
        });

        return NextResponse.json({ stay });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
        const resolvedParams = await Promise.resolve(params);
        logger.error("[STAYS_ID_PATCH] Failed to update stay", { storeId, id: resolvedParams.id, error });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});

export const DELETE = withVayvaAPI(PERMISSIONS.PRODUCTS_MANAGE, async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const resolvedParams = await Promise.resolve(params);
  const { id } = resolvedParams;

        const existing = await prisma.product?.findFirst({
            where: {
                id,
                storeId,
                productType: "ACCOMMODATION",
            },
        });

        if (!existing) {
            return NextResponse.json({ error: "Stay not found" }, { status: 404 });
        }

        await prisma.product?.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
        const resolvedParams = await Promise.resolve(params);
        logger.error("[STAYS_ID_DELETE] Failed to delete stay", { storeId, id: resolvedParams.id, error });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});
