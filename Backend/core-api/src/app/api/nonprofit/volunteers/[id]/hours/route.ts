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

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);
    
    // Extract storeId from request context
    const storeId = "test-store-id"; // Placeholder

    // Verify volunteer exists
    const volunteer = await prisma.nonprofitVolunteer.findFirst({
      where: { id, storeId },
    });

    if (!volunteer) {
      return NextResponse.json(
        { error: "Volunteer not found" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    // Parse date filters
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const activityFilter = searchParams.get('activity');

    const where: any = { volunteerId: id };
    
    if (startDateParam) where.date = { ...where.date, gte: new Date(startDateParam) };
    if (endDateParam) where.date = { ...where.date, lte: new Date(endDateParam) };
    if (activityFilter) where.activity = { contains: activityFilter, mode: "insensitive" };

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

    // Calculate summary statistics
    const totalHours = hours.reduce((sum, h) => sum + h.hours, 0);
    const averageHours = hours.length > 0 ? totalHours / hours.length : 0;

    // Group by activity type
    const activitySummary: Record<string, { count: number; hours: number }> = {};
    hours.forEach(hour => {
      if (!activitySummary[hour.activity]) {
        activitySummary[hour.activity] = { count: 0, hours: 0 };
      }
      activitySummary[hour.activity].count += 1;
      activitySummary[hour.activity].hours += hour.hours;
    });

    // Monthly breakdown for the past 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
    const monthlyBreakdown = hours
      .filter(h => h.date >= twelveMonthsAgo)
      .reduce((acc: Record<string, number>, hour) => {
        const monthKey = hour.date.toISOString().slice(0, 7); // YYYY-MM
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
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[NONPROFIT_VOLUNTEER_HOURS_GET]", { error, volunteerId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch volunteer hours" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}

export const POST = withVayvaAPI(
  PERMISSIONS.VOLUNTEERS_MANAGE,
  async (req: NextRequest, { params, storeId, user, correlationId }: APIContext & { params: { id: string } }) => {
    const requestId = correlationId;
    try {
      const { id } = params;
      const json = await req.json().catch(() => ({}));
      const parseResult = HoursLogSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid hours data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const body = parseResult.data;

      // Verify volunteer exists
      const volunteer = await prisma.nonprofitVolunteer.findFirst({
        where: { id, storeId },
      });

      if (!volunteer) {
        return NextResponse.json(
          { error: "Volunteer not found" },
          { status: 404, headers: standardHeaders(requestId) }
        );
      }

      // Verify project exists if provided
      if (body.projectId) {
        const project = await prisma.nonprofitProject.findFirst({
          where: { id: body.projectId, storeId },
        });
        
        if (!project) {
          return NextResponse.json(
            { error: "Project not found" },
            { status: 404, headers: standardHeaders(requestId) }
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
      logger.error("[NONPROFIT_VOLUNTEER_HOURS_POST]", { error, volunteerId: params.id, storeId, userId: user?.id });
      return NextResponse.json(
        { error: "Failed to log volunteer hours" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);