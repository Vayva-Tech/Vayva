import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { z } from "zod";
import { logger } from "@/lib/logger";

const UpdateLoyaltyMemberSchema = z.object({
  tier: z.enum(["BRONZE", "SILVER", "GOLD", "PLATINUM"]).optional(),
  points: z.number().int().min(0).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),
  notes: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.RETAIL_LOYALTY_VIEW,
  async (req, { params, storeId, db }) => {
    try {
      const { id } = params;
      
      const member = await db.loyaltyMember.findUnique({
        where: { id, storeId },
        include: {
          tier: true,
          transactions: {
            take: 10,
            orderBy: { createdAt: "desc" },
          },
          _count: {
            select: {
              transactions: true,
            },
          },
        },
      });
      
      if (!member) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "MEMBER_NOT_FOUND",
              message: "Loyalty member not found",
            },
          },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: member,
      });
    } catch (error: any) {
      logger.error("[RETAIL_LOYALTY_MEMBER_GET]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MEMBER_FETCH_FAILED",
            message: "Failed to fetch loyalty member",
          },
        },
        { status: 500 }
      );
    }
  }
);

export const PUT = withVayvaAPI(
  PERMISSIONS.RETAIL_LOYALTY_MANAGE,
  async (req, { params, storeId, db, user }) => {
    try {
      const { id } = params;
      const body = await req.json();
      const validatedData = UpdateLoyaltyMemberSchema.parse(body);
      
      const member = await db.loyaltyMember.findUnique({
        where: { id, storeId },
        include: { tier: true },
      });
      
      if (!member) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "MEMBER_NOT_FOUND",
              message: "Loyalty member not found",
            },
          },
          { status: 404 }
        );
      }
      
      const updateData: any = { ...validatedData };
      
      // Handle points adjustment
      if (validatedData.points !== undefined) {
        const pointsDifference = validatedData.points - member.points;
        if (pointsDifference !== 0) {
          updateData.points = validatedData.points;
          // Record transaction for point adjustment
          await db.loyaltyTransaction.create({
            data: {
              memberId: id,
              type: pointsDifference > 0 ? "ADJUSTMENT_ADD" : "ADJUSTMENT_SUBTRACT",
              points: Math.abs(pointsDifference),
              description: validatedData.notes || "Manual point adjustment",
              storeId,
              processedById: user.id,
            },
          });
        }
      }
      
      const updatedMember = await db.loyaltyMember.update({
        where: { id },
        data: updateData,
        include: {
          tier: true,
          _count: {
            select: {
              transactions: true,
            },
          },
        },
      });
      
      logger.info("[RETAIL_LOYALTY_MEMBER_UPDATED]", {
        memberId: id,
        storeId,
        userId: user.id,
        changes: Object.keys(validatedData),
      });
      
      return NextResponse.json({
        success: true,
        data: updatedMember,
        message: "Loyalty member updated successfully",
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
      
      logger.error("[RETAIL_LOYALTY_MEMBER_PUT]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MEMBER_UPDATE_FAILED",
            message: "Failed to update loyalty member",
          },
        },
        { status: 500 }
      );
    }
  }
);