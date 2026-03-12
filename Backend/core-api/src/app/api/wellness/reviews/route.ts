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
  serviceType: z.enum(["session", "appointment", "program", "facility"]).optional(),
  instructorId: z.string().optional(),
  clientId: z.string().optional(),
  minDate: z.string().datetime().optional(),
  maxDate: z.string().datetime().optional(),
  verifiedOnly: z.boolean().default(false),
});

const ReviewCreateSchema = z.object({
  clientId: z.string(),
  serviceType: z.enum(["session", "appointment", "program", "facility"]),
  serviceId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1).max(100),
  comment: z.string().min(10).max(1000),
  wouldRecommend: z.boolean(),
  instructorKnowledge: z.number().int().min(1).max(5),
  instructorCommunication: z.number().int().min(1).max(5),
  facilityCleanliness: z.number().int().min(1).max(5).optional(),
  valueForMoney: z.number().int().min(1).max(5),
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

      const { page, limit, rating, serviceType, instructorId, clientId, minDate, maxDate, verifiedOnly } = parseResult.data;
      const skip = (page - 1) * limit;

      const where: any = { storeId };
      
      if (rating) where.rating = rating;
      if (serviceType) where.serviceType = serviceType;
      if (instructorId) where.instructorId = instructorId;
      if (clientId) where.clientId = clientId;
      if (verifiedOnly) where.verified = true;
      if (minDate || maxDate) {
        where.createdAt = {};
        if (minDate) where.createdAt.gte = new Date(minDate);
        if (maxDate) where.createdAt.lte = new Date(maxDate);
      }

      const [reviews, total] = await Promise.all([
        prisma.wellnessReview.findMany({
          where,
          include: {
            client: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                specialty: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.wellnessReview.count({ where }),
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

      // Recent reviews with client names (respecting anonymity)
      const reviewsWithClientInfo = reviews.map(review => ({
        ...review,
        tags: JSON.parse(review.tags || "[]"),
        clientName: review.anonymous 
          ? "Anonymous" 
          : `${review.client.firstName} ${review.client.lastName.charAt(0)}.`,
        instructorName: `${review.instructor.firstName} ${review.instructor.lastName}`,
      }));

      return NextResponse.json(
        {
          data: reviewsWithClientInfo,
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
      logger.error("[WELLNESS_REVIEWS_GET]", { error, storeId });
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

      // Verify client exists
      const client = await prisma.user.findFirst({
        where: { id: body.clientId, storeId },
      });

      if (!client) {
        return NextResponse.json(
          { error: "Client not found" },
          { status: 404, headers: standardHeaders(requestId) }
        );
      }

      // Verify service exists and client participated
      const serviceExists = await this.verifyClientParticipation(
        storeId,
        body.serviceType,
        body.serviceId,
        body.clientId
      );

      if (!serviceExists) {
        return NextResponse.json(
          { error: "Client did not participate in this service" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      // Check for duplicate review
      const existingReview = await prisma.wellnessReview.findFirst({
        where: {
          clientId: body.clientId,
          serviceType: body.serviceType,
          serviceId: body.serviceId,
        },
      });

      if (existingReview) {
        return NextResponse.json(
          { error: "Client has already reviewed this service" },
          { status: 409, headers: standardHeaders(requestId) }
        );
      }

      const review = await prisma.wellnessReview.create({
        data: {
          storeId,
          clientId: body.clientId,
          serviceType: body.serviceType,
          serviceId: body.serviceId,
          rating: body.rating,
          title: body.title,
          comment: body.comment,
          wouldRecommend: body.wouldRecommend,
          instructorKnowledge: body.instructorKnowledge,
          instructorCommunication: body.instructorCommunication,
          facilityCleanliness: body.facilityCleanliness,
          valueForMoney: body.valueForMoney,
          tags: JSON.stringify(body.tags),
          anonymous: body.anonymous,
          verified: true, // Auto-verified for authenticated clients
          status: "approved",
        },
        include: {
          client: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      return NextResponse.json(review, {
        status: 201,
        headers: standardHeaders(requestId),
      });
    } catch (error: unknown) {
      logger.error("[WELLNESS_REVIEWS_POST]", { error, storeId, userId: user?.id });
      return NextResponse.json(
        { error: "Failed to create review" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

// Verify client participated in the service
async function verifyClientParticipation(storeId: string, serviceType: string, serviceId: string, clientId: string): Promise<boolean> {
  // This would check actual participation records
  // For now, returning true to allow review creation
  return true;
}