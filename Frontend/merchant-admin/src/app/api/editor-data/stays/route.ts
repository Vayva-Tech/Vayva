import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const query = searchParams.get("query") || "";
      const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);

      // IMPORTANT: storefront availability API currently expects a Product ID (`productId=`).
      // So for the WebStudio selector we expose stay "id" as AccommodationProduct.productId.
      const stays =
        (await prisma.accommodationProduct?.findMany({
          where: {
            product: {
              storeId,
              ...(query && {
                OR: [
                  { title: { contains: query, mode: "insensitive" } },
                  { handle: { contains: query, mode: "insensitive" } },
                ],
              }),
            },
          },
          select: {
            productId: true,
            type: true,
            maxGuests: true,
            product: {
              select: {
                title: true,
                price: true,
                productImages: {
                  orderBy: { position: "asc" },
                  take: 1,
                  select: { url: true },
                },
                status: true,
              },
            },
          },
          orderBy: { product: { updatedAt: "desc" } },
          take: limit,
        })) || [];

      const formatted = stays.map((s) => ({
        id: s.productId,
        name: s.product.title,
        type: String(s.type),
        maxGuests: s.maxGuests,
        price: Number(s.product.price) || 0,
        image: s.product.productImages?.[0]?.url || null,
        isActive: s.product.status === "ACTIVE",
      }));

      return NextResponse.json(
        { success: true, data: formatted },
        { headers: { "Cache-Control": "no-store" } },
      );
    } catch (error) {
      logger.error("[EDITOR_DATA_STAYS_GET] Failed to fetch stays", { storeId, error });
      return NextResponse.json({ error: "Failed to fetch stays" }, { status: 500 });
    }
  },
);
