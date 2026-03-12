import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { standardHeaders } from "@vayva/shared";
import { z } from "zod";
import { visualSearch } from "@vayva/industry-fashion";

const IndexProductSchema = z.object({
  productId: z.string().uuid(),
});

// POST /api/fashion/visual-search/index - Index a product for visual search
export const POST = withVayvaAPI(
  PERMISSIONS.PRODUCTS_EDIT,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const body = await req.json();
      const result = IndexProductSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json(
          {
            error: "Invalid request body",
            details: result.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      const { productId } = result.data;
      await visualSearch.indexProduct(productId, storeId);

      return NextResponse.json(
        { success: true, message: "Product indexed successfully" },
        { status: 200, headers: standardHeaders(requestId) },
      );
    } catch (error) {
      console.error("Visual search index error:", error);
      return NextResponse.json(
        { error: "Failed to index product" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
