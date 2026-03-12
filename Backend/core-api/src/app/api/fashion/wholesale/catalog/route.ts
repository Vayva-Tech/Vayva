import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { standardHeaders } from "@vayva/shared";
import { z } from "zod";
import { wholesale } from "@vayva/industry-fashion";

const CatalogQuerySchema = z.object({
  buyerId: z.string().uuid(),
});

// GET /api/fashion/wholesale/catalog?buyerId=xxx - Get buyer catalog
export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (req: NextRequest, { correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      const buyerId = searchParams.get("buyerId");

      if (!buyerId) {
        return NextResponse.json(
          { error: "buyerId is required" },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      const result = CatalogQuerySchema.safeParse({ buyerId });
      if (!result.success) {
        return NextResponse.json(
          { error: "Invalid buyerId" },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      const products = await wholesale.getBuyerCatalog(buyerId);

      return NextResponse.json(
        { products },
        { status: 200, headers: standardHeaders(requestId) },
      );
    } catch (error) {
      console.error("Wholesale catalog error:", error);
      return NextResponse.json(
        { error: "Failed to fetch catalog" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
