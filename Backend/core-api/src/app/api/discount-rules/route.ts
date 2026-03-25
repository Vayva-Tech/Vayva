import { NextRequest as _NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { z } from "zod";
import { PERMISSIONS } from "@/lib/team/permissions";

// GET /api/discount-rules - List discount rules
export const GET = withVayvaAPI(
  PERMISSIONS.DISCOUNT_VIEW,
  async (req, { storeId }) => {
    const { searchParams } = new URL(req.url);
    const active = searchParams.get("active");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const where: Record<string, unknown> = { storeId };

    if (active === "true") {
      const now = new Date();
      where.startsAt = { lte: now };
      where.OR = [{ endsAt: null }, { endsAt: { gt: now } }];
    }

    const rules = await prisma.discountRule.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });

    const totalCount = await prisma.discountRule.count({ where });

    return NextResponse.json({
      rules: rules.map((r) => ({
        id: r.id,
        name: r.name,
        type: r.type,
        valueAmount: r.valueAmount,
        valuePercent: r.valuePercent,
        appliesTo: r.appliesTo,
        minOrderAmount: r.minOrderAmount,
        maxDiscountAmount: r.maxDiscountAmount,
        startsAt: r.startsAt,
        endsAt: r.endsAt,
        usageLimitTotal: r.usageLimitTotal,
        usageLimitPerCustomer: r.usageLimitPerCustomer,
        requiresCoupon: r.requiresCoupon,
        couponCount: 0,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
      pagination: {
        total: totalCount,
        limit,
        offset,
      },
    });
  }
);

// POST /api/discount-rules - Create discount rule
export const POST = withVayvaAPI(
  PERMISSIONS.DISCOUNT_MANAGE,
  async (req, { storeId }) => {
    const body = await req.json();

    const schema = z.object({
      name: z.string().min(1).max(100),
      type: z.enum(["PERCENT", "AMOUNT", "FREE_SHIPPING"]),
      valueAmount: z.number().min(0).optional(),
      valuePercent: z.number().min(0).max(100).optional(),
      appliesTo: z.enum(["ALL", "PRODUCTS", "COLLECTIONS"]).default("ALL"),
      productIds: z.array(z.string().uuid()).optional(),
      collectionIds: z.array(z.string().uuid()).optional(),
      minOrderAmount: z.number().min(0).optional(),
      maxDiscountAmount: z.number().min(0).optional(),
      startsAt: z.string().datetime(),
      endsAt: z.string().datetime().optional(),
      usageLimitTotal: z.number().int().min(1).optional(),
      usageLimitPerCustomer: z.number().int().min(1).optional(),
      requiresCoupon: z.boolean().default(false),
    }).refine(
      (data) => {
        if (data.type === "PERCENT" && !data.valuePercent) {
          return false;
        }
        if (data.type === "AMOUNT" && !data.valueAmount) {
          return false;
        }
        return true;
      },
      {
        message: "valuePercent required for PERCENT, valueAmount required for AMOUNT",
      }
    );

    const validated = schema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const {
      name,
      type,
      valueAmount,
      valuePercent,
      appliesTo,
      productIds,
      collectionIds,
      minOrderAmount,
      maxDiscountAmount,
      startsAt,
      endsAt,
      usageLimitTotal,
      usageLimitPerCustomer,
      requiresCoupon,
    } = validated.data;

    const rule = await prisma.discountRule.create({
      data: {
        storeId,
        name,
        type,
        valueAmount: valueAmount ? valueAmount : null,
        valuePercent: valuePercent ? valuePercent : null,
        appliesTo,
        productIds: productIds || [],
        collectionIds: collectionIds || [],
        minOrderAmount: minOrderAmount ? minOrderAmount : null,
        maxDiscountAmount: maxDiscountAmount ? maxDiscountAmount : null,
        startsAt: new Date(startsAt),
        endsAt: endsAt ? new Date(endsAt) : null,
        usageLimitTotal,
        usageLimitPerCustomer,
        requiresCoupon,
      },
    });

    return NextResponse.json(
      {
        success: true,
        rule,
      },
      { status: 201 }
    );
  }
);

// PATCH /api/discount-rules - Update discount rule
export const PATCH = withVayvaAPI(
  PERMISSIONS.DISCOUNT_MANAGE,
  async (req, { storeId }) => {
    const body = await req.json();

    const schema = z.object({
      id: z.string().uuid(),
      name: z.string().min(1).max(100).optional(),
      endsAt: z.string().datetime().optional(),
      status: z.enum(["ACTIVE", "DISABLED"]).optional(),
      usageLimitTotal: z.number().int().min(1).optional(),
    });

    const validated = schema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { id, name, endsAt, status, usageLimitTotal } = validated.data;

    // Verify rule exists and belongs to store
    const existingRule = await prisma.discountRule.findFirst({
      where: { id, storeId },
    });

    if (!existingRule) {
      return NextResponse.json(
        { error: "Discount rule not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (endsAt) updateData.endsAt = new Date(endsAt);
    if (usageLimitTotal) updateData.usageLimitTotal = usageLimitTotal;

    const rule = await prisma.discountRule.update({
      where: { id },
      data: updateData,
    });

    // If status is DISABLED, disable all associated coupons
    if (status === "DISABLED") {
      await prisma.coupon.updateMany({
        where: { ruleId: id },
        data: { status: "DISABLED" },
      });
    }

    return NextResponse.json({
      success: true,
      rule,
    });
  }
);

// DELETE /api/discount-rules - Delete discount rule
export const DELETE = withVayvaAPI(
  PERMISSIONS.DISCOUNT_MANAGE,
  async (req, { storeId }) => {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    // Check for redemptions
    const redemptionCount = await prisma.discountRedemption.count({
      where: { ruleId: id },
    });

    if (redemptionCount > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete rule with existing redemptions",
          redemptionCount,
        },
        { status: 400 }
      );
    }

    // Delete associated coupons first
    await prisma.coupon.deleteMany({
      where: { ruleId: id, storeId },
    });

    // Delete rule
    await prisma.discountRule.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Discount rule deleted",
    });
  }
);
