import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const PromotionQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(["active", "scheduled", "expired", "draft"]).optional(),
  type: z.enum(["percentage", "fixed_amount", "buy_x_get_y", "free_shipping"]).optional(),
  minDiscount: z.coerce.number().optional(),
  maxDiscount: z.coerce.number().optional(),
  search: z.string().optional(),
});

const PromotionCreateSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(["percentage", "fixed_amount", "buy_x_get_y", "free_shipping"]),
  discountValue: z.number().positive(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  minimumOrder: z.number().nonnegative().default(0),
  maximumDiscount: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  perCustomerLimit: z.number().int().positive().default(1),
  applicableCategories: z.array(z.string()).default([]),
  applicableProducts: z.array(z.string()).default([]),
  excludeCategories: z.array(z.string()).default([]),
  excludeProducts: z.array(z.string()).default([]),
  stackable: z.boolean().default(false),
  newCustomersOnly: z.boolean().default(false),
  notes: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.PROMOTIONS_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      const parseResult = PromotionQuerySchema.safeParse(
        Object.fromEntries(searchParams)
      );

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid query parameters",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const { page, limit, status, type, minDiscount, maxDiscount, search } = parseResult.data;
      const skip = (page - 1) * limit;

      const where: any = { storeId };
      
      if (status) where.status = status;
      if (type) where.type = type;
      if (minDiscount !== undefined) where.discountValue = { gte: minDiscount };
      if (maxDiscount !== undefined) where.discountValue = { lte: maxDiscount };
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { code: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      const [promotions, total] = await Promise.all([
        prisma.groceryPromotion.findMany({
          where,
          include: {
            _count: {
              select: {
                usages: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.groceryPromotion.count({ where }),
      ]);

      // Calculate promotion metrics
      const promotionsWithMetrics = await Promise.all(
        promotions.map(async (promotion) => {
          const usageCount = promotion._count.usages;
          const redemptionRate = promotion.usageLimit 
            ? Math.round((usageCount / promotion.usageLimit) * 10000) / 100
            : 0;
          
          const isActive = promotion.status === "active" && 
                          new Date(promotion.startDate) <= new Date() && 
                          new Date(promotion.endDate) >= new Date();

          const daysRemaining = Math.ceil((new Date(promotion.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;

          return {
            ...promotion,
            applicableCategories: JSON.parse(promotion.applicableCategories || "[]"),
            applicableProducts: JSON.parse(promotion.applicableProducts || "[]"),
            excludeCategories: JSON.parse(promotion.excludeCategories || "[]"),
            excludeProducts: JSON.parse(promotion.excludeProducts || "[]"),
            metrics: {
              usageCount,
              redemptionRate,
              isActive,
              daysRemaining: Math.max(0, daysRemaining),
              isExpiringSoon,
              performance: await this.calculatePromotionPerformance(promotion.id, storeId),
            },
          };
        })
      );

      return NextResponse.json(
        {
          data: promotionsWithMetrics,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[GROCERY_PROMOTIONS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch promotions" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.PROMOTIONS_MANAGE,
  async (req: NextRequest, { storeId, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const json = await req.json().catch(() => ({}));
      const parseResult = PromotionCreateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid promotion data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const body = parseResult.data;

      // Validate dates
      const startDate = new Date(body.startDate);
      const endDate = new Date(body.endDate);
      
      if (startDate >= endDate) {
        return NextResponse.json(
          { error: "End date must be after start date" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      if (startDate < new Date()) {
        return NextResponse.json(
          { error: "Start date cannot be in the past" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      // Check for duplicate code
      const existingPromotion = await prisma.groceryPromotion.findFirst({
        where: { code: body.code, storeId },
      });

      if (existingPromotion) {
        return NextResponse.json(
          { error: "Promotion code already exists" },
          { status: 409, headers: standardHeaders(requestId) }
        );
      }

      // Validate discount values
      if (body.type === "percentage" && (body.discountValue <= 0 || body.discountValue > 100)) {
        return NextResponse.json(
          { error: "Percentage discount must be between 1 and 100" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const promotion = await prisma.groceryPromotion.create({
        data: {
          storeId,
          name: body.name,
          code: body.code,
          description: body.description,
          type: body.type,
          discountValue: body.discountValue,
          startDate,
          endDate,
          minimumOrder: body.minimumOrder,
          maximumDiscount: body.maximumDiscount,
          usageLimit: body.usageLimit,
          perCustomerLimit: body.perCustomerLimit,
          applicableCategories: JSON.stringify(body.applicableCategories),
          applicableProducts: JSON.stringify(body.applicableProducts),
          excludeCategories: JSON.stringify(body.excludeCategories),
          excludeProducts: JSON.stringify(body.excludeProducts),
          stackable: body.stackable,
          newCustomersOnly: body.newCustomersOnly,
          notes: body.notes,
          status: startDate <= new Date() ? "active" : "scheduled",
        },
      });

      return NextResponse.json(promotion, {
        status: 201,
        headers: standardHeaders(requestId),
      });
    } catch (error: unknown) {
      logger.error("[GROCERY_PROMOTIONS_POST]", { error, storeId, userId: user?.id });
      return NextResponse.json(
        { error: "Failed to create promotion" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

// Calculate promotion performance metrics
async function calculatePromotionPerformance(promotionId: string, storeId: string) {
  // Mock performance data - would integrate with actual sales data
  const mockPerformance = {
    totalRevenue: Math.floor(Math.random() * 50000) + 10000,
    totalOrders: Math.floor(Math.random() * 200) + 50,
    averageOrderValue: Math.floor(Math.random() * 100) + 25,
    roi: Math.floor(Math.random() * 300) + 100, // percentage
  };
  
  return mockPerformance;
}