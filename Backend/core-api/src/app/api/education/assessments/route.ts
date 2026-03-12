import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";
import { z } from "zod";

const createAssessmentSchema = z.object({
  courseId: z.string().min(1),
  instructorId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(["quiz", "exam", "assignment", "project", "presentation"]).default("assignment"),
  instructions: z.string().optional(),
  maxScore: z.number().min(1).default(100),
  passingScore: z.number().min(0).default(60),
  weight: z.number().min(0).max(100).default(100),
  dueDate: z.string().optional(),
  timeLimit: z.number().optional(),
  maxAttempts: z.number().min(1).default(1),
  allowLateSubmission: z.boolean().default(false),
  rubric: z.array(z.object({
    criteria: z.string(),
    maxPoints: z.number(),
    description: z.string(),
  })).optional(),
  questions: z.array(z.object({
    id: z.string(),
    question: z.string(),
    type: z.enum(["multiple_choice", "short_answer", "essay"]),
    options: z.array(z.string()).optional(),
    correctAnswer: z.string().optional(),
    points: z.number(),
  })).optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.ENROLLMENTS_VIEW,
  async (req: NextRequest, { storeId }: APIContext) => {
    try {
      const { searchParams } = new URL(req.url);
      const courseId = searchParams.get("courseId") || undefined;
      const type = searchParams.get("type") || undefined;
      const isPublished = searchParams.get("isPublished") === "true" || undefined;
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "20");
      const skip = (page - 1) * limit;

      const where = {
        storeId,
        ...(courseId && { courseId }),
        ...(type && { type: type as "quiz" | "exam" | "assignment" | "project" | "presentation" }),
        ...(isPublished !== undefined && { isPublished }),
      };

      const [assessments, total] = await Promise.all([
        prisma.assessment.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.assessment.count({ where }),
      ]);

      return NextResponse.json({
        data: assessments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      logger.error("[ASSESSMENTS_GET]", { error: String(error), storeId });
      return NextResponse.json(
        { error: "Failed to fetch assessments" },
        { status: 500 },
      );
    }
  },
);

export const POST = withVayvaAPI(
  PERMISSIONS.ENROLLMENTS_CREATE,
  async (req: NextRequest, { storeId }: APIContext) => {
    try {
      const body = await req.json();
      const validated = createAssessmentSchema.parse(body);

      const assessment = await prisma.assessment.create({
        data: {
          storeId,
          ...validated,
          dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
          rubric: validated.rubric || [],
          questions: validated.questions || [],
          weight: validated.weight,
        },
      });

      return NextResponse.json({ data: assessment }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation error", details: error.errors },
          { status: 400 },
        );
      }
      logger.error("[ASSESSMENTS_POST]", { error: String(error), storeId });
      return NextResponse.json(
        { error: "Failed to create assessment" },
        { status: 500 },
      );
    }
  },
);
