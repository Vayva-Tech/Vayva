import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(PERMISSIONS.ORDERS_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const viewings = await prisma.booking?.findMany({
            where: {
                storeId,
                service: {
                    productType: "SERVICE",
                    metadata: {
                        path: ["type"],
                        equals: "TOUR",
                    },
                },
            },
            include: {
                customer: {
                    select: { firstName: true, lastName: true, email: true, phone: true },
                },
                service: true,
            },
            orderBy: { startsAt: "desc" },
        });

        return NextResponse.json({ data: viewings }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
        logger.error("[PROPERTIES_VIEWINGS_GET] Failed to fetch viewings", { storeId, error });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});

export const POST = withVayvaAPI(PERMISSIONS.ORDERS_MANAGE, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const body = await req.json().catch(() => ({}));
        const { propertyId, customerId, date, time, notes } = body;

        if (!propertyId || !date) {
            return NextResponse.json({ error: "Property and date required" }, { status: 400 });
        }

        const startsAt = new Date(`${date}T${time || "10:00"}:00`);
        const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000); // 1 hour

        const viewing = await prisma.booking?.create({
            data: {
                storeId,
                serviceId: propertyId,
                customerId: customerId || null,
                startsAt,
                endsAt,
                status: "PENDING",
                notes: notes || "",
                metadata: {
                    type: "TOUR",
                },
            },
        });

        return NextResponse.json({ success: true, data: viewing }, { status: 201 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
        logger.error("[PROPERTIES_VIEWINGS_POST] Failed to create viewing", { storeId, error });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});
