import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const HoursLogSchema = z.object({
  hours: z.number().positive(),
  activity: z.string().min(1),
  date: z.string().datetime(),
  projectId: z.string().optional(),
  notes: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.VOLUNTEERS_VIEW,
  async (req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    let volunteerIdForLog = "";
    try {
      const { id } = await params;
      volunteerIdForLog = id;
      const { searchParams } = new URL(req.url);

      const volunteer = await prisma.nonprofitVolunteer.findFirst({
        where: { id, storeId },
      });

      if (!volunteer) {
        return NextResponse.json(
          { error: "Volunteer not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      const startDateParam = searchParams.get("startDate");
      const endDateParam = searchParams.get("endDate");
      const activityFilter = searchParams.get("activity");

      let dateRange: { gte?: Date; lte?: Date } | undefined;
      if (startDateParam) dateRange = { ...dateRange, gte: new Date(startDateParam) };
      if (endDateParam) dateRange = { ...dateRange, lte: new Date(endDateParam) };

      const where = {
        volunteerId: id,
        storeId,
        ...(dateRange ? { date: dateRange } : {}),
        ...(activityFilter
          ? { activity: { contains: activityFilter, mode: "insensitive" as const } }
          : {}),
      };

      const [hours, total] = await Promise.all([
        prisma.nonprofitVolunteerHour.findMany({
          where,
          include: {
            project: {
              select: {
                name: true,
                description: true,
              },
            },
          },
          orderBy: { date: "desc" },
          take: 100,
        }),
        prisma.nonprofitVolunteerHour.count({ where }),
      ]);

      const totalHours = hours.reduce((sum, h) => sum + h.hours, 0);
      const averageHours = hours.length > 0 ? totalHours / hours.length : 0;

      const activitySummary: Record<string, { count: number; hours: number }> =
        {};
      hours.forEach((hour) => {
        if (!activitySummary[hour.activity]) {
          activitySummary[hour.activity] = { count: 0, hours: 0 };
        }
        activitySummary[hour.activity].count += 1;
        activitySummary[hour.activity].hours += hour.hours;
      });

      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      const monthlyBreakdown = hours
        .filter((h) => h.date >= twelveMonthsAgo)
        .reduce((acc: Record<string, number>, hour) => {
          const monthKey = hour.date.toISOString().slice(0, 7);
          acc[monthKey] = (acc[monthKey] || 0) + hour.hours;
          return acc;
        }, {});

      return NextResponse.json(
        {
          data: {
            volunteerId: id,
            volunteerName: `${volunteer.firstName} ${volunteer.lastName}`,
            hours,
            summary: {
              totalRecords: total,
              totalHours: Math.round(totalHours * 100) / 100,
              averageHoursPerSession: Math.round(averageHours * 100) / 100,
              activityTypes: Object.keys(activitySummary).length,
            },
            activityBreakdown: activitySummary,
            monthlyBreakdown,
          },
        },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      logger.error("[NONPROFIT_VOLUNTEER_HOURS_GET]", {
        error,
        volunteerId: volunteerIdForLog,
      });
      return NextResponse.json(
        { error: "Failed to fetch volunteer hours" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);

export const POST = withVayvaAPI(
  PERMISSIONS.VOLUNTEERS_MANAGE,
  async (req: NextRequest, { params, storeId, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    let volunteerIdForLog = "";
    try {
      const { id } = await params;
      volunteerIdForLog = id;
      const json = await req.json().catch(() => ({}));
      const parseResult = HoursLogSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid hours data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      const body = parseResult.data;

      const volunteer = await prisma.nonprofitVolunteer.findFirst({
        where: { id, storeId },
      });

      if (!volunteer) {
        return NextResponse.json(
          { error: "Volunteer not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      if (body.projectId) {
        const project = await prisma.nonprofitProject.findFirst({
          where: { id: body.projectId, storeId },
        });

        if (!project) {
          return NextResponse.json(
            { error: "Project not found" },
            { status: 404, headers: standardHeaders(requestId) },
          );
        }
      }

      const hoursRecord = await prisma.nonprofitVolunteerHour.create({
        data: {
          storeId,
          volunteerId: id,
          hours: body.hours,
          activity: body.activity,
          date: new Date(body.date),
          projectId: body.projectId,
          notes: body.notes,
        },
        include: {
          project: {
            select: {
              name: true,
            },
          },
        },
      });

      return NextResponse.json(hoursRecord, {
        status: 201,
        headers: standardHeaders(requestId),
      });
    } catch (error: unknown) {
      logger.error("[NONPROFIT_VOLUNTEER_HOURS_POST]", {
        error,
        volunteerId: volunteerIdForLog,
        storeId,
        userId: user?.id,
      });
      return NextResponse.json(
        { error: "Failed to log volunteer hours" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
