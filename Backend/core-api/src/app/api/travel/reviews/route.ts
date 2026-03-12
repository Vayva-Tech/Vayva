import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const ReviewQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  supplierId: z.string().optional(),
  packageId: z.string().optional(),
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

      const { page, limit, status, rating, supplierId, packageId } = parseResult.data;
      const skip = (page - 1) * limit;

      const where: any = { storeId };
      
      if (status) where.status = status;
      if (rating) where.rating = rating;
      if (supplierId) where.supplierId = supplierId;
      if (packageId) where.packageId = packageId;

      const [reviews, total] = await Promise.all([
        prisma.travelReview.findMany({
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
            supplier: {
              select: {
                id: true,
                name: true,
              },
            },
            package: {
              select: {
                id: true,
                name: true,
                destination: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.travelReview.count({ where }),
      ]);

      // Calculate rating statistics
      const ratingStats = {
        average: reviews.length > 0 
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
          : 0,
        countByRating: {
          5: reviews.filter(r => r.rating === 5).length,
          4: reviews.filter(r => r.rating === 4).length,
          3: reviews.filter(r => r.rating === 3).length,
          2: reviews.filter(r => r.rating === 2).length,
          1: reviews.filter(r => r.rating === 1).length,
        },
        total: reviews.length,
      };

      return NextResponse.json(
        {
          data: reviews,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            ratingStats,
          },
        },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[TRAVEL_REVIEWS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch reviews" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);