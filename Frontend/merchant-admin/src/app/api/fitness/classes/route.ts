import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";
import { prisma } from "@/lib/prisma";

// GET /api/fitness/classes - Get all fitness classes
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");
      const status = searchParams.get("status");
      const instructorId = searchParams.get("instructorId");

      const where: Record<string, unknown> = { storeId };

      if (status) {
        where.status = status;
      }

      if (instructorId) {
        where.instructorId = instructorId;
      }

      const [classes, total] = await Promise.all([
        (prisma as any).fitnessClass.findMany({
          where,
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            _count: {
              select: {
                bookings: true,
              },
            },
          },
          orderBy: { schedule: "asc" },
          skip: offset,
          take: limit,
        }),
        (prisma as any).fitnessClass.count({ where }),
      ]);

      return NextResponse.json({
        success: true,
        data: classes,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + classes.length < total,
        },
      });
    } catch (error: unknown) {
      logger.error("[CLASSES_GET_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to fetch classes" },
        { status: 500 }
      );
    }
  }
);

// POST /api/fitness/classes - Create a new fitness class
export const POST = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string } }) => {
    try {
      const body = await req.json();
      const {
        name,
        description,
        instructorId,
        schedule,
        duration,
        maxCapacity,
        location,
        equipmentNeeded,
        difficultyLevel,
        status = "scheduled",
      } = body;

      if (!name || !schedule) {
        return NextResponse.json(
          { success: false, error: "Name and schedule are required" },
          { status: 400 }
        );
      }

      const fitnessClass = await (prisma as any).fitnessClass.create({
        data: {
          storeId,
          name,
          description,
          instructorId,
          schedule: new Date(schedule),
          duration: duration || 60,
          maxCapacity: maxCapacity || 20,
          location,
          equipmentNeeded: equipmentNeeded || [],
          difficultyLevel: difficultyLevel || "all_levels",
          status,
          createdBy: user.id,
        },
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      logger.info("[CLASS_CREATED]", { classId: fitnessClass.id, storeId });

      return NextResponse.json({
        success: true,
        data: fitnessClass,
      });
    } catch (error: unknown) {
      logger.error("[CLASS_CREATE_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to create class" },
        { status: 500 }
      );
    }
  }
);
