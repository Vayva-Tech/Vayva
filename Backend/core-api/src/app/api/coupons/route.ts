import { NextRequest as _NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { z } from "zod";
import { randomBytes } from "crypto";
import { PERMISSIONS } from "@/lib/team/permissions";

// GET /api/coupons - List coupons with filters
export const GET = withVayvaAPI(
  PERMISSIONS.DISCOUNT_VIEW,
  async (req, { storeId }) => {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as
      | "ACTIVE"
      | "DISABLED"
      | "EXPIRED"
      | null;
    const ruleId = searchParams.get("ruleId");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const where: Record<string, unknown> = { storeId };

    if (status) {
      where.status = status;
    }

    if (ruleId) {
      where.ruleId = ruleId;
    }

    const coupons = await prisma.coupon.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });

    const totalCount = await prisma.coupon.count({ where });

    return NextResponse.json({
      coupons: coupons.map((c) => ({
        id: c.id,
        code: c.code,
        status: c.status,
        ruleId: c.ruleId,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      pagination: {
        total: totalCount,
        limit,
        offset,
      },
    });
  }
);

// POST /api/coupons - Create new coupon
export const POST = withVayvaAPI(
  PERMISSIONS.DISCOUNT_MANAGE,
  async (req, { storeId }) => {
    const body = await req.json();

    const schema = z.object({
      ruleId: z.string().uuid(),
      code: z.string().min(1).max(50).optional(),
      generateCode: z.boolean().optional(),
      codePrefix: z.string().max(10).optional(),
      quantity: z.number().int().min(1).max(100).default(1),
    });

    const validated = schema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { ruleId, code, generateCode: _generateCode, codePrefix, quantity } =
      validated.data;

    // Verify rule exists and belongs to store
    const rule = await prisma.discountRule.findFirst({
      where: { id: ruleId, storeId },
    });

    if (!rule) {
      return NextResponse.json(
        { error: "Discount rule not found" },
        { status: 404 }
      );
    }

    const createdCoupons = [];

    // Generate or use provided code
    if (quantity === 1) {
      const couponCode = code || generateCouponCode(codePrefix);

      const coupon = await prisma.coupon.create({
        data: {
          storeId,
          ruleId,
          code: couponCode.toUpperCase(),
          status: "ACTIVE",
        },
      });

      createdCoupons.push(coupon);
    } else {
      // Bulk generate coupons
      for (let i = 0; i < quantity; i++) {
        const couponCode = generateCouponCode(codePrefix);

        try {
          const coupon = await prisma.coupon.create({
            data: {
              storeId,
              ruleId,
              code: couponCode.toUpperCase(),
              status: "ACTIVE",
            },
          });
          createdCoupons.push(coupon);
        } catch {
          // If code collision, retry once
          const retryCode = generateCouponCode(codePrefix);
          const coupon = await prisma.coupon.create({
            data: {
              storeId,
              ruleId,
              code: retryCode.toUpperCase(),
              status: "ACTIVE",
            },
          });
          createdCoupons.push(coupon);
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        coupons: createdCoupons,
        count: createdCoupons.length,
      },
      { status: 201 }
    );
  }
);

// Helper to generate random coupon code
function generateCouponCode(prefix?: string): string {
  const code = randomBytes(4).toString("hex").toUpperCase();
  return prefix ? `${prefix}-${code}` : code;
}
