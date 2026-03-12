import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";
import { prisma } from "@/lib/prisma";

// GET /api/fitness/memberships - Get all memberships for the merchant
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");
      const status = searchParams.get("status");
      const search = searchParams.get("search");

      const where: Record<string, unknown> = { storeId };

      if (status) {
        where.status = status;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      const [memberships, total] = await Promise.all([
        (prisma as any).fitnessMembership.findMany({
          where,
          include: {
            _count: {
              select: {
                members: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip: offset,
          take: limit,
        }),
        (prisma as any).fitnessMembership.count({ where }),
      ]);

      return NextResponse.json({
        success: true,
        data: memberships,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + memberships.length < total,
        },
      });
    } catch (error: unknown) {
      logger.error("[MEMBERSHIPS_GET_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to fetch memberships" },
        { status: 500 }
      );
    }
  }
);

// POST /api/fitness/memberships - Create a new membership
export const POST = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string } }) => {
    try {
      const body = await req.json();
      const {
        name,
        description,
        price,
        duration,
        durationType,
        features,
        status = "active",
        maxGuestPasses,
        freezeDays,
        personalTrainingSessions,
      } = body;

      if (!name || !price) {
        return NextResponse.json(
          { success: false, error: "Name and price are required" },
          { status: 400 }
        );
      }

      const membership = await (prisma as any).fitnessMembership.create({
        data: {
          storeId,
          name,
          description,
          price,
          duration: duration || 30,
          durationType: durationType || "days",
          features: features || [],
          status,
          maxGuestPasses,
          freezeDays,
          personalTrainingSessions,
          createdBy: user.id,
        },
      });

      logger.info("[MEMBERSHIP_CREATED]", { membershipId: membership.id, storeId });

      return NextResponse.json({
        success: true,
        data: membership,
      });
    } catch (error: unknown) {
      logger.error("[MEMBERSHIP_CREATE_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to create membership" },
        { status: 500 }
      );
    }
  }
);
