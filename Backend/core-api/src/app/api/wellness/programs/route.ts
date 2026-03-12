import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const ProgramQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(["active", "upcoming", "completed", "cancelled"]).optional(),
  category: z.string().optional(),
  instructorId: z.string().optional(),
  minParticipants: z.coerce.number().optional(),
  maxParticipants: z.coerce.number().optional(),
  search: z.string().optional(),
});

const ProgramCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  instructorId: z.string(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  durationWeeks: z.number().int().positive(),
  meetingSchedule: z.array(z.object({
    dayOfWeek: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]),
    time: z.string(), // HH:MM format
    duration: z.number().int().positive(), // in minutes
  })),
  location: z.string().min(1),
  maxParticipants: z.number().int().positive(),
  price: z.number().nonnegative(),
  prerequisites: z.array(z.string()).default([]),
  learningObjectives: z.array(z.string()).default([]),
  materialsProvided: z.array(z.string()).default([]),
  certificationOffered: z.boolean().default(false),
  notes: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.PROGRAMS_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      const parseResult = ProgramQuerySchema.safeParse(
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

      const { page, limit, status, category, instructorId, minParticipants, maxParticipants, search } = parseResult.data;
      const skip = (page - 1) * limit;

      const where: any = { storeId };
      
      if (status) where.status = status;
      if (category) where.category = { contains: category, mode: "insensitive" };
      if (instructorId) where.instructorId = instructorId;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      const [programs, total] = await Promise.all([
        prisma.wellnessProgram.findMany({
          where,
          include: {
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                specialty: true,
              },
            },
            _count: {
              select: {
                enrollments: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { startDate: "asc" },
        }),
        prisma.wellnessProgram.count({ where }),
      ]);

      // Filter by participant counts if specified
      let filteredPrograms = programs;
      if (minParticipants !== undefined || maxParticipants !== undefined) {
        filteredPrograms = programs.filter(program => {
          const participantCount = program._count.enrollments;
          return (
            (minParticipants === undefined || participantCount >= minParticipants) &&
            (maxParticipants === undefined || participantCount <= maxParticipants)
          );
        });
      }

      // Calculate program metrics
      const programsWithMetrics = filteredPrograms.map(program => {
        const participantCount = program._count.enrollments;
        const daysUntilStart = Math.ceil((program.startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        const isUpcoming = daysUntilStart > 0;
        const isInProgress = program.startDate <= new Date() && program.endDate >= new Date();
        const isCompleted = program.endDate < new Date();

        return {
          ...program,
          meetingSchedule: JSON.parse(program.meetingSchedule || "[]"),
          prerequisites: JSON.parse(program.prerequisites || "[]"),
          learningObjectives: JSON.parse(program.learningObjectives || "[]"),
          materialsProvided: JSON.parse(program.materialsProvided || "[]"),
          instructorName: `${program.instructor.firstName} ${program.instructor.lastName}`,
          participantCount,
          spotsRemaining: Math.max(0, program.maxParticipants - participantCount),
          utilizationRate: Math.round((participantCount / program.maxParticipants) * 10000) / 100,
          daysUntilStart,
          isUpcoming,
          isInProgress,
          isCompleted,
          isFull: participantCount >= program.maxParticipants,
        };
      });

      return NextResponse.json(
        {
          data: programsWithMetrics,
          meta: {
            total: filteredPrograms.length,
            page,
            limit,
            totalPages: Math.ceil(filteredPrograms.length / limit),
          },
        },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[WELLNESS_PROGRAMS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch programs" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.PROGRAMS_MANAGE,
  async (req: NextRequest, { storeId, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const json = await req.json().catch(() => ({}));
      const parseResult = ProgramCreateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid program data",
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

      // Validate dates
      const startDate = new Date(body.startDate);
      const endDate = new Date(body.endDate);
      
      if (startDate >= endDate) {
        return NextResponse.json(
          { error: "End date must be after start date" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const calculatedDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
      if (Math.abs(calculatedDuration - body.durationWeeks) > 1) {
        return NextResponse.json(
          { error: "Duration weeks mismatch with start/end dates" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const program = await prisma.wellnessProgram.create({
        data: {
          storeId,
          name: body.name,
          description: body.description,
          category: body.category,
          instructorId: body.instructorId,
          startDate,
          endDate,
          durationWeeks: body.durationWeeks,
          meetingSchedule: JSON.stringify(body.meetingSchedule),
          location: body.location,
          maxParticipants: body.maxParticipants,
          price: body.price,
          prerequisites: JSON.stringify(body.prerequisites),
          learningObjectives: JSON.stringify(body.learningObjectives),
          materialsProvided: JSON.stringify(body.materialsProvided),
          certificationOffered: body.certificationOffered,
          notes: body.notes,
          status: startDate > new Date() ? "upcoming" : "active",
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

      return NextResponse.json(program, {
        status: 201,
        headers: standardHeaders(requestId),
      });
    } catch (error: unknown) {
      logger.error("[WELLNESS_PROGRAMS_POST]", { error, storeId, userId: user?.id });
      return NextResponse.json(
        { error: "Failed to create program" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);