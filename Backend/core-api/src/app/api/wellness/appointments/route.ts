import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const AppointmentQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"]).optional(),
  clientId: z.string().optional(),
  instructorId: z.string().optional(),
  serviceType: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  location: z.string().optional(),
});

const AppointmentCreateSchema = z.object({
  clientId: z.string(),
  instructorId: z.string(),
  serviceType: z.string().min(1),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  location: z.string().min(1),
  duration: z.number().int().positive(), // in minutes
  price: z.number().nonnegative(),
  notes: z.string().optional(),
  clientPreferences: z.object({
    preferredCommunication: z.enum(["email", "sms", "phone"]).optional(),
    specialRequests: z.string().optional(),
    medicalConditions: z.string().optional(),
  }).optional(),
  reminders: z.array(z.object({
    type: z.enum(["email", "sms"]),
    timeBefore: z.number().int().positive(), // minutes before appointment
  })).default([]),
});

export const GET = withVayvaAPI(
  PERMISSIONS.APPOINTMENTS_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      const parseResult = AppointmentQuerySchema.safeParse(
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

      const { page, limit, status, clientId, instructorId, serviceType, dateFrom, dateTo, location } = parseResult.data;
      const skip = (page - 1) * limit;

      const where: any = { storeId };
      
      if (status) where.status = status;
      if (clientId) where.clientId = clientId;
      if (instructorId) where.instructorId = instructorId;
      if (serviceType) where.serviceType = { contains: serviceType, mode: "insensitive" };
      if (location) where.location = { contains: location, mode: "insensitive" };
      
      if (dateFrom || dateTo) {
        where.startTime = {};
        if (dateFrom) where.startTime.gte = new Date(dateFrom);
        if (dateTo) where.startTime.lte = new Date(dateTo);
      }

      const [appointments, total] = await Promise.all([
        prisma.wellnessAppointment.findMany({
          where,
          include: {
            client: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                specialty: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { startTime: "asc" },
        }),
        prisma.wellnessAppointment.count({ where }),
      ]);

      // Calculate appointment metrics
      const appointmentsWithMetrics = appointments.map(appointment => {
        const durationMinutes = Math.round((appointment.endTime.getTime() - appointment.startTime.getTime()) / (1000 * 60));
        const timeUntilStart = Math.ceil((appointment.startTime.getTime() - Date.now()) / (1000 * 60));
        const isUpcoming = timeUntilStart > 0;
        const isInPast = appointment.endTime < new Date();

        return {
          ...appointment,
          clientPreferences: JSON.parse(appointment.clientPreferences || "{}"),
          reminders: JSON.parse(appointment.reminders || "[]"),
          clientName: `${appointment.client.firstName} ${appointment.client.lastName}`,
          instructorName: `${appointment.instructor.firstName} ${appointment.instructor.lastName}`,
          durationMinutes,
          timeUntilStart,
          isUpcoming,
          isInPast,
          isToday: appointment.startTime.toDateString() === new Date().toDateString(),
        };
      });

      return NextResponse.json(
        {
          data: appointmentsWithMetrics,
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
      logger.error("[WELLNESS_APPOINTMENTS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch appointments" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.APPOINTMENTS_MANAGE,
  async (req: NextRequest, { storeId, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const json = await req.json().catch(() => ({}));
      const parseResult = AppointmentCreateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid appointment data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const body = parseResult.data;

      // Verify client exists
      const client = await prisma.user.findFirst({
        where: { id: body.clientId, storeId },
      });

      if (!client) {
        return NextResponse.json(
          { error: "Client not found" },
          { status: 404, headers: standardHeaders(requestId) }
        );
      }

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

      // Check for scheduling conflicts
      const conflictingAppointments = await prisma.wellnessAppointment.findMany({
        where: {
          instructorId: body.instructorId,
          status: { not: "cancelled" },
          OR: [
            {
              startTime: { lte: new Date(body.startTime) },
              endTime: { gt: new Date(body.startTime) },
            },
            {
              startTime: { lt: new Date(body.endTime) },
              endTime: { gte: new Date(body.endTime) },
            },
            {
              startTime: { gte: new Date(body.startTime) },
              endTime: { lte: new Date(body.endTime) },
            },
          ],
        },
      });

      if (conflictingAppointments.length > 0) {
        return NextResponse.json(
          { error: "Instructor is unavailable at this time" },
          { status: 409, headers: standardHeaders(requestId) }
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

      const calculatedDuration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
      if (Math.abs(calculatedDuration - body.duration) > 5) {
        return NextResponse.json(
          { error: "Duration mismatch between start/end times and specified duration" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const appointment = await prisma.wellnessAppointment.create({
        data: {
          storeId,
          clientId: body.clientId,
          instructorId: body.instructorId,
          serviceType: body.serviceType,
          startTime,
          endTime,
          location: body.location,
          duration: body.duration,
          price: body.price,
          notes: body.notes,
          clientPreferences: JSON.stringify(body.clientPreferences),
          reminders: JSON.stringify(body.reminders),
          status: "scheduled",
        },
        include: {
          client: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          instructor: {
            select: {
              firstName: true,
              lastName: true,
              specialty: true,
            },
          },
        },
      });

      return NextResponse.json(appointment, {
        status: 201,
        headers: standardHeaders(requestId),
      });
    } catch (error: unknown) {
      logger.error("[WELLNESS_APPOINTMENTS_POST]", { error, storeId, userId: user?.id });
      return NextResponse.json(
        { error: "Failed to create appointment" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);