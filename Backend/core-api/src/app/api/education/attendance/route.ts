import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";
import { z } from "zod";

const markAttendanceSchema = z.object({
  sessionId: z.string().min(1),
  studentId: z.string().min(1),
  status: z.enum(["present", "absent", "late", "excused"]),
  checkInTime: z.string().optional(),
  notes: z.string().optional(),
  excuseReason: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.ENROLLMENTS_VIEW,
  async (req: NextRequest, { storeId }: APIContext) => {
    try {
      const { searchParams } = new URL(req.url);
      const sessionId = searchParams.get("sessionId") || undefined;
      const studentId = searchParams.get("studentId") || undefined;
      const status = searchParams.get("status") || undefined;
      const date = searchParams.get("date") || undefined;
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "50");
      const skip = (page - 1) * limit;

      const where: any = {
        storeId,
        ...(status && { status: status as any }),
        ...(studentId && { studentId }),
        ...(sessionId && { sessionId }),
        ...(date && {
          markedAt: {
            gte: new Date(date),
            lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
          },
        }),
      };

      const [attendance, total] = await Promise.all([
        prisma.attendance.findMany({
          where,
          orderBy: { markedAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.attendance.count({ where }),
      ]);

      return NextResponse.json({
        data: attendance,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      logger.error("[ATTENDANCE_GET]", { error: String(error), storeId });
      return NextResponse.json(
        { error: "Failed to fetch attendance records" },
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
      const validated = markAttendanceSchema.parse(body);

      const attendance = await prisma.attendance.create({
        data: {
          storeId,
          ...validated,
          checkInTime: validated.checkInTime ? new Date(validated.checkInTime) : null,
          markedBy: user.id,
        },
      });

      return NextResponse.json({ data: attendance }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation error", details: error.errors },
          { status: 400 },
        );
      }
      logger.error("[ATTENDANCE_POST]", { error: String(error), storeId });
      return NextResponse.json(
        { error: "Failed to mark attendance" },
        { status: 500 },
      );
    }
  },
);
