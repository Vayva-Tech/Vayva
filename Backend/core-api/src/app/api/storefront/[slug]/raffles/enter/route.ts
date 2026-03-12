import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const parsedBody: unknown = await req.json().catch(() => ({}));
    const body = isRecord(parsedBody) ? parsedBody : {};
    const raffleId = getString(body.raffleId);
    const email = getString(body.email);
    const userId = getString(body.userId);
    if (!raffleId || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }
    const store = await prisma.store.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }
    const raffleDelegate = prisma.raffleEntry;
    if (!raffleDelegate) {
      return NextResponse.json(
        { error: "Raffle system not initialized" },
        { status: 503 },
      );
    }
    // Check existing entry
    const existing = await raffleDelegate.findUnique({
      where: {
        raffleId_customerEmail: {
          raffleId,
          customerEmail: email,
        },
      },
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
        status: "PENDING",
      },
    });
    return NextResponse.json({ success: true, entryId: entry.id });
  } catch (error) {
    logger.error("[STOREFRONT_RAFFLE_ENTER]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
