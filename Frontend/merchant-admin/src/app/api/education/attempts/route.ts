import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";
import { prisma } from "@/lib/prisma";

// GET /api/education/attempts?quizId=xxx - Get quiz attempts
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const quizId = searchParams.get("quizId");
      const studentId = searchParams.get("studentId");

      if (!quizId) {
        return NextResponse.json(
          { success: false, error: "quizId is required" },
          { status: 400 }
        );
      }

      // Verify quiz belongs to store
      const quiz = await (prisma as any).educationQuiz.findFirst({
        where: {
          id: quizId,
          lesson: {
            module: {
              course: { storeId },
            },
          },
        },
      });

      if (!quiz) {
        return NextResponse.json(
          { success: false, error: "Quiz not found" },
          { status: 404 }
        );
      }

      const where: Record<string, unknown> = { quizId };
      if (studentId) {
        where.studentId = studentId;
      }

      const attempts = await (prisma as any).educationQuizAttempt.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          quiz: {
            select: {
              id: true,
              title: true,
              passingScore: true,
              maxScore: true,
            },
          },
          answers: {
            include: {
              question: {
                select: {
                  id: true,
                  question: true,
                  correctAnswer: true,
                  points: true,
                },
              },
            },
          },
        },
        orderBy: { startedAt: "desc" },
      });

      return NextResponse.json({
        success: true,
        data: attempts,
      });
    } catch (error: unknown) {
      logger.error("[ATTEMPTS_GET_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to fetch quiz attempts" },
        { status: 500 }
      );
    }
  }
);

