import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";
import { prisma } from "@/lib/prisma";

// GET /api/education/quizzes?lessonId=xxx - Get quizzes for a lesson
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

      const quizzes = await (prisma as any).educationQuiz.findMany({
        where,
        include: {
          lesson: {
            select: {
              id: true,
              title: true,
              moduleId: true,
            },
          },
          questions: {
            orderBy: { order: "asc" },
          },
          _count: {
            select: {
              attempts: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({
        success: true,
        data: quizzes,
      });
    } catch (error: unknown) {
      logger.error("[QUIZZES_GET_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to fetch quizzes" },
        { status: 500 }
      );
    }
  }
);

// POST /api/education/quizzes - Create a new quiz
export const POST = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string } }) => {
    try {
      const body = await req.json();
      const {
        lessonId,
        title,
        description,
        timeLimit,
        maxAttempts,
        passingScore,
        shuffleQuestions = false,
        showCorrectAnswers = true,
        questions,
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

      const quiz = await (prisma as any).educationQuiz.create({
        data: {
          lessonId,
          title,
          description,
          timeLimit,
          maxAttempts,
          passingScore: passingScore || 70,
          shuffleQuestions,
          showCorrectAnswers,
          questions: {
            create: questions?.map((q: any, index: number) => ({
              type: q.type || "multiple_choice",
              question: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
              points: q.points || 1,
              order: q.order || index,
            })),
          },
        },
        include: {
          questions: true,
        },
      });

      logger.info("[QUIZ_CREATED]", { quizId: quiz.id, lessonId, storeId });

      return NextResponse.json({
        success: true,
        data: quiz,
      });
    } catch (error: unknown) {
      logger.error("[QUIZ_CREATE_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to create quiz" },
        { status: 500 }
      );
    }
  }
);

// PUT /api/education/quizzes?id=xxx - Update a quiz
export const PUT = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const quizId = searchParams.get("id");

      if (!quizId) {
        return NextResponse.json(
          { success: false, error: "Quiz ID is required" },
          { status: 400 }
        );
      }

      const body = await req.json();
      const {
        title,
        description,
        timeLimit,
        maxAttempts,
        passingScore,
        shuffleQuestions,
        showCorrectAnswers,
        questions,
        isPublished,
      } = body;

      // Verify quiz exists and belongs to store
      const existing = await (prisma as any).educationQuiz.findFirst({
        where: {
          id: quizId,
          lesson: {
            module: {
              course: { storeId },
            },
          },
        },
      });

      if (!existing) {
        return NextResponse.json(
          { success: false, error: "Quiz not found" },
          { status: 404 }
        );
      }

      const updateData: Record<string, unknown> = {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(timeLimit !== undefined && { timeLimit }),
        ...(maxAttempts !== undefined && { maxAttempts }),
        ...(passingScore !== undefined && { passingScore }),
        ...(shuffleQuestions !== undefined && { shuffleQuestions }),
        ...(showCorrectAnswers !== undefined && { showCorrectAnswers }),
        ...(isPublished !== undefined && { isPublished }),
      };

      // Handle questions update if provided
      if (questions && Array.isArray(questions)) {
        // Delete existing questions and recreate
        await (prisma as any).educationQuizQuestion.deleteMany({
          where: { quizId },
        });

        updateData.questions = {
          create: questions.map((q: any, index: number) => ({
            type: q.type || "multiple_choice",
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            points: q.points || 1,
            order: q.order || index,
          })),
        };
      }

      const quiz = await (prisma as any).educationQuiz.update({
        where: { id: quizId },
        data: updateData,
        include: {
          questions: {
            orderBy: { order: "asc" },
          },
        },
      });

      logger.info("[QUIZ_UPDATED]", { quizId, storeId });

      return NextResponse.json({
        success: true,
        data: quiz,
      });
    } catch (error: unknown) {
      logger.error("[QUIZ_UPDATE_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to update quiz" },
        { status: 500 }
      );
    }
  }
);

// DELETE /api/education/quizzes?id=xxx - Delete a quiz
export const DELETE = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const quizId = searchParams.get("id");

      if (!quizId) {
        return NextResponse.json(
          { success: false, error: "Quiz ID is required" },
          { status: 400 }
        );
      }

      // Verify quiz exists and belongs to store
      const existing = await (prisma as any).educationQuiz.findFirst({
        where: {
          id: quizId,
          lesson: {
            module: {
              course: { storeId },
            },
          },
        },
        include: {
          _count: {
            select: { attempts: true },
          },
        },
      });

      if (!existing) {
        return NextResponse.json(
          { success: false, error: "Quiz not found" },
          { status: 404 }
        );
      }

      // Prevent deletion if there are attempts
      if (existing._count.attempts > 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Cannot delete quiz with existing attempts. Archive it instead." 
          },
          { status: 409 }
        );
      }

      // Delete questions first (cascade)
      await (prisma as any).educationQuizQuestion.deleteMany({
        where: { quizId },
      });

      await (prisma as any).educationQuiz.delete({
        where: { id: quizId },
      });

      logger.info("[QUIZ_DELETED]", { quizId, storeId });

      return NextResponse.json({
        success: true,
        message: "Quiz deleted successfully",
      });
    } catch (error: unknown) {
      logger.error("[QUIZ_DELETE_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to delete quiz" },
        { status: 500 }
      );
    }
  }
);
