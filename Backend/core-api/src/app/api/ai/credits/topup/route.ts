import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { AICreditService } from "@/lib/ai/credit-service";
import { logger } from "@/lib/logger";
import { z } from "zod";

const TopUpSchema = z.object({
  creditsAmount: z.number().int().positive("Credits amount must be a positive integer"),
  paymentReference: z.string().trim().min(1, "Payment reference is required"),
});

/**
 * POST /api/ai/credits/topup
 * Purchase additional AI credits for the authenticated merchant.
 *
 * Body: { creditsAmount: number, paymentReference: string }
 */
export const POST = withVayvaAPI(
  PERMISSIONS.BILLING_MANAGE,
  async (req: NextRequest, { storeId }) => {
    try {
      let body: unknown;
      try {
        body = await req.json();
      } catch {
        return NextResponse.json(
          { error: "Invalid JSON body" },
          { status: 400 },
        );
      }

      const parseResult = TopUpSchema.safeParse(body);
      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid request body",
            details: parseResult.error.flatten(),
          },
          { status: 400 },
        );
      }

      const { creditsAmount, paymentReference } = parseResult.data;

      const result = await AICreditService.addCredits(
        storeId,
        creditsAmount,
        paymentReference,
      );

      return NextResponse.json(
        {
          success: true,
          data: {
            creditsAdded: result.creditsAdded,
            newBalance: result.newBalance,
            transactionId: result.transactionId,
          },
        },
        { status: 201 },
      );
    } catch (error: unknown) {
      logger.error("[AI_CREDITS_TOPUP_POST]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to process credit top-up" },
        { status: 500 },
      );
    }
  },
);
