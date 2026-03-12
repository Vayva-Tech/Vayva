import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";
import { z } from "zod";

const createGradeSchema = z.object({
  enrollmentId: z.string().min(1),
  courseId: z.string().min(1),
  studentId: z.string().min(1),
  assessmentId: z.string().optional(),
  gradeItem: z.string().min(1),
  score: z.number().min(0),
  maxScore: z.number().min(0).default(100),
  letterGrade: z.string().optional(),
  weight: z.number().default(100),
  notes: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.ENROLLMENTS_VIEW,
  async (req: NextRequest, { storeId }: APIContext) => {
    try {
      const { searchParams } = new URL(req.url);
      const studentId = searchParams.get("studentId") || undefined;
      const courseId = searchParams.get("courseId") || undefined;
      const enrollmentId = searchParams.get("enrollmentId") || undefined;
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "50");
      const skip = (page - 1) * limit;

      const where = {
        storeId,
        ...(studentId && { studentId }),
        ...(courseId && { courseId }),
        ...(enrollmentId && { enrollmentId }),
      };

      const [grades, total] = await Promise.all([
        prisma.grade.findMany({
          where,
          orderBy: { enteredAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.grade.count({ where }),
      ]);

      return NextResponse.json({
        data: grades,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      logger.error("[GRADES_GET]", { error: String(error), storeId });
      return NextResponse.json(
        { error: "Failed to fetch grades" },
        { status: 500 },
      );
    }
  },
);

export const POST = withVayvaAPI(
  PERMISSIONS.ENROLLMENTS_CREATE,
  async (req: NextRequest, { storeId, user }: APIContext) => {
    try {
      const body = await req.json();
      const validated = createGradeSchema.parse(body);

      const percentage = (validated.score / validated.maxScore) * 100;
      const weightedScore = (validated.score * validated.weight) / 100;

      const grade = await prisma.grade.create({
        data: {
          storeId,
          ...validated,
          percentage: new Decimal(percentage),
          weightedScore: new Decimal(weightedScore),
          enteredBy: user.id,
        },
      });

      return NextResponse.json({ data: grade }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation error", details: error.errors },
          { status: 400 },
        );
      }
      logger.error("[GRADES_POST]", { error: String(error), storeId });
      return NextResponse.json(
        { error: "Failed to record grade" },
        { status: 500 },
      );
    }
  },
);

import { Decimal } from "@prisma/client/runtime/library";
