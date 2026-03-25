import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export const GET = withVayvaAPI(
  PERMISSIONS.ANALYTICS_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      const period = searchParams.get('period') || 'month'; // day, week, month, quarter, year
      const _comparePeriod = searchParams.get('compare') === 'true';
      
      // Calculate date ranges
      const now = new Date();
      let startDate: Date, comparisonStartDate: Date, comparisonEndDate: Date;
      
      switch (period) {
        case 'day':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          comparisonStartDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
          comparisonEndDate = startDate;
          break;
        case 'week': {
          const dayOfWeek = now.getDay();
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
          comparisonStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
          comparisonEndDate = startDate;
          break;
        }
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          comparisonStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          comparisonEndDate = startDate;
          break;
        case 'quarter': {
          const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
          startDate = new Date(now.getFullYear(), quarterStartMonth, 1);
          comparisonStartDate = new Date(now.getFullYear(), quarterStartMonth - 3, 1);
          comparisonEndDate = startDate;
          break;
        }
        case 'year':
        default:
          startDate = new Date(now.getFullYear(), 0, 1);
          comparisonStartDate = new Date(now.getFullYear() - 1, 0, 1);
          comparisonEndDate = startDate;
          break;
      }

      // Fetch all required data in parallel
      const [
        revenueData,
        membershipData,
        sessionData,
        appointmentData,
        instructorData,
        equipmentData,
        reviewData
      ] = await Promise.all([
        this.getRevenueAnalytics(storeId, startDate, now, comparisonStartDate, comparisonEndDate),
        this.getMembershipAnalytics(storeId, startDate, now),
        this.getSessionAnalytics(storeId, startDate, now),
        this.getAppointmentAnalytics(storeId, startDate, now),
        this.getInstructorAnalytics(storeId, startDate, now),
        this.getEquipmentAnalytics(storeId, startDate, now),
        this.getReviewAnalytics(storeId, startDate, now),
      ]);

      // Combine all analytics
      const analytics = {
        period,
        timeframe: {
          current: { start: startDate, end: now },
          previous: { start: comparisonStartDate, end: comparisonEndDate },
        },
        overview: {
          totalRevenue: revenueData.current,
          revenueChange: revenueData.change,
          revenueChangePercent: revenueData.changePercent,
          activeMemberships: membershipData.active,
          membershipGrowth: membershipData.growth,
          totalSessions: sessionData.total,
          sessionUtilization: sessionData.utilization,
          totalAppointments: appointmentData.total,
          appointmentCompletion: appointmentData.completion,
        },
        financial: {
          revenue: revenueData,
          membershipRevenue: membershipData.revenue,
          sessionRevenue: sessionData.revenue,
          appointmentRevenue: appointmentData.revenue,
        },
        operational: {
          memberships: membershipData,
          sessions: sessionData,
          appointments: appointmentData,
          instructors: instructorData,
          equipment: equipmentData,
        },
        customer: {
          reviews: reviewData,
          satisfactionScore: reviewData.averageRating,
          recommendationRate: reviewData.recommendationRate,
        },
        trends: await this.generateTrends(storeId, period),
        insights: this.generateInsights(revenueData, membershipData, sessionData, appointmentData, instructorData),
      };

      return NextResponse.json(
        { data: analytics },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[WELLNESS_ANALYTICS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch analytics" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

// Revenue analytics
async function _getRevenueAnalytics(storeId: string, startDate: Date, endDate: Date, compStart: Date, compEnd: Date) {
  const [currentRevenue, previousRevenue] = await Promise.all([
    prisma.wellnessMembership.aggregate({
      where: {
        storeId,
        createdAt: { gte: startDate, lte: endDate },
      },
      _sum: { price: true },
    }),
    prisma.wellnessMembership.aggregate({
      where: {
        storeId,
        createdAt: { gte: compStart, lte: compEnd },
      },
      _sum: { price: true },
    }),
  ]);

  const current = currentRevenue._sum.price || 0;
  const previous = previousRevenue._sum.price || 0;
  const change = current - previous;
  const changePercent = previous > 0 ? Math.round((change / previous) * 10000) / 100 : 0;

  return { current, previous, change, changePercent };
}

// Membership analytics
async function _getMembershipAnalytics(storeId: string, startDate: Date, endDate: Date) {
  const [activeCount, newCount, revenue] = await Promise.all([
    prisma.wellnessMembership.count({
      where: { storeId, status: "active" },
    }),
    prisma.wellnessMembership.count({
      where: { 
        storeId, 
        createdAt: { gte: startDate, lte: endDate },
      },
    }),
    prisma.wellnessMembership.aggregate({
      where: {
        storeId,
        createdAt: { gte: startDate, lte: endDate },
      },
      _sum: { price: true },
    }),
  ]);

  return {
    active: activeCount,
    new: newCount,
    revenue: revenue._sum.price || 0,
    growth: newCount, // Simplified growth metric
  };
}

// Session analytics
async function _getSessionAnalytics(storeId: string, startDate: Date, endDate: Date) {
  const sessions = await prisma.wellnessSession.findMany({
    where: {
      storeId,
      startTime: { gte: startDate, lte: endDate },
    },
    include: {
      _count: { select: { attendance: true } },
    },
  });

  const total = sessions.length;
  const totalCapacity = sessions.reduce((sum, s) => sum + s.capacity, 0);
  const totalAttendance = sessions.reduce((sum, s) => sum + s._count.attendance, 0);
  const utilization = totalCapacity > 0 ? Math.round((totalAttendance / totalCapacity) * 10000) / 100 : 0;
  
  const revenue = sessions.reduce((sum, s) => sum + (s.price * s._count.attendance), 0);

  return {
    total,
    utilization,
    revenue: Math.round(revenue * 100) / 100,
    averageAttendance: total > 0 ? Math.round(totalAttendance / total * 100) / 100 : 0,
  };
}

// Appointment analytics
async function _getAppointmentAnalytics(storeId: string, startDate: Date, endDate: Date) {
  const appointments = await prisma.wellnessAppointment.findMany({
    where: {
      storeId,
      startTime: { gte: startDate, lte: endDate },
    },
  });

  const total = appointments.length;
  const completed = appointments.filter(a => a.status === "completed").length;
  const completionRate = total > 0 ? Math.round((completed / total) * 10000) / 100 : 0;
  
  const revenue = appointments.filter(a => a.status === "completed")
    .reduce((sum, a) => sum + a.price, 0);

  return {
    total,
    completed,
    completion: completionRate,
    revenue: Math.round(revenue * 100) / 100,
  };
}

// Instructor analytics
async function _getInstructorAnalytics(storeId: string, startDate: Date, endDate: Date) {
  const instructors = await prisma.wellnessInstructor.findMany({
    where: { storeId, status: "active" },
    include: {
      _count: {
        select: {
          sessions: {
            where: { startTime: { gte: startDate, lte: endDate } },
          },
          appointments: {
            where: { startTime: { gte: startDate, lte: endDate } },
          },
        },
      },
    },
  });

  const total = instructors.length;
  const active = instructors.filter(i => i._count.sessions > 0 || i._count.appointments > 0).length;
  const utilization = total > 0 ? Math.round((active / total) * 10000) / 100 : 0;

  return {
    total,
    active,
    utilization,
    averageSessions: Math.round(instructors.reduce((sum, i) => sum + i._count.sessions, 0) / total * 100) / 100,
  };
}

// Equipment analytics
async function _getEquipmentAnalytics(storeId: string, startDate: Date, endDate: Date) {
  const [total, maintenanceCount] = await Promise.all([
    prisma.wellnessEquipment.count({ where: { storeId } }),
    prisma.wellnessEquipmentMaintenance.count({
      where: {
        storeId,
        date: { gte: startDate, lte: endDate },
      },
    }),
  ]);

  return {
    total,
    maintenanceRecords: maintenanceCount,
    maintenanceRate: total > 0 ? Math.round((maintenanceCount / total) * 10000) / 100 : 0,
  };
}

// Review analytics
async function _getReviewAnalytics(storeId: string, startDate: Date, endDate: Date) {
  const reviews = await prisma.wellnessReview.findMany({
    where: {
      storeId,
      createdAt: { gte: startDate, lte: endDate },
    },
  });

  const total = reviews.length;
  const averageRating = total > 0 
    ? Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / total * 100) / 100
    : 0;
  const recommendationRate = total > 0 
    ? Math.round(reviews.filter(r => r.wouldRecommend).length / total * 10000) / 100
    : 0;

  return {
    total,
    averageRating,
    recommendationRate,
    ratingDistribution: reviews.reduce((acc: Record<number, number>, r) => {
      acc[r.rating] = (acc[r.rating] || 0) + 1;
      return acc;
    }, {}),
  };
}

// Generate trends data
async function _generateTrends(_storeId: string, _period: string) {
  // Mock trend data - would connect to actual time-series data
  return {
    revenue: [12500, 13200, 14100, 13800, 15200],
    memberships: [85, 87, 92, 89, 95],
    sessions: [120, 125, 132, 128, 140],
    satisfaction: [4.2, 4.3, 4.4, 4.3, 4.5],
  };
}

// Generate business insights
function _generateInsights(revenue: any, memberships: any, sessions: any, appointments: any, instructors: any): string[] {
  const insights: string[] = [];
  
  if (revenue.changePercent > 10) {
    insights.push("Strong revenue growth - consider expanding popular services");
  } else if (revenue.changePercent < -5) {
    insights.push("Revenue declining - investigate pricing or service quality issues");
  }
  
  if (memberships.utilization < 60) {
    insights.push("Low membership utilization - promote member engagement activities");
  }
  
  if (sessions.utilization > 90) {
    insights.push("High session demand - consider adding more classes or instructors");
  }
  
  if (appointments.completion < 85) {
    insights.push("Appointment completion rate below 85% - review cancellation policies");
  }
  
  if (instructors.utilization < 70) {
    insights.push("Underutilized instructors - optimize scheduling or offer additional training");
  }
  
  return insights.length > 0 ? insights : ["Business metrics looking healthy - maintain current operations"];
}