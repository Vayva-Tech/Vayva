import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const SessionQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]).optional(),
  sessionId: z.string().optional(),
  instructorId: z.string().optional(),
  classType: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  location: z.string().optional(),
});

const SessionCreateSchema = z.object({
  classType: z.string().min(1),
  instructorId: z.string(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  capacity: z.number().int().positive(),
  location: z.string().min(1),
  description: z.string().optional(),
  difficultyLevel: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  equipmentNeeded: z.array(z.string()).default([]),
  prerequisites: z.array(z.string()).default([]),
  price: z.number().nonnegative().default(0),
  recurring: z.boolean().default(false),
  recurrencePattern: z.enum(["daily", "weekly", "monthly"]).optional(),
  endDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.SESSIONS_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      const parseResult = SessionQuerySchema.safeParse(
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

      const { page, limit, status, sessionId, instructorId, classType, dateFrom, dateTo, location } = parseResult.data;
      const skip = (page - 1) * limit;

      const where: any = { storeId };
      
      if (status) where.status = status;
      if (sessionId) where.id = sessionId;
      if (instructorId) where.instructorId = instructorId;
      if (classType) where.classType = { contains: classType, mode: "insensitive" };
      if (location) where.location = { contains: location, mode: "insensitive" };
      
      if (dateFrom || dateTo) {
        where.startTime = {};
        if (dateFrom) where.startTime.gte = new Date(dateFrom);
        if (dateTo) where.startTime.lte = new Date(dateTo);
      }

      const [sessions, total] = await Promise.all([
        prisma.wellnessSession.findMany({
          where,
          include: {
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                specialty: true,
                certifications: true,
              },
            },
            _count: {
              select: {
                attendance: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { startTime: "asc" },
        }),
        prisma.wellnessSession.count({ where }),
      ]);

      // Calculate session metrics
      const sessionsWithMetrics = sessions.map(session => {
        const attendanceCount = session._count.attendance;
        const utilizationRate = session.capacity > 0 
          ? Math.round((attendanceCount / session.capacity) * 10000) / 100
          : 0;
          
        const timeUntilStart = Math.ceil((session.startTime.getTime() - Date.now()) / (1000 * 60));
        const isUpcoming = timeUntilStart > 0;
        const isInPast = session.endTime < new Date();

        return {
          ...session,
          equipmentNeeded: JSON.parse(session.equipmentNeeded || "[]"),
          prerequisites: JSON.parse(session.prerequisites || "[]"),
          instructorName: `${session.instructor.firstName} ${session.instructor.lastName}`,
          instructorSpecialty: session.instructor.specialty,
          attendanceCount,
          utilizationRate,
          spotsRemaining: Math.max(0, session.capacity - attendanceCount),
          timeUntilStart,
          isUpcoming,
          isInPast,
          isFull: attendanceCount >= session.capacity,
        };
      });

      return NextResponse.json(
        {
          data: sessionsWithMetrics,
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
      logger.error("[WELLNESS_SESSIONS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch sessions" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.SESSIONS_MANAGE,
  async (req: NextRequest, { storeId, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const json = await req.json().catch(() => ({}));
      const parseResult = SessionCreateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid session data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const body = parseResult.data;

      // Verify instructor exists
      const instructor = await prisma.wellnessInstructor.findFirst({
        where: { id: body.instructorId, storeId },
      });

      if (!instructor) {
        return NextResponse.json(
          { error: "Instructor not found" },
          { status: 404, headers: standardHeaders(requestId) }
        );
      }

      // Validate time constraints
      const startTime = new Date(body.startTime);
      const endTime = new Date(body.endTime);
      
      if (startTime >= endTime) {
        return NextResponse.json(
          { error: "End time must be after start time" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      if (endTime.getTime() - startTime.getTime() > 24 * 60 * 60 * 1000) {
        return NextResponse.json(
          { error: "Session cannot exceed 24 hours" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const session = await prisma.wellnessSession.create({
        data: {
          storeId,
          classType: body.classType,
          instructorId: body.instructorId,
          startTime,
          endTime,
          capacity: body.capacity,
          location: body.location,
          description: body.description,
          difficultyLevel: body.difficultyLevel,
          equipmentNeeded: JSON.stringify(body.equipmentNeeded),
          prerequisites: JSON.stringify(body.prerequisites),
          price: body.price,
          recurring: body.recurring,
          recurrencePattern: body.recurrencePattern,
          endDate: body.endDate ? new Date(body.endDate) : null,
          notes: body.notes,
          status: "scheduled",
        },
        include: {
          instructor: {
            select: {
              firstName: true,
              lastName: true,
              specialty: true,
            },
          },
        },
      });

      return NextResponse.json(session, {
        status: 201,
        headers: standardHeaders(requestId),
      });
    } catch (error: unknown) {
      logger.error("[WELLNESS_SESSIONS_POST]", { error, storeId, userId: user?.id });
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);