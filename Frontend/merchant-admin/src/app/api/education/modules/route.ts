import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";
import { prisma } from "@/lib/prisma";

// GET /api/education/modules?courseId=xxx - Get modules for a course
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const courseId = searchParams.get("courseId");

      if (!courseId) {
        return NextResponse.json(
          { success: false, error: "courseId is required" },
          { status: 400 }
        );
      }

      const modules = await (prisma as any).educationModule.findMany({
        where: {
          courseId,
          course: { storeId },
        },
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
        orderBy: { order: "asc" },
      });

      return NextResponse.json({
        success: true,
        data: modules,
      });
    } catch (error: unknown) {
      logger.error("[MODULES_GET_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to fetch modules" },
        { status: 500 }
      );
    }
  }
);

// POST /api/education/modules - Create a new module
export const POST = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req: NextRequest, context: APIContext) => {
    const { storeId } = context;
    try {
      const body = await req.json();
      const {
        courseId,
        title,
        description,
        order,
        isPublished = false,
      } = body;

      if (!courseId || !title) {
        return NextResponse.json(
          { success: false, error: "courseId and title are required" },
          { status: 400 }
        );
      }

      const course = await (prisma as any).educationCourse.findFirst({
        where: { id: courseId, storeId },
      });

      if (!course) {
        return NextResponse.json(
          { success: false, error: "Course not found" },
          { status: 404 }
        );
      }

      const module = await (prisma as any).educationModule.create({
        data: {
          courseId,
          title,
          description,
          order: order || 0,
          isPublished,
        },
      });

      logger.info("[MODULE_CREATED]", { moduleId: module.id, courseId, storeId });

      return NextResponse.json({
        success: true,
        data: module,
      });
    } catch (error: unknown) {
      logger.error("[MODULE_CREATE_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to create module" },
        { status: 500 }
      );
    }
  }
);
