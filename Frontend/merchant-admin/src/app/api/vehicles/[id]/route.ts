import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

/**
 * GET /api/vehicles/[id]
 * Get a single vehicle
 */
export const GET = withVayvaAPI(PERMISSIONS.PRODUCTS_VIEW, async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const resolvedParams = await Promise.resolve(params);
  const { id } = resolvedParams;
        const vehicle = await prisma.product?.findFirst({
            where: {
                id,
                storeId,
                productType: "vehicle",
            },
            include: {
                productImages: true,
                productVariants: true,
            },
        });

        if (!vehicle) {
            return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
        }

        return NextResponse.json({ vehicle }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
        const resolvedParams = await Promise.resolve(params);
        logger.error("[VEHICLE_GET_BY_ID] Failed to fetch vehicle", { storeId, id: resolvedParams.id, error });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});

/**
 * PATCH /api/vehicles/[id]
 * Update a vehicle
 */
export const PATCH = withVayvaAPI(PERMISSIONS.PRODUCTS_MANAGE, async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const resolvedParams = await Promise.resolve(params);
  const { id } = resolvedParams;
        const body = await req.json().catch(() => ({}));
        
        // Verify ownership and existence
        const existing = await prisma.product?.findFirst({
            where: { id, storeId, productType: "vehicle" },
        });

        if (!existing) {
            return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
        }

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
            status,
        } = body;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const metadata: any = (existing.metadata as Record<string, unknown>) || {};
        const updated = await prisma.product?.update({
            where: { id },
            data: {
                title: `${metadata.year || ""} ${metadata.make || ""} ${metadata.model || ""}`.trim(),
                description: description !== undefined ? description : undefined,
                price: price !== undefined ? Number(price) : undefined,
                status: status !== undefined ? status : undefined,
                metadata: {
                    ...metadata,
                    make: make !== undefined ? make : undefined,
                    model: model !== undefined ? model : undefined,
                    year: year !== undefined ? year : undefined,
                    condition: condition !== undefined ? condition : undefined,
                    mileage: mileage !== undefined ? mileage : undefined,
                    fuelType: fuelType !== undefined ? fuelType : undefined,
                    transmission: transmission !== undefined ? transmission : undefined,
                },
            },
        });

        return NextResponse.json({ vehicle: updated });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
        const resolvedParams = await Promise.resolve(params);
        logger.error("[VEHICLE_PATCH] Failed to update vehicle", { storeId, id: resolvedParams.id, error });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});

/**
 * DELETE /api/vehicles/[id]
 * Delete a vehicle
 */
export const DELETE = withVayvaAPI(PERMISSIONS.PRODUCTS_MANAGE, async (req: NextRequest, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) => {
    try {
        const resolvedParams = await Promise.resolve(params);
  const { id } = resolvedParams;

        // Verify ownership and existence
        const existing = await prisma.product?.findFirst({
            where: { id, storeId, productType: "vehicle" },
        });

        if (!existing) {
            return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
        }

        await prisma.product?.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
        const resolvedParams = await Promise.resolve(params);
        logger.error("[VEHICLE_DELETE] Failed to delete vehicle", { storeId, id: resolvedParams.id, error });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});
