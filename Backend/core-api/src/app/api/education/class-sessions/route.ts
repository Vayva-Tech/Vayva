import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";
import { z } from "zod";

const createClassSessionSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  instructorId: z.string().min(1, "Instructor ID is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  sessionType: z.enum(["live", "recorded", "hybrid"]).default("live"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  timezone: z.string().default("UTC"),
  meetingUrl: z.string().optional(),
  recordingUrl: z.string().optional(),
  capacity: z.number().min(1).default(30),
  materials: z.array(z.object({
    title: z.string(),
    url: z.string(),
    type: z.string(),
  })).optional(),
  notes: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.COURSES_VIEW,
  async (req: NextRequest, { storeId }: APIContext) => {
    try {
      const { searchParams } = new URL(req.url);
      const courseId = searchParams.get("courseId") || undefined;
      const instructorId = searchParams.get("instructorId") || undefined;
      const status = searchParams.get("status") || undefined;
      const fromDate = searchParams.get("from") || undefined;
      const toDate = searchParams.get("to") || undefined;
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "20");
      const skip = (page - 1) * limit;

      const where = {
        storeId,
        ...(courseId && { courseId }),
        ...(instructorId && { instructorId }),
        ...(status && { status }),
        ...(fromDate && toDate && {
          startTime: {
            gte: new Date(fromDate),
            lte: new Date(toDate),
          },
        }),
      };

      const [sessions, total] = await Promise.all([
        prisma.classSession.findMany({
          where,
          orderBy: { startTime: "asc" },
          skip,
          take: limit,
        }),
        prisma.classSession.count({ where }),
      ]);

      return NextResponse.json({
        data: sessions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      logger.error("[CLASS_SESSIONS_GET]", { error: String(error), storeId });
      return NextResponse.json(
        { error: "Failed to fetch class sessions" },
        { status: 500 },
      );
    }
  },
);

export const POST = withVayvaAPI(
  PERMISSIONS.COURSES_CREATE,
  async (req: NextRequest, { storeId }: APIContext) => {
    try {
      const body = await req.json();
      const validated = createClassSessionSchema.parse(body);

      const session = await prisma.classSession.create({
        data: {
          storeId,
          ...validated,
          startTime: new Date(validated.startTime),
          endTime: new Date(validated.endTime),
          materials: validated.materials || [],
        },
      });

      return NextResponse.json({ data: session }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation error", details: error.errors },
          { status: 400 },
        );
      }
      logger.error("[CLASS_SESSIONS_POST]", { error: String(error), storeId });
      return NextResponse.json(
        { error: "Failed to create class session" },
        { status: 500 },
      );
    }
  },
);
