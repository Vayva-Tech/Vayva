import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { standardHeaders } from "@vayva/shared";
import { z } from "zod";
import { visualSearch } from "@vayva/industry-fashion";

const SearchByImageSchema = z.object({
  imageUrl: z.string().url(),
});

const SearchByProductSchema = z.object({
  productId: z.string().uuid(),
});

// POST /api/fashion/visual-search - Search by uploaded image
export const POST = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const body = await req.json();
      const result = SearchByImageSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json(
          {
            error: "Invalid request body",
            details: result.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      const { imageUrl } = result.data;
      const results = await visualSearch.searchByImage(imageUrl, storeId);

      return NextResponse.json(
        { results },
        { status: 200, headers: standardHeaders(requestId) },
      );
    } catch (error) {
      console.error("Visual search error:", error);
      return NextResponse.json(
        { error: "Failed to perform visual search" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);

// GET /api/fashion/visual-search?productId=xxx - Search by product ID
export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      const productId = searchParams.get("productId");

      if (!productId) {
        return NextResponse.json(
          { error: "productId is required" },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      const result = SearchByProductSchema.safeParse({ productId });
      if (!result.success) {
        return NextResponse.json(
          { error: "Invalid productId" },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      const results = await visualSearch.searchByProductId(productId, storeId);

      return NextResponse.json(
        { results },
        { status: 200, headers: standardHeaders(requestId) },
      );
    } catch (error) {
      console.error("Visual search error:", error);
      return NextResponse.json(
        { error: "Failed to perform visual search" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
