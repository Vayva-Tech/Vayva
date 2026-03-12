import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(PERMISSIONS.PRODUCTS_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
  try {
    const collections = await prisma.collection?.findMany({
      where: { storeId },
      include: {
        _count: {
          select: { collectionProducts: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    }) || [];

    // Format to match EditorCollection interface
    const formatted = collections.map((col) => ({
      id: col.id,
      name: col.title,
      slug: col.handle,
      productCount: col._count?.collectionProducts || 0,
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
    }, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    logger.error("[EDITOR_DATA_COLLECTIONS_GET] Failed to fetch collections", { storeId, error });
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
  }
});
