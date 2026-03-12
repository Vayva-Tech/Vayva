import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger, standardHeaders } from "@vayva/shared";

// GET /api/wholesale/customer-price - Get customer-specific pricing
export const GET = withVayvaAPI(
  PERMISSIONS.CUSTOMER_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    try {
      const { searchParams } = new URL(req.url);
      const productId = searchParams.get('productId');
      const customerId = searchParams.get('customerId');
      
      if (!productId || !customerId) {
        return NextResponse.json(
          { success: false, error: "productId and customerId are required" },
          { status: 400, headers: standardHeaders(correlationId) }
        );
      }

      // Mock data - in real implementation, calculate based on customer tier, volume, etc.
      const customerPrice = {
        productId,
        customerId,
        basePrice: 25.99,
        customerDiscount: 12, // 12% discount
        finalPrice: 22.87,
        applicableTiers: ['silver', 'volume-discount'],
        validUntil: '2024-12-31',
      };

      return NextResponse.json(
        { success: true, data: customerPrice },
        { headers: standardHeaders(correlationId) }
      );
    } catch (error: unknown) {
      logger.error("[WHOLESALE_CUSTOMER_PRICE_GET]", { error, storeId });
      return NextResponse.json(
        { success: false, error: "Failed to fetch customer pricing" },
        { status: 500, headers: standardHeaders(correlationId) }
      );
    }
  }
);