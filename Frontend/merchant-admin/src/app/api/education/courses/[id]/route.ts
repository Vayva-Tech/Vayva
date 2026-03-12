import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";
import { prisma } from "@/lib/prisma";

// GET /api/education/courses/[id] - Get a single course
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, context: APIContext) => {
    const { storeId } = context;
    const params = await context.params;
    const id = params.id;
    try {
      const course = await (prisma as any).educationCourse.findFirst({
        where: {
          id,
          storeId,
        },
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              bio: true,
            },
          },
          modules: {
            orderBy: { order: "asc" },
            include: {
              lessons: {
                orderBy: { order: "asc" },
                select: {
                  id: true,
                  title: true,
                  type: true,
                  duration: true,
                  isPublished: true,
                  order: true,
                },
              },
              _count: {
                select: {
                  lessons: true,
                },
              },
            },
          },
          _count: {
            select: {
              enrollments: true,
              modules: true,
            },
          },
        },
      });

      if (!course) {
        return NextResponse.json(
          { success: false, error: "Course not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: course,
      });
    } catch (error: unknown) {
      logger.error("[COURSE_GET_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        courseId: params.id,
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to fetch course" },
        { status: 500 }
      );
    }
  }
);

// PUT /api/education/courses/[id] - Update a course
export const PUT = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req: NextRequest, context: APIContext) => {
    const { storeId } = context;
    const params = await context.params;
    const id = params.id;
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
      } = body;

      const existingCourse = await (prisma as any).educationCourse.findFirst({
        where: { id, storeId },
      });

      if (!existingCourse) {
        return NextResponse.json(
          { success: false, error: "Course not found" },
          { status: 404 }
        );
      }

      const course = await (prisma as any).educationCourse.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(category !== undefined && { category }),
          ...(level !== undefined && { level }),
          ...(price !== undefined && { price }),
          ...(compareAtPrice !== undefined && { compareAtPrice }),
          ...(duration !== undefined && { duration }),
          ...(instructorId !== undefined && { instructorId }),
          ...(thumbnail !== undefined && { thumbnail }),
          ...(status !== undefined && { status }),
          ...(isPublic !== undefined && { isPublic }),
          ...(requiresEnrollment !== undefined && { requiresEnrollment }),
          ...(maxStudents !== undefined && { maxStudents }),
          ...(startDate !== undefined && { startDate }),
          ...(endDate !== undefined && { endDate }),
          ...(certificateEnabled !== undefined && { certificateEnabled }),
          ...(prerequisites !== undefined && { prerequisites }),
          ...(learningObjectives !== undefined && { learningObjectives }),
          ...(tags !== undefined && { tags }),
          updatedBy: context.user.id,
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

      logger.info("[COURSE_UPDATED]", { courseId: id, storeId, userId: context.user.id });

      return NextResponse.json({
        success: true,
        data: course,
      });
    } catch (error: unknown) {
      const { storeId } = context;
      const params = await context.params;
      const id = params.id;
      logger.error("[COURSE_UPDATE_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        courseId: id,
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to update course" },
        { status: 500 }
      );
    }
  }
);

// DELETE /api/education/courses/[id] - Delete a course
export const DELETE = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req: NextRequest, context: APIContext) => {
    try {
      const { storeId } = context;
      const params = await context.params;
      const id = params.id;
      const existingCourse = await (prisma as any).educationCourse.findFirst({
        where: { id, storeId },
      });

      if (!existingCourse) {
        return NextResponse.json(
          { success: false, error: "Course not found" },
          { status: 404 }
        );
      }

      await (prisma as any).educationCourse.delete({
        where: { id },
      });

      logger.info("[COURSE_DELETED]", { courseId: id, storeId });

      return NextResponse.json({
        success: true,
        message: "Course deleted successfully",
      });
    } catch (error: unknown) {
      const { storeId } = context;
      const params = await context.params;
      const id = params.id;
      logger.error("[COURSE_DELETE_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        courseId: id,
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to delete course" },
        { status: 500 }
      );
    }
  }
);
