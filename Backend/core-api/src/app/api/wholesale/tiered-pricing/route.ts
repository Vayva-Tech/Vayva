import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const TieredPricingSchema = z.object({
  productId: z.string(),
  tiers: z.array(z.object({
    minQuantity: z.number().min(1),
    maxQuantity: z.number().optional(),
    price: z.number().positive(),
    discountPercent: z.number().min(0).max(100).optional(),
  })),
});

// GET /api/wholesale/tiered-pricing - Get quantity break pricing
export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCT_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    try {
      const { searchParams } = new URL(req.url);
      const productId = searchParams.get('productId');
      
      // Mock data - in real implementation, fetch from database
      const tieredPricing = {
        productId: productId || 'prod-1',
        tiers: [
          { minQuantity: 1, maxQuantity: 9, price: 25.99 },
          { minQuantity: 10, maxQuantity: 49, price: 23.99, discountPercent: 8 },
          { minQuantity: 50, maxQuantity: 99, price: 21.99, discountPercent: 15 },
          { minQuantity: 100, maxQuantity: undefined, price: 19.99, discountPercent: 23 },
        ]
      };

      return NextResponse.json(
        { success: true, data: tieredPricing },
        { headers: standardHeaders(correlationId) }
      );
    } catch (error: unknown) {
      logger.error("[WHOLESALE_TIERED_PRICING_GET]", { error, storeId });
      return NextResponse.json(
        { success: false, error: "Failed to fetch tiered pricing" },
        { status: 500, headers: standardHeaders(correlationId) }
      );
    }
  }
);

// PUT /api/wholesale/tiered-pricing - Update pricing tiers
export const PUT = withVayvaAPI(
  PERMISSIONS.PRODUCT_EDIT,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    try {
      const body = await req.json();
      const { productId, tiers } = TieredPricingSchema.parse(body);
      
      // Mock implementation - in real scenario, update database
      const updatedPricing = {
        productId,
        tiers,
        updatedAt: new Date().toISOString(),
      };

      return NextResponse.json(
        { success: true, data: updatedPricing, message: "Tiered pricing updated successfully" },
        { headers: standardHeaders(correlationId) }
      );
    } catch (error: unknown) {
      logger.error("[WHOLESALE_TIERED_PRICING_PUT]", { error, storeId });
      return NextResponse.json(
        { success: false, error: "Failed to update tiered pricing" },
        { status: 500, headers: standardHeaders(correlationId) }
      );
    }
  }
);