import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";
import { prisma } from "@/lib/prisma";

// GET /api/education/courses - Get all courses for the merchant
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");
      const status = searchParams.get("status");
      const search = searchParams.get("search");
      const category = searchParams.get("category");
      const instructorId = searchParams.get("instructorId");

      const where: Record<string, unknown> = { storeId };

      if (status) {
        where.status = status;
      }

      if (category) {
        where.category = category;
      }

      if (instructorId) {
        where.instructorId = instructorId;
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      const [courses, total] = await Promise.all([
        (prisma as any).educationCourse.findMany({
          where,
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
            _count: {
              select: {
                modules: true,
                enrollments: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip: offset,
          take: limit,
        }),
        (prisma as any).educationCourse.count({ where }),
      ]);

      return NextResponse.json({
        success: true,
        data: courses,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + courses.length < total,
        },
      });
    } catch (error: unknown) {
      logger.error("[COURSES_GET_ERROR] Failed to fetch courses", {
        error: error instanceof Error ? error.message : String(error),
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to fetch courses" },
        { status: 500 }
      );
    }
  }
);

// POST /api/education/courses - Create a new course
export const POST = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req: NextRequest, context: APIContext) => {
    const { storeId, user } = context;
    try {
      const body = await req.json();
      const {
        title,
        description,
        category,
        level,
        price,
        compareAtPrice,
        duration,
        instructorId,
        thumbnail,
        status = "draft",
        isPublic = false,
        requiresEnrollment = true,
        maxStudents,
        startDate,
        endDate,
        certificateEnabled = false,
        prerequisites,
        learningObjectives,
        tags,
      } = body;

      if (!title || !category) {
        return NextResponse.json(
          { success: false, error: "Course title and category are required" },
          { status: 400 }
        );
      }

      const course = await (prisma as any).educationCourse.create({
        data: {
          storeId,
          title,
          description,
          category,
          level: level || "beginner",
          price: price || 0,
          compareAtPrice,
          duration,
          instructorId,
          thumbnail,
          status,
          isPublic,
          requiresEnrollment,
          maxStudents,
          startDate,
          endDate,
          certificateEnabled,
          prerequisites,
          learningObjectives,
          tags,
          createdBy: user.id,
        },
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      });

      logger.info("[COURSE_CREATED]", { courseId: course.id, storeId, userId: user.id });

      return NextResponse.json({
        success: true,
        data: course,
      });
    } catch (error: unknown) {
      logger.error("[COURSE_CREATE_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to create course" },
        { status: 500 }
      );
    }
  }
);
