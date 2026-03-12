import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";
import { z } from "zod";

const createStudentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  grade: z.string().optional(),
  emergencyContact: z.object({
    name: z.string(),
    phone: z.string(),
    relationship: z.string(),
  }).optional(),
  guardianInfo: z.object({
    name: z.string(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  }).optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_VIEW,
  async (req: NextRequest, { storeId }: APIContext) => {
    try {
      const { searchParams } = new URL(req.url);
      const status = searchParams.get("status") || undefined;
      const grade = searchParams.get("grade") || undefined;
      const search = searchParams.get("search") || "";
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "20");
      const skip = (page - 1) * limit;

      const where = {
        storeId,
        ...(status && { status }),
        ...(grade && { grade }),
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: "insensitive" as const } },
            { lastName: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { studentId: { contains: search, mode: "insensitive" as const } },
          ],
        }),
      };

      const [students, total] = await Promise.all([
        prisma.student.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.student.count({ where }),
      ]);

      return NextResponse.json({
        data: students,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      logger.error("[STUDENTS_GET] Failed to fetch students", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch students" },
        { status: 500 },
      );
    }
  },
);

export const POST = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_CREATE,
  async (req: NextRequest, { storeId, user }: APIContext) => {
    try {
      const body = await req.json();
      const validated = createStudentSchema.parse(body);

      const studentId = `STU-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      const student = await prisma.student.create({
        data: {
          storeId,
          ...validated,
          studentId,
          userId: user.id || "",
          dateOfBirth: validated.dateOfBirth ? new Date(validated.dateOfBirth) : null,
          totalEnrollments: 0,
          completedCourses: 0,
        },
      });

      return NextResponse.json({ data: student }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation error", details: error.errors },
          { status: 400 },
        );
      }
      logger.error("[STUDENTS_POST] Failed to create student", { error, storeId });
      return NextResponse.json(
        { error: "Failed to create student" },
        { status: 500 },
      );
    }
  },
);
