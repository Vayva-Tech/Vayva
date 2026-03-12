import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { z } from "zod";
import { logger } from "@/lib/logger";

const RedeemGiftCardSchema = z.object({
  amount: z.number().positive("Redemption amount must be positive"),
  orderId: z.string().optional(),
  notes: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.RETAIL_GIFT_CARDS_VIEW,
  async (req, { params, storeId, db }) => {
    try {
      const { id } = params;
      
      const giftCard = await db.giftCard.findUnique({
        where: { id, storeId },
        include: {
          issuedBy: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          redemptions: {
            orderBy: { createdAt: "desc" },
            include: {
              processedBy: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
              order: {
                select: {
                  id: true,
                  orderNumber: true,
                  total: true,
                },
              },
            },
          },
          _count: {
            select: {
              redemptions: true,
            },
          },
        },
      });
      
      if (!giftCard) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "GIFT_CARD_NOT_FOUND",
              message: "Gift card not found",
            },
          },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: giftCard,
      });
    } catch (error: any) {
      logger.error("[RETAIL_GIFT_CARD_GET]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "GIFT_CARD_FETCH_FAILED",
            message: "Failed to fetch gift card",
          },
        },
        { status: 500 }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.RETAIL_GIFT_CARDS_MANAGE,
  async (req, { params, storeId, db, user }) => {
    try {
      const { id } = params;
      const body = await req.json();
      const validatedData = RedeemGiftCardSchema.parse(body);
      
      const giftCard = await db.giftCard.findUnique({
        where: { id, storeId },
      });
      
      if (!giftCard) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "GIFT_CARD_NOT_FOUND",
              message: "Gift card not found",
            },
          },
          { status: 404 }
        );
      }
      
      // Validate gift card status
      if (giftCard.status !== "ACTIVE") {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "GIFT_CARD_INVALID_STATUS",
              message: `Cannot redeem gift card with status: ${giftCard.status}`,
            },
          },
          { status: 400 }
        );
      }
      
      // Check expiry
      if (giftCard.expiryDate && new Date(giftCard.expiryDate) < new Date()) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "GIFT_CARD_EXPIRED",
              message: "Gift card has expired",
            },
          },
          { status: 400 }
        );
      }
      
      // Check balance
      if (giftCard.balance < validatedData.amount) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INSUFFICIENT_BALANCE",
              message: `Insufficient balance. Available: $${giftCard.balance.toFixed(2)}`,
            },
          },
          { status: 400 }
        );
      }
      
      // Process redemption
      const [updatedGiftCard, redemption] = await db.$transaction([
        db.giftCard.update({
          where: { id },
          data: {
            balance: {
              decrement: validatedData.amount,
            },
            status: giftCard.balance - validatedData.amount === 0 ? "USED" : undefined,
          },
        }),
        db.giftCardRedemption.create({
          data: {
            giftCardId: id,
            amount: validatedData.amount,
            orderId: validatedData.orderId,
            notes: validatedData.notes,
            storeId,
            processedById: user.id,
          },
          include: {
            processedBy: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            order: validatedData.orderId
              ? {
                  select: {
                    orderNumber: true,
                    total: true,
                  },
                }
              : undefined,
          },
        }),
      ]);
      
      logger.info("[RETAIL_GIFT_CARD_REDEEMED]", {
        giftCardId: id,
        redemptionId: redemption.id,
        amount: validatedData.amount,
        orderId: validatedData.orderId,
        storeId,
        userId: user.id,
      });
      
      return NextResponse.json({
        success: true,
        data: {
          giftCard: updatedGiftCard,
          redemption,
        },
        message: "Gift card redeemed successfully",
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid request data",
              details: error.errors,
            },
          },
          { status: 400 }
        );
      }
      
      logger.error("[RETAIL_GIFT_CARD_REDEEM]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "GIFT_CARD_REDEEM_FAILED",
            message: "Failed to redeem gift card",
          },
        },
        { status: 500 }
      );
    }
  }
);

export const PUT = withVayvaAPI(
  PERMISSIONS.RETAIL_GIFT_CARDS_MANAGE,
  async (req, { params, storeId, db, user }) => {
    try {
      const { id } = params;
      const body = await req.json();
      
      const giftCard = await db.giftCard.findUnique({
        where: { id, storeId },
      });
      
      if (!giftCard) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "GIFT_CARD_NOT_FOUND",
              message: "Gift card not found",
            },
          },
          { status: 404 }
        );
      }
      
      // Allow updating status (ACTIVE, INACTIVE, SUSPENDED)
      const updatedGiftCard = await db.giftCard.update({
        where: { id },
        data: {
          status: body.status,
          updatedAt: new Date(),
        },
      });
      
      logger.info("[RETAIL_GIFT_CARD_STATUS_UPDATED]", {
        giftCardId: id,
        newStatus: body.status,
        storeId,
        userId: user.id,
      });
      
      return NextResponse.json({
        success: true,
        data: updatedGiftCard,
        message: "Gift card status updated successfully",
      });
    } catch (error: any) {
      logger.error("[RETAIL_GIFT_CARD_STATUS_UPDATE]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "GIFT_CARD_STATUS_UPDATE_FAILED",
            message: "Failed to update gift card status",
          },
        },
        { status: 500 }
      );
    }
  }
);