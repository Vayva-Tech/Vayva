import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const InstructorQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(["active", "inactive", "on_leave"]).optional(),
  specialty: z.string().optional(),
  certification: z.string().optional(),
  minExperience: z.coerce.number().optional(),
  maxExperience: z.coerce.number().optional(),
  search: z.string().optional(),
});

const InstructorCreateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  specialty: z.string().min(1),
  certifications: z.array(z.string()).default([]),
  yearsOfExperience: z.number().int().min(0),
  hourlyRate: z.number().positive(),
  availability: z.object({
    monday: z.array(z.string()).default([]),
    tuesday: z.array(z.string()).default([]),
    wednesday: z.array(z.string()).default([]),
    thursday: z.array(z.string()).default([]),
    friday: z.array(z.string()).default([]),
    saturday: z.array(z.string()).default([]),
    sunday: z.array(z.string()).default([]),
  }).default({}),
  languages: z.array(z.string()).default(["English"]),
  insuranceVerified: z.boolean().default(false),
  backgroundCheckCompleted: z.boolean().default(false),
  notes: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.INSTRUCTORS_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      const parseResult = InstructorQuerySchema.safeParse(
        Object.fromEntries(searchParams)
      );

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid query parameters",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const { page, limit, status, specialty, certification, minExperience, maxExperience, search } = parseResult.data;
      const skip = (page - 1) * limit;

      const where: any = { storeId };
      
      if (status) where.status = status;
      if (specialty) where.specialty = { contains: specialty, mode: "insensitive" };
      if (certification) {
        where.certifications = {
          contains: `"${certification}"`,
        };
      }
      if (minExperience !== undefined) where.yearsOfExperience = { gte: minExperience };
      if (maxExperience !== undefined) where.yearsOfExperience = { lte: maxExperience };
      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { specialty: { contains: search, mode: "insensitive" } },
        ];
      }

      const [instructors, total] = await Promise.all([
        prisma.wellnessInstructor.findMany({
          where,
          include: {
            _count: {
              select: {
                sessions: true,
                appointments: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.wellnessInstructor.count({ where }),
      ]);

      // Calculate instructor metrics
      const instructorsWithMetrics = await Promise.all(
        instructors.map(async (instructor) => {
          // Get recent sessions and performance data
          const recentSessions = await prisma.wellnessSession.findMany({
            where: { 
              instructorId: instructor.id,
              startTime: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } // Last 90 days
            },
            include: {
              _count: { select: { attendance: true } },
            },
          });

          const totalSessions = recentSessions.length;
          const totalAttendance = recentSessions.reduce((sum, session) => sum + session._count.attendance, 0);
          const avgAttendance = totalSessions > 0 ? totalAttendance / totalSessions : 0;

          return {
            ...instructor,
            certifications: JSON.parse(instructor.certifications || "[]"),
            availability: JSON.parse(instructor.availability || "{}"),
            languages: JSON.parse(instructor.languages || '["English"]'),
            metrics: {
              totalSessions: instructor._count.sessions,
              totalAppointments: instructor._count.appointments,
              recentSessions: totalSessions,
              recentAttendance: totalAttendance,
              averageAttendance: Math.round(avgAttendance * 100) / 100,
              utilizationRate: totalSessions > 0 
                ? Math.round((totalSessions / (90 * 2)) * 10000) / 100 // Assuming 2 sessions per week target
                : 0,
            },
          };
        })
      );

      return NextResponse.json(
        {
          data: instructorsWithMetrics,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[WELLNESS_INSTRUCTORS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch instructors" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.INSTRUCTORS_MANAGE,
  async (req: NextRequest, { storeId, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const json = await req.json().catch(() => ({}));
      const parseResult = InstructorCreateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid instructor data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const body = parseResult.data;

      // Check for duplicate email
      const existingInstructor = await prisma.wellnessInstructor.findFirst({
        where: { email: body.email, storeId },
      });

      if (existingInstructor) {
        return NextResponse.json(
          { error: "Instructor with this email already exists" },
          { status: 409, headers: standardHeaders(requestId) }
        );
      }

      const instructor = await prisma.wellnessInstructor.create({
        data: {
          storeId,
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          phone: body.phone,
          bio: body.bio,
          specialty: body.specialty,
          certifications: JSON.stringify(body.certifications),
          yearsOfExperience: body.yearsOfExperience,
          hourlyRate: body.hourlyRate,
          availability: JSON.stringify(body.availability),
          languages: JSON.stringify(body.languages),
          insuranceVerified: body.insuranceVerified,
          backgroundCheckCompleted: body.backgroundCheckCompleted,
          notes: body.notes,
          status: "active",
        },
      });

      return NextResponse.json(instructor, {
        status: 201,
        headers: standardHeaders(requestId),
      });
    } catch (error: unknown) {
      logger.error("[WELLNESS_INSTRUCTORS_POST]", { error, storeId, userId: user?.id });
      return NextResponse.json(
        { error: "Failed to create instructor" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);