import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function POST(req: any, { params }: any) {
    try {
        const { slug } = await params;
        const body = await req.json();
        const { raffleId, email, userId } = body;
        if (!raffleId || !email) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        const store = await prisma.store.findFirst({
            where: { slug },
            select: { id: true },
        });
        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }
        const raffleDelegate = prisma.raffleEntry;
        if (!raffleDelegate) {
            return NextResponse.json({ error: "Raffle system not initialized" }, { status: 503 });
        }
        // Check existing entry
        const existing = await raffleDelegate.findUnique({
            where: {
                raffleId_customerEmail: {
                    raffleId,
                    customerEmail: email
                }
            }
        });
        if (existing) {
            return NextResponse.json({ error: "Already entered" }, { status: 409 });
        }
        const entry = await raffleDelegate.create({
            data: {
                storeId: store.id,
                raffleId,
                customerEmail: email,
                userId: userId || null,
                status: "PENDING"
            }
        });
        return NextResponse.json({ success: true, entryId: entry.id });
    }
    catch (error) {
        const { slug } = await params;
        logger.error("[RAFFLE_ENTER_POST] Failed to enter raffle", { storeSlug: slug, error });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
