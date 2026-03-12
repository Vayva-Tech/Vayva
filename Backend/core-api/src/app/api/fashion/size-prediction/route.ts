import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { standardHeaders } from "@vayva/shared";
import { z } from "zod";
import { sizePrediction } from "@vayva/industry-fashion";

const SizePredictionSchema = z.object({
  customerId: z.string().uuid(),
  productId: z.string().uuid(),
  measurements: z.object({
    height: z.number().optional(),
    weight: z.number().optional(),
    age: z.number().optional(),
    bodyType: z.enum(['petite', 'regular', 'tall', 'plus']).optional(),
    preferredFit: z.enum(['tight', 'regular', 'loose']).optional(),
  }).optional(),
});

// POST /api/fashion/size-prediction - Predict size for customer
export const POST = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const body = await req.json();
      const result = SizePredictionSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json(
          {
            error: "Invalid request body",
            details: result.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      const { customerId, productId, measurements } = result.data;
      const prediction = await sizePrediction.predictSize(
        customerId,
        productId,
        storeId,
        measurements
      );

      return NextResponse.json(
        prediction,
        { status: 200, headers: standardHeaders(requestId) },
      );
    } catch (error) {
      console.error("Size prediction error:", error);
      return NextResponse.json(
        { error: "Failed to predict size" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
