import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const store = await prisma.store.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        settings: true,
        category: true,
        plan: true,
        isLive: true,
        isActive: true,
        // agent: {
        //   select: {
        //     enabled: true,
        //     businessHours: true,
        //   },
        // },
        deliverySettings: {
          select: {
            isEnabled: true,
            provider: true,
            pickupAddressLine1: true,
            pickupCity: true,
            pickupState: true,
            pickupPhone: true,
          },
        },
      },
    });
    if (!store || !store.isActive || !store.isLive) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }
    return NextResponse.json(store, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    logger.error("[STOREFRONT_STORE]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
