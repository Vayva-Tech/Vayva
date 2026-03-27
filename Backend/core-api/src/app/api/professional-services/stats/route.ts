/**
 * Professional Services Dashboard Stats API
 * GET /api/professional-services/stats - Dashboard statistics
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    // Total revenue (from paid invoices)
    const revenuePromise = prisma.invoice.aggregate({
      where: {
        paidAt: { gte: startOfMonth },
        status: "paid"
      },
      _sum: { amount: true },
      _count: true
    });

    // Active projects count
    const activeProjectsPromise = prisma.project.count({
      where: {
        status: "active"
      }
    });

    // Pending invoices amount
    const pendingInvoicesPromise = prisma.invoice.aggregate({
      where: {
        status: { in: ["sent", "draft"] }
      },
      _sum: { amount: true }
    });

    // Team utilization (average)
    const teamUtilizationPromise = prisma.teamMember.aggregate({
      _avg: { utilizationRate: true }
    });

    // Win rate (proposals accepted / total)
    const proposalsPromise = prisma.proposal.count();
    const acceptedProposalsPromise = prisma.proposal.count({
      where: {
        status: "accepted"
      }
    });

    // Average project value
    const avgProjectValuePromise = prisma.project.aggregate({
      _avg: { budget: true }
    });

    // Total clients
    const totalClientsPromise = prisma.client.count();

    // Outstanding balance
    const outstandingBalancePromise = prisma.invoice.aggregate({
      where: {
        status: { in: ["sent", "overdue"] }
      },
      _sum: { amount: true }
    });

    const [revenueData, activeProjects, pendingInvoices, teamUtil, totalProposals, acceptedProposals, avgProject, totalClients, outstandingBalance] = await Promise.all([
      revenuePromise,
      activeProjectsPromise,
      pendingInvoicesPromise,
      teamUtilizationPromise,
      proposalsPromise,
      acceptedProposalsPromise,
      avgProjectValuePromise,
      totalClientsPromise,
      outstandingBalancePromise
    ]);

    const stats = {
      totalRevenue: revenueData._sum.amount || 0,
      activeProjects: activeProjects,
      pendingInvoices: pendingInvoices._sum.amount || 0,
      teamUtilization: Math.round(teamUtil._avg.utilizationRate || 0),
      winRate: totalProposals > 0 ? parseFloat(((acceptedProposals / totalProposals) * 100).toFixed(1)) : 0,
      averageProjectValue: avgProject._avg.budget || 0,
      totalClients: totalClients,
      outstandingBalance: outstandingBalance._sum.amount || 0
    };

    return NextResponse.json({ data: stats, success: true });
  } catch (error) {
    logger.error("Failed to fetch professional services stats", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics", success: false },
      { status: 500 }
    );
  }
}
