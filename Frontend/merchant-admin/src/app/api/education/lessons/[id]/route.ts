import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";
import { prisma } from "@/lib/prisma";

// PUT /api/education/lessons/[id] - Update a lesson
export const PUT = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req: NextRequest, context: APIContext) => {
    const { storeId, user } = context;
    const params = await context.params;
    const id = params.id;
    try {
      const body = await req.json();
      const {
        title,
        description,
        type,
        content,
        videoUrl,
        duration,
        order,
        isPublished,
        allowComments,
        resources,
      } = body;

      const lesson = await (prisma as any).educationLesson.findFirst({
        where: {
          id,
          module: {
            course: { storeId },
          },
        },
      });

      if (!lesson) {
        return NextResponse.json(
          { success: false, error: "Lesson not found" },
          { status: 404 }
        );
      }

      const updatedLesson = await (prisma as any).educationLesson.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(type !== undefined && { type }),
          ...(content !== undefined && { content }),
          ...(videoUrl !== undefined && { videoUrl }),
          ...(duration !== undefined && { duration }),
          ...(order !== undefined && { order }),
          ...(isPublished !== undefined && { isPublished }),
          ...(allowComments !== undefined && { allowComments }),
          ...(resources !== undefined && { resources }),
        },
      });

      logger.info("[LESSON_UPDATED]", { lessonId: id, storeId, userId: user.id });

      return NextResponse.json({
        success: true,
        data: updatedLesson,
      });
    } catch (error: unknown) {
      logger.error("[LESSON_UPDATE_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        lessonId: id,
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to update lesson" },
        { status: 500 }
      );
    }
  }
);

// DELETE /api/education/lessons/[id] - Delete a lesson
export const DELETE = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req: NextRequest, context: APIContext) => {
    const { storeId, user } = context;
    const params = await context.params;
    const id = params.id;
    try {
      const lesson = await (prisma as any).educationLesson.findFirst({
        where: {
          id,
          module: {
            course: { storeId },
          },
        },
      });

      if (!lesson) {
        return NextResponse.json(
          { success: false, error: "Lesson not found" },
          { status: 404 }
        );
      }

      await (prisma as any).educationLesson.delete({
        where: { id },
      });

      logger.info("[LESSON_DELETED]", { lessonId: id, storeId, userId: user.id });

      return NextResponse.json({
        success: true,
        message: "Lesson deleted successfully",
      });
    } catch (error: unknown) {
      logger.error("[LESSON_DELETE_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        lessonId: id,
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to delete lesson" },
        { status: 500 }
      );
    }
  }
);
