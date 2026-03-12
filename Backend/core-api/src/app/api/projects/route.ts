import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";

export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (req, { storeId }) => {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "50", 10), 1),
      100,
    );

    const projects = await prisma.product.findMany({
      where: {
        storeId,
        productType: "PROJECT",
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        productImages: { orderBy: { position: "asc" } },
      },
    });

    return NextResponse.json(
      { projects },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  },
);
