import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { z } from "zod";
import { logger } from "@/lib/logger";

const IssueGiftCardSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  recipientName: z.string().min(1, "Recipient name is required"),
  recipientEmail: z.string().email("Valid email is required"),
  message: z.string().optional(),
  expiryDate: z.string().datetime().optional(),
  sendImmediately: z.boolean().default(true),
});

export const GET = withVayvaAPI(
  PERMISSIONS.RETAIL_GIFT_CARDS_VIEW,
  async (req, { storeId, db }) => {
    try {
      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "20");
      const status = searchParams.get("status");
      
      const where: any = { storeId };
      
      if (status) {
        where.status = status;
      }
      
      const [giftCards, total] = await Promise.all([
        db.giftCard.findMany({
          where,
          take: limit,
          skip: (page - 1) * limit,
          orderBy: { createdAt: "desc" },
          include: {
            issuedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            _count: {
              select: {
                redemptions: true,
              },
            },
          },
        }),
        db.giftCard.count({ where }),
      ]);
      
      return NextResponse.json({
        success: true,
        data: giftCards,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      logger.error("[RETAIL_GIFT_CARDS_GET]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "GIFT_CARDS_FETCH_FAILED",
            message: "Failed to fetch gift cards",
          },
        },
        { status: 500 }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.RETAIL_GIFT_CARDS_MANAGE,
  async (req, { storeId, db, user }) => {
    try {
      const body = await req.json();
      const validatedData = IssueGiftCardSchema.parse(body);
      
      // Generate unique gift card code
      const giftCardCode = `GC${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      // Set default expiry (1 year from now)
      const expiryDate = validatedData.expiryDate 
        ? new Date(validatedData.expiryDate)
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      
      const giftCard = await db.giftCard.create({
        data: {
          code: giftCardCode,
          amount: validatedData.amount,
          balance: validatedData.amount,
          recipientName: validatedData.recipientName,
          recipientEmail: validatedData.recipientEmail,
          message: validatedData.message,
          expiryDate,
          status: "ACTIVE",
          storeId,
          issuedById: user.id,
        },
        include: {
          issuedBy: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });
      
      logger.info("[RETAIL_GIFT_CARD_ISSUED]", {
        giftCardId: giftCard.id,
        code: giftCardCode,
        amount: validatedData.amount,
        storeId,
        userId: user.id,
      });
      
      return NextResponse.json({
        success: true,
        data: giftCard,
        message: "Gift card issued successfully",
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
      
      logger.error("[RETAIL_GIFT_CARDS_POST]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "GIFT_CARD_ISSUE_FAILED",
            message: "Failed to issue gift card",
          },
        },
        { status: 500 }
      );
    }
  }
);