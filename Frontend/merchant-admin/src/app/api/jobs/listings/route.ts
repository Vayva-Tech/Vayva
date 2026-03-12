import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";
import { prisma } from "@/lib/prisma";

// GET /api/jobs/listings - Get all job listings
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");
      const status = searchParams.get("status");
      const department = searchParams.get("department");
      const employmentType = searchParams.get("employmentType");

      const where: Record<string, unknown> = { storeId };

      if (status) {
        where.status = status;
      }

      if (department) {
        where.department = department;
      }

      if (employmentType) {
        where.employmentType = employmentType;
      }

      const [listings, total] = await Promise.all([
        (prisma as any).jobListing.findMany({
          where,
          include: {
            hiringManager: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            _count: {
              select: {
                applications: true,
              },
            },
          },
          orderBy: { postedAt: "desc" },
          skip: offset,
          take: limit,
        }),
        (prisma as any).jobListing.count({ where }),
      ]);

      return NextResponse.json({
        success: true,
        data: listings,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + listings.length < total,
        },
      });
    } catch (error: unknown) {
      logger.error("[JOBS_LISTINGS_GET_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to fetch job listings" },
        { status: 500 }
      );
    }
  }
);

// POST /api/jobs/listings - Create a new job listing
export const POST = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string } }) => {
    try {
      const body = await req.json();
      const {
        title,
        description,
        department,
        location,
        employmentType,
        salaryMin,
        salaryMax,
        salaryCurrency,
        requirements,
        responsibilities,
        benefits,
        status = "draft",
        hiringManagerId,
        postedAt,
        expiresAt,
        remoteOption,
        experienceLevel,
      } = body;

      if (!title || !department) {
        return NextResponse.json(
          { success: false, error: "Title and department are required" },
          { status: 400 }
        );
      }

      const listing = await (prisma as any).jobListing.create({
        data: {
          storeId,
          title,
          description,
          department,
          location,
          employmentType: employmentType || "full_time",
          salaryMin,
          salaryMax,
          salaryCurrency: salaryCurrency || "NGN",
          requirements: requirements || [],
          responsibilities: responsibilities || [],
          benefits: benefits || [],
          status,
          hiringManagerId,
          postedAt: postedAt ? new Date(postedAt) : new Date(),
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          remoteOption: remoteOption || "no",
          experienceLevel: experienceLevel || "mid",
          createdBy: user.id,
        },
        include: {
          hiringManager: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      logger.info("[JOB_LISTING_CREATED]", { listingId: listing.id, storeId });

      return NextResponse.json({
        success: true,
        data: listing,
      });
    } catch (error: unknown) {
      logger.error("[JOB_LISTING_CREATE_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to create job listing" },
        { status: 500 }
      );
    }
  }
);
