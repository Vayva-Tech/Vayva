import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const ReviewQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  rating: z.coerce.number().min(1).max(5).optional(),
  productId: z.string().optional(),
  customerId: z.string().optional(),
  verifiedOnly: z.boolean().default(false),
  minDate: z.string().datetime().optional(),
  maxDate: z.string().datetime().optional(),
});

const ReviewCreateSchema = z.object({
  customerId: z.string(),
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1).max(100),
  comment: z.string().min(10).max(1000),
  wouldRecommend: z.boolean(),
  qualityRating: z.number().int().min(1).max(5),
  valueRating: z.number().int().min(1).max(5),
  deliveryRating: z.number().int().min(1).max(5).optional(),
  tags: z.array(z.string()).default([]),
  anonymous: z.boolean().default(false),
});

export const GET = withVayvaAPI(
  PERMISSIONS.REVIEWS_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      const parseResult = ReviewQuerySchema.safeParse(
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

      const { page, limit, rating, productId, customerId, verifiedOnly, minDate, maxDate } = parseResult.data;
      const skip = (page - 1) * limit;

      const where: any = { storeId };
      
      if (rating) where.rating = rating;
      if (productId) where.productId = productId;
      if (customerId) where.customerId = customerId;
      if (verifiedOnly) where.verified = true;
      if (minDate || maxDate) {
        where.createdAt = {};
        if (minDate) where.createdAt.gte = new Date(minDate);
        if (maxDate) where.createdAt.lte = new Date(maxDate);
      }

      const [reviews, total] = await Promise.all([
        prisma.groceryProductReview.findMany({
          where,
          include: {
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.groceryProductReview.count({ where }),
      ]);

      // Calculate review statistics
      const stats = reviews.reduce((acc, review) => {
        acc.total++;
        acc.totalRating += review.rating;
        if (review.wouldRecommend) acc.recommendations++;
        return acc;
      }, { total: 0, totalRating: 0, recommendations: 0 });

      const averageRating = stats.total > 0 ? stats.totalRating / stats.total : 0;
      const recommendationRate = stats.total > 0 ? (stats.recommendations / stats.total) * 100 : 0;

      // Rating distribution
      const ratingDistribution = reviews.reduce((acc: Record<number, number>, review) => {
        acc[review.rating] = (acc[review.rating] || 0) + 1;
        return acc;
      }, {});

      // Recent reviews with customer names (respecting anonymity)
      const reviewsWithCustomerInfo = reviews.map(review => ({
        ...review,
        tags: JSON.parse(review.tags || "[]"),
        customerName: review.anonymous 
          ? "Anonymous" 
          : `${review.customer.firstName} ${review.customer.lastName.charAt(0)}.`,
        productName: review.product.name,
      }));

      return NextResponse.json(
        {
          data: reviewsWithCustomerInfo,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            statistics: {
              averageRating: Math.round(averageRating * 100) / 100,
              totalReviews: stats.total,
              recommendationRate: Math.round(recommendationRate * 100) / 100,
              ratingDistribution,
            },
          },
        },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[GROCERY_REVIEWS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch reviews" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.REVIEWS_MANAGE,
  async (req: NextRequest, { storeId, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const json = await req.json().catch(() => ({}));
      const parseResult = ReviewCreateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid review data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const body = parseResult.data;

      // Verify customer exists
      const customer = await prisma.user.findFirst({
        where: { id: body.customerId, storeId },
      });

      if (!customer) {
        return NextResponse.json(
          { error: "Customer not found" },
          { status: 404, headers: standardHeaders(requestId) }
        );
      }

      // Verify product exists
      const product = await prisma.groceryProduct.findFirst({
        where: { id: body.productId, storeId },
      });

      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404, headers: standardHeaders(requestId) }
        );
      }

      // Check for duplicate review
      const existingReview = await prisma.groceryProductReview.findFirst({
        where: {
          customerId: body.customerId,
          productId: body.productId,
        },
      });

      if (existingReview) {
        return NextResponse.json(
          { error: "Customer has already reviewed this product" },
          { status: 409, headers: standardHeaders(requestId) }
        );
      }

      // Verify customer purchased the product
      const orderItem = await prisma.groceryOrderItem.findFirst({
        where: {
          orderId: {
            in: (await prisma.groceryOrder.findMany({
              where: { customerId: body.customerId, storeId },
              select: { id: true },
            })).map(order => order.id),
          },
          productId: body.productId,
        },
      });

      if (!orderItem) {
        return NextResponse.json(
          { error: "Customer has not purchased this product" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const review = await prisma.groceryProductReview.create({
        data: {
          storeId,
          customerId: body.customerId,
          productId: body.productId,
          rating: body.rating,
          title: body.title,
          comment: body.comment,
          wouldRecommend: body.wouldRecommend,
          qualityRating: body.qualityRating,
          valueRating: body.valueRating,
          deliveryRating: body.deliveryRating,
          tags: JSON.stringify(body.tags),
          anonymous: body.anonymous,
          verified: true,
          status: "approved",
        },
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          product: {
            select: {
              name: true,
            },
          },
        },
      });

      return NextResponse.json(review, {
        status: 201,
        headers: standardHeaders(requestId),
      });
    } catch (error: unknown) {
      logger.error("[GROCERY_REVIEWS_POST]", { error, storeId, userId: user?.id });
      return NextResponse.json(
        { error: "Failed to create review" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);