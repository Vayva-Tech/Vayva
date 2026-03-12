import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";
import { prisma } from "@/lib/prisma";

// GET /api/education/assignments?lessonId=xxx - Get assignments for a lesson
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const lessonId = searchParams.get("lessonId");
      const courseId = searchParams.get("courseId");

      let where: Record<string, unknown> = {};

      if (lessonId) {
        where = {
          lessonId,
          lesson: {
            module: {
              course: { storeId },
            },
          },
        };
      } else if (courseId) {
        where = {
          lesson: {
            module: {
              courseId,
              course: { storeId },
            },
          },
        };
      } else {
        return NextResponse.json(
          { success: false, error: "lessonId or courseId is required" },
          { status: 400 }
        );
      }

      const assignments = await (prisma as any).educationAssignment.findMany({
        where,
        include: {
          lesson: {
            select: {
              id: true,
              title: true,
              moduleId: true,
            },
          },
          _count: {
            select: {
              submissions: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({
        success: true,
        data: assignments,
      });
    } catch (error: unknown) {
      logger.error("[ASSIGNMENTS_GET_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to fetch assignments" },
        { status: 500 }
      );
    }
  }
);

// POST /api/education/assignments - Create a new assignment
export const POST = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string } }) => {
    try {
      const body = await req.json();
      const {
        lessonId,
        title,
        description,
        instructions,
        type = "essay",
        maxScore,
        dueDate,
        allowLateSubmission = false,
        attachments,
        rubric,
      } = body;

      if (!lessonId || !title) {
        return NextResponse.json(
          { success: false, error: "lessonId and title are required" },
          { status: 400 }
        );
      }

      const lesson = await (prisma as any).educationLesson.findFirst({
        where: {
          id: lessonId,
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

      const assignment = await (prisma as any).educationAssignment.create({
        data: {
          lessonId,
          title,
          description,
          instructions,
          type,
          maxScore: maxScore || 100,
          dueDate,
          allowLateSubmission,
          attachments,
          rubric,
        },
      });

      logger.info("[ASSIGNMENT_CREATED]", { assignmentId: assignment.id, lessonId, storeId });

      return NextResponse.json({
        success: true,
        data: assignment,
      });
    } catch (error: unknown) {
      logger.error("[ASSIGNMENT_CREATE_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to create assignment" },
        { status: 500 }
      );
    }
  }
);

// PUT /api/education/assignments?id=xxx - Update an assignment
export const PUT = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const assignmentId = searchParams.get("id");

      if (!assignmentId) {
        return NextResponse.json(
          { success: false, error: "Assignment ID is required" },
          { status: 400 }
        );
      }

      const body = await req.json();
      const {
        title,
        description,
        instructions,
        type,
        maxScore,
        dueDate,
        allowLateSubmission,
        attachments,
        rubric,
        isPublished,
      } = body;

      // Verify assignment exists and belongs to store
      const existing = await (prisma as any).educationAssignment.findFirst({
        where: {
          id: assignmentId,
          lesson: {
            module: {
              course: { storeId },
            },
          },
        },
      });

      if (!existing) {
        return NextResponse.json(
          { success: false, error: "Assignment not found" },
          { status: 404 }
        );
      }

      const assignment = await (prisma as any).educationAssignment.update({
        where: { id: assignmentId },
        data: {
          ...(title && { title }),
          ...(description !== undefined && { description }),
          ...(instructions !== undefined && { instructions }),
          ...(type && { type }),
          ...(maxScore !== undefined && { maxScore }),
          ...(dueDate !== undefined && { dueDate }),
          ...(allowLateSubmission !== undefined && { allowLateSubmission }),
          ...(attachments !== undefined && { attachments }),
          ...(rubric !== undefined && { rubric }),
          ...(isPublished !== undefined && { isPublished }),
        },
      });

      logger.info("[ASSIGNMENT_UPDATED]", { assignmentId, storeId });

      return NextResponse.json({
        success: true,
        data: assignment,
      });
    } catch (error: unknown) {
      logger.error("[ASSIGNMENT_UPDATE_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to update assignment" },
        { status: 500 }
      );
    }
  }
);

// DELETE /api/education/assignments?id=xxx - Delete an assignment
export const DELETE = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const assignmentId = searchParams.get("id");

      if (!assignmentId) {
        return NextResponse.json(
          { success: false, error: "Assignment ID is required" },
          { status: 400 }
        );
      }

      // Verify assignment exists and belongs to store
      const existing = await (prisma as any).educationAssignment.findFirst({
        where: {
          id: assignmentId,
          lesson: {
            module: {
              course: { storeId },
            },
          },
        },
        include: {
          _count: {
            select: { submissions: true },
          },
        },
      });

      if (!existing) {
        return NextResponse.json(
          { success: false, error: "Assignment not found" },
          { status: 404 }
        );
      }

      // Prevent deletion if there are submissions
      if (existing._count.submissions > 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Cannot delete assignment with existing submissions. Archive it instead." 
          },
          { status: 409 }
        );
      }

      await (prisma as any).educationAssignment.delete({
        where: { id: assignmentId },
      });

      logger.info("[ASSIGNMENT_DELETED]", { assignmentId, storeId });

      return NextResponse.json({
        success: true,
        message: "Assignment deleted successfully",
      });
    } catch (error: unknown) {
      logger.error("[ASSIGNMENT_DELETE_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to delete assignment" },
        { status: 500 }
      );
    }
  }
);
