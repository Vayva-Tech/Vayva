import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = params;
    
    // Extract storeId from request context
    const storeId = "test-store-id"; // Placeholder

    const volunteer = await prisma.nonprofitVolunteer.findFirst({
      where: { id, storeId },
      include: {
        hours: {
          select: {
            id: true,
            hours: true,
            activity: true,
            date: true,
            notes: true,
            project: {
              select: {
                name: true,
              },
            },
          },
          orderBy: { date: "desc" },
          take: 50,
        },
        assignedProjects: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            status: true,
          },
          take: 10,
        },
      },
    });

    if (!volunteer) {
      return NextResponse.json(
        { error: "Volunteer not found" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    // Calculate volunteer metrics
    const totalHours = volunteer.hours.reduce((sum, h) => sum + h.hours, 0);
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    
    const monthlyHours = volunteer.hours.filter(h => {
      const date = new Date(h.date);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    }).reduce((sum, h) => sum + h.hours, 0);

    const lastActivity = volunteer.hours[0]?.date;
    const daysSinceLastActivity = lastActivity 
      ? Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // Parse JSON fields
    const volunteerWithMetrics = {
      ...volunteer,
      skills: JSON.parse(volunteer.skills || "[]"),
      interests: JSON.parse(volunteer.interests || "[]"),
      availability: JSON.parse(volunteer.availability || "{}"),
      emergencyContact: JSON.parse(volunteer.emergencyContact || "{}"),
      metrics: {
        totalHours,
        monthlyHours,
        hoursThisYear: volunteer.hours.filter(h => new Date(h.date).getFullYear() === thisYear).reduce((sum, h) => sum + h.hours, 0),
        daysSinceLastActivity,
        projectCount: volunteer.assignedProjects.length,
        averageHoursPerActivity: volunteer.hours.length > 0 ? Math.round((totalHours / volunteer.hours.length) * 100) / 100 : 0,
      },
    };

    return NextResponse.json(
      { data: volunteerWithMetrics },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[NONPROFIT_VOLUNTEER_GET]", { error, volunteerId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch volunteer" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}