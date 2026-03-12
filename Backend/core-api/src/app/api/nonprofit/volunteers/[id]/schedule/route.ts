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

    // Parse availability from volunteer record
    const availability = JSON.parse(volunteer.availability || "{}");

    // Get upcoming scheduled activities (would integrate with calendar system)
    const today = new Date();
    const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Mock upcoming schedule data
    const mockSchedule = [
      {
        id: "sch_1",
        title: "Community Outreach Event",
        date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
        startTime: "09:00",
        endTime: "12:00",
        location: "Community Center",
        requiredSkills: ["Outreach", "Communication"],
        status: "confirmed",
      },
      {
        id: "sch_2",
        title: "Fundraising Phone Bank",
        date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        startTime: "14:00",
        endTime: "17:00",
        location: "Office",
        requiredSkills: ["Phone Skills", "Fundraising"],
        status: "pending_confirmation",
      }
    ];

    // Get volunteer's upcoming commitments
    const upcomingHours = await prisma.nonprofitVolunteerHour.findMany({
      where: {
        volunteerId: id,
        date: {
          gte: today,
          lte: next30Days,
        },
      },
      include: {
        project: {
          select: {
            name: true,
            description: true,
          },
        },
      },
      orderBy: { date: "asc" },
    });

    // Availability analysis
    const availableDays = Object.entries(availability)
      .filter(([, isAvailable]) => isAvailable)
      .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1));

    // Skill matching opportunities
    const volunteerSkills = JSON.parse(volunteer.skills || "[]");
    const mockOpportunities = [
      {
        id: "opp_1",
        title: "Grant Writing Workshop",
        description: "Help prepare grant applications",
        requiredSkills: ["Writing", "Research"],
        matchScore: volunteerSkills.includes("Writing") && volunteerSkills.includes("Research") ? 100 : 50,
        date: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000),
      },
      {
        id: "opp_2",
        title: "Social Media Management",
        description: "Manage organization's social media accounts",
        requiredSkills: ["Social Media", "Content Creation"],
        matchScore: volunteerSkills.some((skill: string) => ["Social Media", "Content Creation"].includes(skill)) ? 75 : 25,
        date: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000),
      }
    ].sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json(
      {
        data: {
          volunteerId: id,
          volunteerName: `${volunteer.firstName} ${volunteer.lastName}`,
          availability: {
            weeklyPattern: availableDays,
            raw: availability,
          },
          schedule: {
            upcomingActivities: mockSchedule,
            committedHours: upcomingHours,
            next30DaysTotal: upcomingHours.reduce((sum, h) => sum + h.hours, 0),
          },
          opportunities: {
            skillMatched: mockOpportunities,
            totalAvailable: mockOpportunities.length,
            highMatchCount: mockOpportunities.filter(o => o.matchScore >= 75).length,
          },
          recommendations: this.generateScheduleRecommendations(availableDays, volunteerSkills, upcomingHours.length),
        },
      },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[NONPROFIT_VOLUNTEER_SCHEDULE_GET]", { error, volunteerId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch volunteer schedule" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}

// Generate personalized scheduling recommendations
function generateScheduleRecommendations(availableDays: string[], skills: string[], upcomingCommitments: number): string[] {
  const recommendations: string[] = [];
  
  if (availableDays.length === 0) {
    recommendations.push("No availability specified - please update your availability preferences");
  } else if (availableDays.length <= 2) {
    recommendations.push(`Limited availability (${availableDays.join(', ')}) - consider expanding available days`);
  }
  
  if (skills.length === 0) {
    recommendations.push("No skills listed - add your skills to receive better opportunity matching");
  }
  
  if (upcomingCommitments === 0) {
    recommendations.push("No upcoming commitments - browse available opportunities");
  } else if (upcomingCommitments > 10) {
    recommendations.push("High commitment level - ensure adequate rest between activities");
  }
  
  if (availableDays.includes("Saturday") || availableDays.includes("Sunday")) {
    recommendations.push("Weekend availability is valuable for community events");
  }
  
  return recommendations.length > 0 ? recommendations : ["Availability looks good - keep up the great work!"];
}