// POST /api/education/attempts - Start or submit a quiz attempt
export const POST = withVayvaAPI(
  PERMISSIONS.STORE_VIEW,
  async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string } }) => {
    try {
      const body = await req.json();
      const { quizId, action, answers } = body;

      if (!quizId || !action) {
        return NextResponse.json(
          { success: false, error: "quizId and action are required" },
          { status: 400 }
        );
      }

      // Verify quiz exists and belongs to store
      const quiz = await (prisma as any).educationQuiz.findFirst({
        where: {
          id: quizId,
          lesson: {
            module: {
              course: { storeId },
            },
          },
        },
        include: {
          questions: {
            orderBy: { order: "asc" },
          },
          _count: {
            select: { attempts: true },
          },
        },
      });

      if (!quiz) {
        return NextResponse.json(
          { success: false, error: "Quiz not found" },
          { status: 404 }
        );
      }

      if (!quiz.isPublished) {
        return NextResponse.json(
          { success: false, error: "This quiz is not available" },
          { status: 403 }
        );
      }

      // Check max attempts
      const studentAttempts = await (prisma as any).educationQuizAttempt.count({
        where: {
          quizId,
          studentId: user.id,
        },
      });

      if (quiz.maxAttempts && studentAttempts >= quiz.maxAttempts) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Maximum attempts (${quiz.maxAttempts}) reached` 
          },
          { status: 403 }
        );
      }

      if (action === "start") {
        // Check for existing incomplete attempt
        const existingAttempt = await (prisma as any).educationQuizAttempt.findFirst({
          where: {
            quizId,
            studentId: user.id,
            status: "IN_PROGRESS",
          },
        });

        if (existingAttempt) {
          return NextResponse.json({
            success: true,
            data: existingAttempt,
            message: "Resuming existing attempt",
          });
        }

        // Create new attempt
        const attempt = await (prisma as any).educationQuizAttempt.create({
          data: {
            quizId,
            studentId: user.id,
            startedAt: new Date(),
            status: "IN_PROGRESS",
            attemptNumber: studentAttempts + 1,
          },
          include: {
            quiz: {
              select: {
                id: true,
                title: true,
                timeLimit: true,
                questions: {
                  orderBy: { order: "asc" },
                  select: {
                    id: true,
                    type: true,
                    question: true,
                    options: true,
                    points: true,
                    order: true,
                  },
                },
              },
            },
          },
        });

        logger.info("[QUIZ_ATTEMPT_STARTED]", { 
          attemptId: attempt.id, 
          quizId, 
          studentId: user.id,
          storeId 
        });

        return NextResponse.json({
          success: true,
          data: attempt,
        });
      }

      if (action === "submit") {
        if (!answers || !Array.isArray(answers)) {
          return NextResponse.json(
            { success: false, error: "answers array is required for submission" },
            { status: 400 }
          );
        }

        // Find the in-progress attempt
        const attempt = await (prisma as any).educationQuizAttempt.findFirst({
          where: {
            quizId,
            studentId: user.id,
            status: "IN_PROGRESS",
          },
        });

        if (!attempt) {
          return NextResponse.json(
            { success: false, error: "No active quiz attempt found" },
            { status: 404 }
          );
        }

        // Check time limit
        if (quiz.timeLimit) {
          const elapsedMinutes = (Date.now() - new Date(attempt.startedAt).getTime()) / 60000;
          if (elapsedMinutes > quiz.timeLimit) {
            return NextResponse.json(
              { success: false, error: "Time limit exceeded" },
              { status: 403 }
            );
          }
        }

        // Calculate score
        let totalScore = 0;
        let maxScore = 0;
        const answerRecords = [];

        for (const question of quiz.questions) {
          maxScore += question.points;
          const studentAnswer = answers.find((a: any) => a.questionId === question.id);
          
          let isCorrect = false;
          let score = 0;
          
          if (studentAnswer) {
            if (question.type === "multiple_choice") {
              isCorrect = studentAnswer.answer === question.correctAnswer;
            } else if (question.type === "true_false") {
              isCorrect = studentAnswer.answer === question.correctAnswer;
            } else if (question.type === "short_answer") {
              // For short answer, mark as correct if provided (manual grading)
              isCorrect = false;
            }
            score = isCorrect ? question.points : 0;
          }
          
          totalScore += score;
          
          answerRecords.push({
            attemptId: attempt.id,
            questionId: question.id,
            answer: studentAnswer?.answer || "",
            isCorrect,
            points: score,
          });
        }

        const percentageScore = Math.round((totalScore / maxScore) * 100);
        const passed = percentageScore >= quiz.passingScore;

        // Save answers
        await (prisma as any).educationQuizAnswer.createMany({
          data: answerRecords,
        });

        // Update attempt
        const updatedAttempt = await (prisma as any).educationQuizAttempt.update({
          where: { id: attempt.id },
          data: {
            status: "COMPLETED",
            submittedAt: new Date(),
            score: totalScore,
            maxScore,
            percentageScore,
            passed,
            timeSpentSeconds: Math.floor(
              (Date.now() - new Date(attempt.startedAt).getTime()) / 1000
            ),
          },
          include: {
            answers: {
              include: {
                question: {
                  select: {
                    id: true,
                    question: true,
                    correctAnswer: true,
                    explanation: true,
                    points: true,
                  },
                },
              },
            },
            quiz: {
              select: {
                id: true,
                title: true,
                passingScore: true,
                showCorrectAnswers: true,
              },
            },
          },
        });

        logger.info("[QUIZ_ATTEMPT_SUBMITTED]", { 
          attemptId: attempt.id, 
          quizId, 
          studentId: user.id,
          score: totalScore,
          maxScore,
          passed,
          storeId 
        });

        return NextResponse.json({
          success: true,
          data: updatedAttempt,
        });
      }

      return NextResponse.json(
        { success: false, error: "Invalid action. Use 'start' or 'submit'" },
        { status: 400 }
      );
    } catch (error: unknown) {
      logger.error("[QUIZ_ATTEMPT_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to process quiz attempt" },
        { status: 500 }
      );
    }
  }
);

// PUT /api/education/attempts?id=xxx - Update attempt (for admin adjustments)
export const PUT = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const attemptId = searchParams.get("id");

      if (!attemptId) {
        return NextResponse.json(
          { success: false, error: "Attempt ID is required" },
          { status: 400 }
        );
      }

      const body = await req.json();
      const { score, status, notes } = body;

      // Verify attempt exists and belongs to store
      const existing = await (prisma as any).educationQuizAttempt.findFirst({
        where: {
          id: attemptId,
          quiz: {
            lesson: {
              module: {
                course: { storeId },
              },
            },
          },
        },
        include: {
          quiz: true,
        },
      });

      if (!existing) {
        return NextResponse.json(
          { success: false, error: "Attempt not found" },
          { status: 404 }
        );
      }

      const updateData: Record<string, unknown> = {};

      if (score !== undefined) {
        const percentageScore = Math.round((score / existing.maxScore) * 100);
        updateData.score = score;
        updateData.percentageScore = percentageScore;
        updateData.passed = percentageScore >= existing.quiz.passingScore;
      }

      if (status) {
        updateData.status = status;
      }

      if (notes !== undefined) {
        updateData.notes = notes;
      }

      const attempt = await (prisma as any).educationQuizAttempt.update({
        where: { id: attemptId },
        data: updateData,
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          quiz: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      logger.info("[QUIZ_ATTEMPT_UPDATED]", { 
        attemptId, 
        storeId,
        updates: Object.keys(updateData),
      });

      return NextResponse.json({
        success: true,
        data: attempt,
      });
    } catch (error: unknown) {
      logger.error("[QUIZ_ATTEMPT_UPDATE_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to update quiz attempt" },
        { status: 500 }
      );
    }
  }
);
