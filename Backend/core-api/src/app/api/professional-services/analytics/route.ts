/**
 * Professional Services Analytics API
 * GET /api/professional-services/analytics - Performance insights
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const startOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

    // Revenue growth
    const currentMonthRevenue = await prisma.invoice.aggregate({
      where: {
        paidAt: { gte: startOfMonth },
        status: "paid"
      },
      _sum: { amount: true }
    });

    const lastMonthRevenue = await prisma.invoice.aggregate({
      where: {
        paidAt: { gte: startOfLastMonth, lt: startOfMonth },
        status: "paid"
      },
      _sum: { amount: true }
    });

    const currentRevenue = currentMonthRevenue._sum.amount || 0;
    const lastRevenue = lastMonthRevenue._sum.amount || 0;
    const revenueGrowth = lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0;

    // Project success rate (on-time completion)
    const completedProjects = await prisma.project.count({
      where: {
        status: "completed"
      }
    });

    const onTimeProjects = await prisma.project.count({
      where: {
        status: "completed",
        deadline: { gte: new Date() } // Simplified - would track actual completion date
      }
    });

    const projectSuccessRate = completedProjects > 0 ? (onTimeProjects / completedProjects) * 100 : 0;

    // Average hourly rate
    const avgHourlyRate = await prisma.timeEntry.aggregate({
      _avg: { hourlyRate: true }
    });

    // Client retention rate
    const repeatClients = await prisma.client.count({
      where: {
        projects: {
          some: {}
        }
      }
    });

    const totalClients = await prisma.client.count();
    const retentionRate = totalClients > 0 ? (repeatClients / totalClients) * 100 : 0;

    // Top services by revenue
    const topServices = await prisma.project.groupBy({
      by: ["serviceType"],
      _sum: { budget: true },
      orderBy: { _sum: { budget: "desc" } },
      take: 5
    });

    const analytics = {
      revenueGrowth: parseFloat(revenueGrowth.toFixed(2)),
      projectSuccessRate: parseFloat(projectSuccessRate.toFixed(1)),
      averageHourlyRate: avgHourlyRate._avg.hourlyRate || 0,
      clientRetentionRate: parseFloat(retentionRate.toFixed(1)),
      topServices: topServices.map(s => ({
        name: s.serviceType || "General Consulting",
        revenue: s._sum.budget || 0
      }))
    };

    return NextResponse.json({ data: analytics, success: true });
  } catch (error) {
    logger.error("Failed to fetch professional services analytics", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics", success: false },
      { status: 500 }
    );
  }
}
