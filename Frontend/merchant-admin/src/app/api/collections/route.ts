import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 50;

export const GET = withVayvaAPI(PERMISSIONS.PRODUCTS_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = Math.min(
            parseInt(searchParams.get("limit") || String(DEFAULT_PAGE_SIZE), 10),
            MAX_PAGE_SIZE
        );
        const skip = (page - 1) * limit;

        const [collections, total] = await Promise.all([
            prisma.collection?.findMany({
                where: { storeId },
                include: {
                    _count: {
                        select: { collectionProducts: true },
                    },
                },
                orderBy: { updatedAt: "desc" },
                take: limit,
                skip,
            }),
            prisma.collection?.count({ where: { storeId } })
        ]);

        const formatted = collections.map((col) => ({
            id: col.id,
            name: col.title,
            handle: col.handle,
            count: col._count?.collectionProducts,
            visibility: "Public",
            updated: col.updatedAt?.toISOString(),
        }));

        return NextResponse.json({
            success: true,
            data: formatted,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            }
        }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    }
    catch (error) {
        logger.error("[COLLECTIONS_GET] Failed to fetch collections", { storeId, error });
        return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
    }
});

export const POST = withVayvaAPI(PERMISSIONS.PRODUCTS_EDIT, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const body = await req.json();
        const { title, handle, description } = body;
        if (!title || !handle) {
            return NextResponse.json({ error: "Title and handle are required" }, { status: 400 });
        }
        const existing = await prisma.collection?.findUnique({
            where: { storeId_handle: { storeId, handle } },
        });
        if (existing) {
            return NextResponse.json({ error: "A collection with this handle already exists in your store." }, { status: 409 });
        }
        const collection = await prisma.collection?.create({
            data: {
                storeId,
                title,
                handle: handle.toLowerCase().replace(/\s+/g, "-"),
                description,
            },
        });
        return NextResponse.json({
            success: true,
            data: collection,
        });
    }
    catch (error) {
        logger.error("[COLLECTIONS_POST] Failed to create collection", { storeId, error });
        return NextResponse.json({ error: "Failed to create collection" }, { status: 500 });
    }
});
