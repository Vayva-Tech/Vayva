import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

interface AggregateMetrics {
  mrr: {
    current: number;
    previousMonth: number;
    growth: number;
  };
  arr: {
    current: number;
    growth: number;
  };
  churnRate: {
    current: number;
    previousMonth: number;
    trend: "up" | "down";
  };
  activeSubscriptions: number;
  activeTenants: number;
  ltv: {
    average: number;
    growth: number;
  };
  platformStats: {
    uptime: number;
    supportTickets: number;
    newTrialsToday: number;
    conversionsToday: number;
  };
}

export const GET = withVayvaAPI(
  PERMISSIONS.TEAM_VIEW,
  async (request: NextRequest, { storeId }: APIContext) => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = startOfMonth;

      // Get all active subscriptions
      const activeSubscriptions = await prisma.subscription.findMany({
        where: {
          storeId,
          status: { in: ["active", "trialing"] },
        },
        include: {
          tenant: true,
          plan: true,
        },
      });

      // Calculate MRR for current month
      const currentMRR = activeSubscriptions.reduce((acc, sub) => {
        return acc + (sub.price || 0);
      }, 0);

      // Calculate MRR for previous month
      const previousMonthSubscriptions = await prisma.subscription.findMany({
        where: {
          storeId,
          status: { in: ["active", "trialing"] },
          createdAt: { lt: startOfMonth },
        },
      });

      const previousMonthMRR = previousMonthSubscriptions.reduce((acc, sub) => {
        return acc + (sub.price || 0);
      }, 0);

      const mrrGrowth = previousMonthMRR > 0 
        ? ((currentMRR - previousMonthMRR) / previousMonthMRR) * 100 
        : 0;

      // Calculate ARR
      const currentARR = currentMRR * 12;
      const arrGrowth = mrrGrowth;

      // Calculate churn rate (simplified - subscriptions cancelled this month)
      const churnedThisMonth = await prisma.subscription.count({
        where: {
          storeId,
          status: "cancelled",
          updatedAt: { gte: startOfMonth },
        },
      });

      const churnedLastMonth = await prisma.subscription.count({
        where: {
          storeId,
          status: "cancelled",
          updatedAt: { gte: startOfLastMonth, lt: startOfMonth },
        },
      });

      const totalActive = activeSubscriptions.length;
      const currentChurnRate = totalActive > 0 
        ? (churnedThisMonth / (totalActive + churnedThisMonth)) * 100 
        : 0;
      
      const previousChurnRate = totalActive > 0
        ? (churnedLastMonth / (totalActive + churnedLastMonth)) * 100
        : 0;

      // Count active tenants
      const activeTenants = await prisma.tenant.count({
        where: {
          storeId,
          status: "active",
        },
      });

      // Calculate LTV (simplified: average subscription value / churn rate)
      const avgSubscriptionValue = totalActive > 0 ? currentMRR / totalActive : 0;
      const avgLifespanMonths = currentChurnRate > 0 ? 1 / (currentChurnRate / 100) : 12;
      const averageLTV = avgSubscriptionValue * avgLifespanMonths;
      const ltvGrowth = mrrGrowth; // Simplified correlation

      // Platform stats
      const supportTickets = await prisma.supportTicket.count({
        where: {
          storeId,
          status: { in: ["open", "pending"] },
        },
      });

      const newTrialsToday = await prisma.subscription.count({
        where: {
          storeId,
          status: "trialing",
          createdAt: { gte: new Date(now.setHours(0, 0, 0, 0)) },
        },
      });

      const conversionsToday = await prisma.subscription.count({
        where: {
          storeId,
          status: "active",
          createdAt: { gte: new Date(now.setHours(0, 0, 0, 0)) },
        },
      });

      // Uptime (placeholder - would integrate with monitoring service)
      const uptime = 99.98;

      const metrics: AggregateMetrics = {
        mrr: {
          current: Math.round(currentMRR),
          previousMonth: Math.round(previousMonthMRR),
          growth: Math.round(mrrGrowth * 10) / 10,
        },
        arr: {
          current: Math.round(currentARR),
          growth: Math.round(arrGrowth * 10) / 10,
        },
        churnRate: {
          current: Math.round(currentChurnRate * 10) / 10,
          previousMonth: Math.round(previousChurnRate * 10) / 10,
          trend: currentChurnRate <= previousChurnRate ? "down" : "up",
        },
        activeSubscriptions: totalActive,
        activeTenants,
        ltv: {
          average: Math.round(averageLTV),
          growth: Math.round(ltvGrowth * 10) / 10,
        },
        platformStats: {
          uptime,
          supportTickets,
          newTrialsToday,
          conversionsToday,
        },
      };

      return NextResponse.json({ metrics }, {
        headers: { "Cache-Control": "no-store" },
      });
    } catch (error: unknown) {
      logger.error("[SAAS_DASHBOARD_AGGREGATE_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch aggregate metrics" },
        { status: 500 }
      );
    }
  }
);
