import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";
import { prisma } from "@/lib/prisma";

// GET /api/education/lessons?moduleId=xxx - Get lessons for a module
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const moduleId = searchParams.get("moduleId");
      const courseId = searchParams.get("courseId");

      if (!moduleId && !courseId) {
        return NextResponse.json(
          { success: false, error: "moduleId or courseId is required" },
          { status: 400 }
        );
      }

      let where: Record<string, unknown> = {};

      if (moduleId) {
        where = {
          moduleId,
          module: {
            course: { storeId },
          },
        };
      } else {
        where = {
          module: {
            courseId,
            course: { storeId },
          },
        };
      }

      const lessons = await (prisma as any).educationLesson.findMany({
        where,
        include: {
          module: {
            select: {
              id: true,
              title: true,
              courseId: true,
            },
          },
          _count: {
            select: {
              assignments: true,
              quizzes: true,
            },
          },
        },
        orderBy: { order: "asc" },
      });

      return NextResponse.json({
        success: true,
        data: lessons,
      });
    } catch (error: unknown) {
      logger.error("[LESSONS_GET_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to fetch lessons" },
        { status: 500 }
      );
    }
  }
);

// POST /api/education/lessons - Create a new lesson
export const POST = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string } }) => {
    try {
      const body = await req.json();
      const {
        moduleId,
        title,
        description,
        type = "video",
        content,
        videoUrl,
        duration,
        order,
        isPublished = false,
        allowComments = true,
        resources,
      } = body;

      if (!moduleId || !title) {
        return NextResponse.json(
          { success: false, error: "moduleId and title are required" },
          { status: 400 }
        );
      }

      const module = await (prisma as any).educationModule.findFirst({
        where: {
          id: moduleId,
          course: { storeId },
        },
      });

      if (!module) {
        return NextResponse.json(
          { success: false, error: "Module not found" },
          { status: 404 }
        );
      }

      const lesson = await (prisma as any).educationLesson.create({
        data: {
          moduleId,
          title,
          description,
          type,
          content,
          videoUrl,
          duration,
          order: order || 0,
          isPublished,
          allowComments,
          resources,
        },
      });

      logger.info("[LESSON_CREATED]", { lessonId: lesson.id, moduleId, storeId });

      return NextResponse.json({
        success: true,
        data: lesson,
      });
    } catch (error: unknown) {
      logger.error("[LESSON_CREATE_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to create lesson" },
        { status: 500 }
      );
    }
  }
);
